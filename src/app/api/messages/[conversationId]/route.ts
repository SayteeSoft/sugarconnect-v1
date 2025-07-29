

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/lib/messages';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';
import { generateReply } from '@/ai/flows/generate-reply';
import { mockConversations } from '@/lib/mock-messages';

const getBlobStore = (name: 'users' | 'messages' | 'images'): Store => {
    return getStore({
        name,
        consistency: 'strong',
        siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id',
        token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
    });
};

async function findUserByKey(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    const mockUser = mockUsers.find(u => u.id === userId);
    if (mockUser) {
        return { key: mockUser.email, user: mockUser };
    }
    
    const { blobs } = await store.list();
    for (const blob of blobs) {
      try {
        const user = await store.get(blob.key, { type: 'json' });
        if (user.id === userId) {
          return { key: blob.key, user };
        }
      } catch (e) {
        console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
      }
    }
    return null;
}


export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;
  if (!conversationId) {
    return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
  }
  
  const mockConversation = mockConversations.find(mc => mc.conversationId === conversationId);
  
  if (mockConversation) {
    return NextResponse.json(mockConversation.messages);
  }

  const store = getBlobStore('messages');
  try {
    const messagesData = await store.get(conversationId, { type: 'json' });
    return NextResponse.json(messagesData?.messages || []);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
    const { conversationId } = params;
    if (!conversationId) {
        return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    try {
        const formData = await request.formData();
        const senderId = formData.get('senderId') as string;
        const text = formData.get('text') as string;
        const imageFile = formData.get('image') as File | null;
        
        if (!senderId) {
            return NextResponse.json({ message: 'Sender ID is required' }, { status: 400 });
        }

        const messagesStore = getBlobStore('messages');
        const imageStore = getBlobStore('images');
        
        let imageUrl: string | undefined = undefined;
        if (imageFile) {
            const imageBuffer = await imageFile.arrayBuffer();
            const imageKey = `message-${conversationId}-${uuidv4()}`;
            await imageStore.set(imageKey, imageBuffer, { metadata: { contentType: imageFile.type } });
            imageUrl = `/api/images/${imageKey}?t=${new Date().getTime()}`;
        }

        const newMessage: Message = {
            id: uuidv4(),
            conversationId,
            senderId,
            text,
            timestamp: new Date().toISOString(),
            image: imageUrl
        };
        
        let conversation: { messages: Message[] };
        try {
            conversation = await messagesStore.get(conversationId, { type: 'json' });
        } catch (error) {
            conversation = { messages: [] };
        }

        conversation.messages.push(newMessage);
        conversation.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        await messagesStore.setJSON(conversationId, conversation);
        
        const userStore = getBlobStore('users');
        const senderResult = await findUserByKey(userStore, senderId);

        if (senderResult && senderResult.user.role === 'Sugar Daddy') {
            const updatedCredits = (senderResult.user.credits || 0) - 1;
            const updatedUser = { ...senderResult.user, credits: updatedCredits };
            await userStore.setJSON(senderResult.key, updatedUser);
        }

        // AI Reply Logic
        const recipientId = conversationId.replace(senderId, '').replace('--', '');
        const recipientIsMock = mockUsers.some(u => u.id === recipientId);

        if (recipientIsMock) {
            const recipientResult = await findUserByKey(userStore, recipientId);
            
            if (recipientResult && senderResult) {
                const { reply: aiReply } = await generateReply({
                    conversationHistory: conversation.messages.map(m => ({ senderId: m.senderId, text: m.text })),
                    responderProfile: JSON.stringify(recipientResult.user),
                    recipientProfile: JSON.stringify(senderResult.user),
                    responderRole: recipientResult.user.role as 'Sugar Daddy' | 'Sugar Baby',
                });
                
                const aiMessage: Message = {
                    id: uuidv4(),
                    conversationId,
                    senderId: recipientId,
                    text: aiReply,
                    timestamp: new Date(Date.now() + 1000).toISOString(),
                };
                
                conversation.messages.push(aiMessage);
                await messagesStore.setJSON(conversationId, conversation);
            }
        }

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
