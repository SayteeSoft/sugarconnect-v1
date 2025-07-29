
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';

const getStoreCached = (name: 'users' | 'messages') => getStore({
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
            console.warn(`Could not parse blob ${blob.key} as a user profile while searching for ID ${userId}.`, e);
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

    const userStore = getStoreCached('users');
    const messagesStore = getStoreCached('messages');
    
    try {
        const currentUser: UserProfile | null = await userStore.get(currentUserEmail.toLowerCase(), { type: 'json' }).catch(() => null);

        if (!currentUser) {
            return NextResponse.json({ message: "Current user not found" }, { status: 404 });
        }

        const { blobs: messageBlobs } = await messagesStore.list({ prefix: '', cache: 'no-store' });
        
        const conversations = [];

        for (const blob of messageBlobs) {
            // Check if the conversation key includes the current user's ID
            if (blob.key.includes(currentUserId)) {
                const participantIds = blob.key.split('--');
                const otherUserId = participantIds.find(id => id !== currentUserId);

                if (otherUserId) {
                    const partner = await findUserById(userStore, otherUserId);
                    if (partner) {
                        const conversationData = await messagesStore.get(blob.key, { type: 'json' });
                        let lastMessage: Message | null = null;
                        if (conversationData && Array.isArray(conversationData.messages) && conversationData.messages.length > 0) {
                            lastMessage = conversationData.messages[conversationData.messages.length - 1];
                        }
                        
                        // Only add conversations that actually have messages
                        if (lastMessage) {
                             conversations.push({
                                user: partner,
                                messages: [lastMessage]
                            });
                        }
                    }
                }
            }
        }
        
        // Add mock users for admin in development
        if (currentUser.role === 'Admin' && process.env.NODE_ENV !== 'production') {
            const { mockUsers } = await import('@/lib/mock-data');
            const otherUsers = mockUsers.filter(u => u.id !== currentUser.id && u.role !== 'Admin');
            for(const partner of otherUsers) {
                if (!conversations.some(c => c.user.id === partner.id)) {
                    conversations.push({
                        user: partner,
                        messages: []
                    });
                }
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'An internal server error occurred while fetching conversations.', error: errorMessage }, { status: 500 });
    }
}
