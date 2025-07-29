
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

async function findUserById(userStore: Store, userId: string): Promise<UserProfile | null> {
    const { blobs } = await userStore.list({ cache: 'no-store' });
    for (const blob of blobs) {
        try {
            const user = await userStore.get(blob.key, { type: 'json' });
            if (user && user.id === userId) {
                const { password, ...userToReturn } = user;
                return userToReturn as UserProfile;
            }
        } catch (e) {
            // Ignore blobs that are not valid JSON or don't match
        }
    }
    return null;
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
        const currentUser: UserProfile | null = await userStore.get(currentUserEmail.toLowerCase(), { type: 'json' }).catch(() => null);

        if (!currentUser) {
            return NextResponse.json({ message: "Current user not found" }, { status: 404 });
        }

        const { blobs: messageBlobs } = await messagesStore.list({ prefix: '', cache: 'no-store' });
        
        const conversations = new Map<string, { user: UserProfile; lastMessage: Message }>();
        const userCache = new Map<string, UserProfile>();

        for (const blob of messageBlobs) {
            if (blob.key.includes(currentUserId)) {
                const participantIds = blob.key.split('--');
                const otherUserId = participantIds.find(id => id !== currentUserId);

                if (otherUserId) {
                    try {
                        const conversationData = await messagesStore.get(blob.key, { type: 'json' });
                        if (conversationData && Array.isArray(conversationData.messages) && conversationData.messages.length > 0) {
                            
                            let partner = userCache.get(otherUserId);
                            if (!partner) {
                                partner = await findUserById(userStore, otherUserId);
                                if (partner) {
                                    userCache.set(otherUserId, partner);
                                }
                            }

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
        
        if (currentUser.role === 'Admin' && process.env.NODE_ENV !== 'production') {
            const otherUsers = mockUsers.filter(u => u.id !== currentUser.id && u.role !== 'Admin');
            for(const partner of otherUsers) {
                if (!conversations.has(partner.id)) {
                    conversations.set(partner.id, {
                        user: partner,
                        lastMessage: {
                            id: `mock-${partner.id}`,
                            conversationId: `${currentUser.id}--${partner.id}`,
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
