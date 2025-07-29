
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

export async function GET(request: NextRequest) {
    const currentUserEmail = request.headers.get('x-user-email');

    if (!currentUserEmail) {
        return NextResponse.json({ message: "Unauthorized: Missing user email" }, { status: 401 });
    }

    const userStore = getStoreCached('users');
    const messagesStore = getStoreCached('messages');
    
    try {
        const currentUser: UserProfile | null = await userStore.get(currentUserEmail.toLowerCase(), { type: 'json' }).catch(() => null);

        if (!currentUser) {
            return NextResponse.json({ message: "Current user not found" }, { status: 404 });
        }

        const { blobs: userBlobs } = await userStore.list({ cache: 'no-store' });
        const allUsers: UserProfile[] = [];
        for (const blob of userBlobs) {
            try {
                const user = await userStore.get(blob.key, { type: 'json' });
                if (user && user.id) { // Basic validation
                    const { password, ...userToReturn } = user;
                    allUsers.push(userToReturn as UserProfile);
                }
            } catch (e) {
                console.warn(`Could not parse or validate blob ${blob.key} as a user profile.`, e);
            }
        }
        
        let potentialPartners: UserProfile[];
        if (currentUser.role === 'Admin') {
            potentialPartners = allUsers.filter(u => u.id !== currentUser.id);
        } else {
            const oppositeRole = currentUser.role === 'Sugar Daddy' ? 'Sugar Baby' : 'Sugar Daddy';
            potentialPartners = allUsers.filter(u => u.role === oppositeRole);
        }

        const conversations = [];
        for (const partner of potentialPartners) {
            // Ensure we don't create a conversation with oneself
            if (currentUser.id === partner.id) continue;

            const conversationId = [currentUser.id, partner.id].sort().join('--');
            let lastMessage: Message | null = null;
            
            try {
                const conversationData = await messagesStore.get(conversationId, { type: 'json' });
                if (conversationData && Array.isArray(conversationData.messages) && conversationData.messages.length > 0) {
                    lastMessage = conversationData.messages[conversationData.messages.length - 1];
                }
            } catch (error) {
                // No messages yet, which is fine, blob will not be found.
            }
            
            if (currentUser.role === 'Admin' || lastMessage) {
                conversations.push({
                    user: partner, // password is already stripped
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
        return NextResponse.json({ message: 'An internal server error occurred while fetching conversations.' }, { status: 500 });
    }
}
