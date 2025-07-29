
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';
import { mockUsers } from '@/lib/mock-data';
import { mockConversations } from '@/lib/mock-messages';

const getBlobStore = (name: 'users' | 'messages'): Store => {
    const storeName = name;
    if (process.env.NETLIFY) {
        return getStore(storeName);
    } else {
        return getStore({
            name: storeName,
            consistency: 'strong',
            siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
            token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
        });
    }
};


async function findUserById(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    if (process.env.NODE_ENV !== 'production') {
        const mockUser = mockUsers.find(u => u.id === userId);
        if (mockUser) {
            return { key: mockUser.email, user: mockUser };
        }
    }

    const { blobs } = await store.list();
    for (const blob of blobs) {
      try {
        const userData: UserProfile = await store.get(blob.key, { type: 'json' });
        if (userData.id === userId) {
          return { key: blob.key, user: userData };
        }
      } catch (e) {
        console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
      }
    }
    return null;
}

async function getCurrentUser(req: NextRequest): Promise<UserProfile | null> {
    const userId = req.headers.get('x-user-id');
    if (!userId) return null;
    
    const userStore = getBlobStore('users');
    const result = await findUserById(userStore, userId);
    return result?.user || null;
}


export async function GET(request: NextRequest) {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userStore = getBlobStore('users');
    const messagesStore = getBlobStore('messages');
    
    try {
        let allUsers: UserProfile[] = [];

        // In production, only serve users from the blob store.
        if (process.env.NETLIFY) {
            const { blobs: userBlobs } = await userStore.list();
            for (const blob of userBlobs) {
                try {
                    const user = await userStore.get(blob.key, { type: 'json' });
                    allUsers.push(user);
                } catch (e) {
                    console.warn(`Could not parse blob ${blob.key} as JSON.`);
                }
            }
        } else {
            // In development, merge with mock users for testing.
            allUsers.push(...mockUsers);
            const { blobs: userBlobs } = await userStore.list();
            for (const blob of userBlobs) {
                try {
                    const user = await userStore.get(blob.key, { type: 'json' });
                    if (!allUsers.some(u => u.id === user.id)) {
                        allUsers.push(user);
                    }
                } catch (e) {
                    //
                }
            }
        }
        
        let potentialPartners: UserProfile[];
        if (currentUser.role === 'Admin') {
            potentialPartners = allUsers.filter(u => u.id !== currentUser.id);
        } else if (currentUser.role === 'Sugar Daddy') {
            potentialPartners = allUsers.filter(u => u.role === 'Sugar Baby');
        } else if (currentUser.role === 'Sugar Baby') {
            potentialPartners = allUsers.filter(u => u.role === 'Sugar Daddy');
        } else {
            potentialPartners = [];
        }

        const conversations = [];
        const isAdmin = currentUser.email === 'saytee.software@gmail.com';

        for (const partner of potentialPartners) {
            const conversationId = [currentUser.id, partner.id].sort().join('--');
            let lastMessage: Message | null = null;
            let hasMessages = false;
            
            const isMockConversationForAdmin = isAdmin && mockConversations.some(mc => mc.conversationId === conversationId);

            if (isMockConversationForAdmin && process.env.NODE_ENV !== 'production') {
                const mockConvo = mockConversations.find(mc => mc.conversationId === conversationId);
                if (mockConvo && mockConvo.messages.length > 0) {
                    lastMessage = mockConvo.messages[mockConvo.messages.length - 1];
                    hasMessages = true;
                }
            } else {
                 try {
                    const conversationData = await messagesStore.get(conversationId, { type: 'json' });
                    if (conversationData && conversationData.messages && conversationData.messages.length > 0) {
                        lastMessage = conversationData.messages[conversationData.messages.length - 1];
                        hasMessages = true;
                    }
                } catch (error) {
                    // No messages yet for this conversation, which is fine
                }
            }
            
            // For non-admin users, only show conversations that have messages.
            // Admin can see all potential conversations.
            if (isAdmin || hasMessages) {
                conversations.push({
                    user: {
                        id: partner.id,
                        name: partner.name,
                        image: partner.image,
                        role: partner.role,
                        email: partner.email,
                    },
                    messages: lastMessage ? [lastMessage] : []
                });
            }
        }
        
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
