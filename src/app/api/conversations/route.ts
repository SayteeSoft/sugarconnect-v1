

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';
import { headers } from 'next/headers'; 

async function getCurrentUser(req: NextRequest): Promise<UserProfile | null> {
    const headersList = headers();
    const userId = headersList.get('x-user-id');

    if (!userId) return null;
    
    const userStore = getStore(process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    const result = await findUserById(userStore, userId);
    return result?.user || null;
}


async function findUserById(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    const { blobs } = await store.list();
    for (const blob of blobs) {
      try {
        const user = await store.get(blob.key, { type: 'json' });
        if (user.id === userId) {
          return { key: blob.key, user };
        }
      } catch (e) {
        //
      }
    }
    return null;
}


export async function GET(request: NextRequest) {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userStore = getStore(process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    const messagesStore = getStore(process.env.NETLIFY ? 'messages' : { name: 'messages', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    
    try {
        const { blobs: userBlobs } = await userStore.list();
        
        const allUsers: UserProfile[] = [];
        for (const blob of userBlobs) {
            try {
                const user = await userStore.get(blob.key, { type: 'json' });
                allUsers.push(user);
            } catch (e) {
                //
            }
        }
        
        let potentialPartners: UserProfile[];
        if (currentUser.role === 'Sugar Daddy') {
            potentialPartners = allUsers.filter(u => u.role === 'Sugar Baby');
        } else if (currentUser.role === 'Sugar Baby') {
            potentialPartners = allUsers.filter(u => u.role === 'Sugar Daddy');
        } else { // Admin
            potentialPartners = allUsers.filter(u => u.id !== currentUser.id);
        }

        const conversations = [];

        for (const partner of potentialPartners) {
            const conversationId = [currentUser.id, partner.id].sort().join('--');
            let lastMessage: Message | null = null;

            try {
                const conversationData = await messagesStore.get(conversationId, { type: 'json' });
                if (conversationData && conversationData.messages.length > 0) {
                    lastMessage = conversationData.messages[conversationData.messages.length - 1];
                }
            } catch (error) {
                // No messages yet for this conversation, which is fine
            }
            
            conversations.push({
                user: {
                    id: partner.id,
                    name: partner.name,
                    image: partner.image,
                    role: partner.role,
                    email: partner.email,
                },
                messages: lastMessage ? [lastMessage] : [] // Only need the last message for the conversation list
            });
        }
        
        // Sort conversations by the timestamp of the last message
        conversations.sort((a, b) => {
            const timeA = a.messages.length > 0 ? new Date(a.messages[0].timestamp).getTime() : 0;
            const timeB = b.messages.length > 0 ? new Date(b.messages[0].timestamp).getTime() : 0;
            return timeB - timeA;
        });

        return NextResponse.json(conversations);

    } catch (error) {
        console.error('Failed to get conversations:', error);
        return NextResponse.json({ message: 'Failed to get conversations' }, { status: 500 });
    }
}
