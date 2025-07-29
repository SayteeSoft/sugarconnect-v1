
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';
import { mockUsers } from '@/lib/mock-data';

const getBlobStore = (name: 'users' | 'messages') => getStore({
    name,
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
    token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
});

const userCache = new Map<string, UserProfile>();

async function populateUserCache(userStore: Store) {
    if (userCache.size > 0) return;
    const { blobs: userBlobs } = await userStore.list({ cache: 'no-store' });
    for (const blob of userBlobs) {
        try {
            const user = await userStore.get(blob.key, { type: 'json' });
            if (user) {
                const { password, ...userToReturn } = user;
                userCache.set(user.id, userToReturn as UserProfile);
            }
        } catch (e) {
             console.warn(`Could not process user blob ${blob.key}`, e);
        }
    }
    // Also add mock users to cache for dev env
    if (process.env.NODE_ENV !== 'production') {
        mockUsers.forEach(u => {
            if (!userCache.has(u.id)) {
                const { password, ...userToReturn } = u;
                userCache.set(u.id, userToReturn as UserProfile);
            }
        })
    }
}


export async function GET(request: NextRequest) {
    const currentUserId = request.headers.get('x-user-id');
    const currentUserEmail = request.headers.get('x-user-email');

    if (!currentUserId || !currentUserEmail) {
        return NextResponse.json({ message: "Unauthorized: Missing user credentials" }, { status: 401 });
    }

    const userStore = getBlobStore('users');
    const messagesStore = getBlobStore('messages');
    
    try {
        await populateUserCache(userStore);
        const currentUser = userCache.get(currentUserId);

        if (!currentUser) {
            return NextResponse.json({ message: "Current user not found" }, { status: 404 });
        }

        const { blobs: messageBlobs } = await messagesStore.list({ prefix: '', cache: 'no-store' });
        
        const conversations = new Map<string, { user: UserProfile; lastMessage: Message }>();

        for (const blob of messageBlobs) {
            if (blob.key.includes(currentUserId)) {
                const participantIds = blob.key.split('--');
                const otherUserId = participantIds.find(id => id !== currentUserId);

                if (otherUserId) {
                    try {
                        const conversationData = await messagesStore.get(blob.key, { type: 'json' });
                        if (conversationData && Array.isArray(conversationData.messages) && conversationData.messages.length > 0) {
                            
                            const partner = userCache.get(otherUserId);

                            if (partner) {
                                const lastMessage = conversationData.messages[conversationData.messages.length - 1];
                                if (!conversations.has(otherUserId) || new Date(lastMessage.timestamp) > new Date(conversations.get(otherUserId)!.lastMessage.timestamp)) {
                                    conversations.set(otherUserId, {
                                        user: partner,
                                        lastMessage: lastMessage
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`Could not process conversation blob ${blob.key}`, e);
                    }
                }
            }
        }
        
        // In dev mode or for admin, add users who aren't in conversations yet
        if (currentUser.role === 'Admin') {
            const otherUsers = Array.from(userCache.values()).filter(u => u.id !== currentUser.id && u.role !== 'Admin');
            for(const partner of otherUsers) {
                if (!conversations.has(partner.id)) {
                    conversations.set(partner.id, {
                        user: partner,
                        lastMessage: {
                            id: `mock-${partner.id}`,
                            conversationId: [currentUser.id, partner.id].sort().join('--'),
                            senderId: partner.id,
                            text: "Click to start a conversation...",
                            timestamp: new Date(0).toISOString()
                        }
                    });
                }
            }
        }

        const formattedConversations = Array.from(conversations.values()).map(c => ({
            user: c.user,
            messages: [c.lastMessage]
        }));
        
        formattedConversations.sort((a, b) => {
            const timeA = new Date(a.messages[0].timestamp).getTime();
            const timeB = new Date(b.messages[0].timestamp).getTime();
            return timeB - timeA;
        });

        return NextResponse.json(formattedConversations);

    } catch (error) {
        console.error('Failed to get conversations:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'An internal server error occurred while fetching conversations.', error: errorMessage }, { status: 500 });
    }
}
