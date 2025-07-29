
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/lib/messages';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/lib/users';
import { sendEmail } from '@/lib/email';

const getBlobStore = (name: 'users' | 'messages' | 'images'): Store => {
    return getStore({
        name,
        consistency: 'strong',
        siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
        token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
    });
};

async function findUserByKey(store: Store, userKey: string): Promise<UserProfile | null> {
    try {
        const user = await store.get(userKey, { type: 'json' });
        return user as UserProfile;
    } catch (e) {
        // User not found by this key
        return null;
    }
}

async function findUserById(userStore: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    const { blobs } = await userStore.list({ cache: 'no-store' });
    for (const blob of blobs) {
      try {
        const user = await userStore.get(blob.key, { type: 'json' });
        if (user.id === userId) {
          return { key: blob.key, user };
        }
      } catch (e) {
        console.warn(`Could not parse blob ${blob.key} as JSON.`);
      }
    }
    return null;
}

// GET messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const otherUserId = params.conversationId;
  const currentUserId = request.headers.get('x-user-id');

  if (!currentUserId || !otherUserId) {
    return NextResponse.json({ message: 'User IDs are required' }, { status: 400 });
  }

  const conversationId = [currentUserId, otherUserId].sort().join('--');
  const store = getBlobStore('messages');
  try {
    const messagesData = await store.get(conversationId, { type: 'json' });
    return NextResponse.json(messagesData?.messages || []);
  } catch (error) {
    // This is expected if the conversation doesn't exist yet, return empty array.
    return NextResponse.json([]);
  }
}

// POST a new message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
    const otherUserId = params.conversationId;
    if (!otherUserId) {
        return NextResponse.json({ message: 'Recipient User ID is required' }, { status: 400 });
    }

    try {
        const formData = await request.formData();
        const senderId = formData.get('senderId') as string;
        const text = formData.get('text') as string;
        const imageFile = formData.get('image') as File | null;
        
        if (!senderId) {
            return NextResponse.json({ message: 'Sender ID is required' }, { status: 400 });
        }
        
        if (!text && !imageFile) {
            return NextResponse.json({ message: 'Message text or image is required' }, { status: 400 });
        }

        const userStore = getBlobStore('users');
        const messagesStore = getBlobStore('messages');
        const imageStore = getBlobStore('images');
        
        // Fetch sender and recipient profiles
        const senderResult = await findUserById(userStore, senderId);
        const recipientResult = await findUserById(userStore, otherUserId);

        if (!senderResult || !recipientResult) {
            return NextResponse.json({ message: 'Sender or recipient not found' }, { status: 404 });
        }
        const sender = senderResult.user;
        const recipient = recipientResult.user;

        // Handle credit deduction for Sugar Daddy
        if (sender.role === 'Sugar Daddy') {
            if ((sender.credits ?? 0) <= 0) {
                return NextResponse.json({ message: 'No Credits Remaining. Please purchase more credits to send messages.' }, { status: 402 });
            }
            const updatedCredits = (sender.credits ?? 0) - 1;
            await userStore.setJSON(senderResult.key, { ...sender, credits: updatedCredits });
        }

        let imageUrl: string | undefined = undefined;
        const conversationId = [senderId, otherUserId].sort().join('--');
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
        
        // Send email notification
        await sendEmail({
            to: recipient.email,
            recipientName: recipient.name,
            subject: `You have a new message from ${sender.name}`,
            body: `You have received a new message from ${sender.name} on Sugar Connect.\n\nMessage: "${text}"`,
            callToAction: {
                text: 'Click here to reply',
                url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/messages?userId=${sender.id}`
            }
        });

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
