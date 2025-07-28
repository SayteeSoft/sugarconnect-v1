

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/lib/messages';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';
import { mockConversations } from '@/lib/mock-messages';
import { generateReply } from '@/ai/flows/generate-reply';

const getMessagesStore = (): Store => {
    return getStore(process.env.NETLIFY ? 'messages' : { name: 'messages', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
};

const getImageStore = (): Store => {
    return getStore(process.env.NETLIFY ? 'images' : { name: 'images', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
};

const getUsersStore = (): Store => {
    return getStore(process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
};


export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;
  if (!conversationId) {
    return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
  }
  
  // Check if it's a mock conversation for the admin
  const adminUser = mockUsers.find(u => u.email === 'saytee.software@gmail.com');
  const mockConversation = mockConversations.find(mc => 
      mc.conversationId === conversationId && 
      mc.participants.some(p => p.id === adminUser?.id)
  );
  
  if (mockConversation) {
    return NextResponse.json(mockConversation.messages);
  }

  const store = getMessagesStore();
  try {
    const messagesData = await store.get(conversationId, { type: 'json' });
    return NextResponse.json(messagesData?.messages || []);
  } catch (error) {
    // If conversation doesn't exist, return an empty array
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

        const messagesStore = getMessagesStore();
        const imageStore = getImageStore();
        
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
            // Conversation doesn't exist, create it
            conversation = { messages: [] };
        }

        conversation.messages.push(newMessage);
        conversation.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        await messagesStore.setJSON(conversationId, conversation);
        
        const userStore = getUsersStore();
        const senderData = await findUserById(userStore, senderId);

        if (senderData?.user.role === 'Sugar Daddy' && senderData.key) {
            const updatedCredits = (senderData.user.credits || 0) - 1;
            const updatedUser = { ...senderData.user, credits: updatedCredits };
            await userStore.setJSON(senderData.key, updatedUser);
        }

        // AI Reply Logic
        const recipientId = conversationId.replace(senderId, '').replace('--', '');
        const recipientIsMock = mockUsers.some(u => u.id === recipientId);

        if (recipientIsMock) {
            const recipientProfile = mockUsers.find(u => u.id === recipientId)!;
            
            const { reply: aiReply } = await generateReply({
                conversationHistory: conversation.messages.map(m => ({ senderId: m.senderId, text: m.text })),
                responderProfile: JSON.stringify(recipientProfile),
                recipientProfile: JSON.stringify(senderData?.user),
                responderRole: recipientProfile.role as 'Sugar Daddy' | 'Sugar Baby',
            });
            
            const aiMessage: Message = {
                id: uuidv4(),
                conversationId,
                senderId: recipientId,
                text: aiReply,
                timestamp: new Date(Date.now() + 1000).toISOString(), // slightly after user's message
            };
            
            conversation.messages.push(aiMessage);
            await messagesStore.setJSON(conversationId, conversation);
        }


        return NextResponse.json(newMessage, { status: 201 });

    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}


async function findUserById(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    const mockUser = mockUsers.find(u => u.id === userId);
    if (mockUser) {
        try {
            const storedUser = await store.get(mockUser.email, { type: 'json' });
            return { key: mockUser.email, user: storedUser };
        } catch (e) {
            return { key: mockUser.email, user: mockUser };
        }
    }

    // This is the fallback for non-mock users.
    // It's inefficient, but necessary if we only have the ID.
    // A better approach in a real app would be a direct lookup table (ID -> email).
    const { blobs } = await store.list();
    for (const blob of blobs) {
      try {
        const userData = await store.get(blob.key, { type: 'json' });
        if (userData.id === userId) {
          return { key: blob.key, user: userData };
        }
      } catch (e) {
        console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
      }
    }

    return null;
}

