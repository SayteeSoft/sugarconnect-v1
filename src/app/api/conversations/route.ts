

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';
import { mockUsers } from '@/lib/mock-data';
import { mockConversations } from '@/lib/mock-messages';

async function findUserById(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    // First check mock users as they are fewer
    const mockUser = mockUsers.find(u => u.id === userId);
    if (mockUser) {
        return { key: mockUser.email, user: mockUser };
    }

    // Then check blob store
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

async function getCurrentUser(req: NextRequest): Promise<UserProfile | null> {
    const userId = req.headers.get('x-user-id');
    if (!userId) return null;
    
    const userStore = getStore({ name: 'users', consistency: 'strong', siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id', token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'});
    const result = await findUserById(userStore, userId);
    return result?.user || null;
}


export async function GET(request: NextRequest) {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userStore = getStore({ name: 'users', consistency: 'strong', siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id', token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'});
    const messagesStore = getStore({ name: 'messages', consistency: 'strong', siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id', token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'});
    
    try {
        const { blobs: userBlobs } = await userStore.list();
        
        const allUsers: UserProfile[] = [...mockUsers];
        const mockUserIds = new Set(mockUsers.map(u => u.id));

        for (const blob of userBlobs) {
            try {
                const user = await userStore.get(blob.key, { type: 'json' });
                if (!mockUserIds.has(user.id)) {
                    allUsers.push(user);
                }
            } catch (e) {
                //
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

        for (const partner of potentialPartners) {
            const conversationId = [currentUser.id, partner.id].sort().join('--');
            let lastMessage: Message | null = null;
            
            const isMockConversationForAdmin = currentUser.email === 'saytee.software@gmail.com' && 
                                               mockConversations.some(mc => mc.conversationId === conversationId);

            if (isMockConversationForAdmin) {
                const mockConvo = mockConversations.find(mc => mc.conversationId === conversationId);
                if (mockConvo && mockConvo.messages.length > 0) {
                    lastMessage = mockConvo.messages[mockConvo.messages.length - 1];
                }
            } else {
                 try {
                    const conversationData = await messagesStore.get(conversationId, { type: 'json' });
                    if (conversationData && conversationData.messages && conversationData.messages.length > 0) {
                        lastMessage = conversationData.messages[conversationData.messages.length - 1];
                    }
                } catch (error) {
                    // No messages yet for this conversation, which is fine
                }
            }
            
            // Only add conversation if it's for the admin's mock data or if it's a real conversation
            if (isMockConversationForAdmin || ! (currentUser.email === 'saytee.software@gmail.com')) {
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
