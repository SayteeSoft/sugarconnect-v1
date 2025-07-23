
import { MessagesClient } from "@/components/messages-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";
import { Message } from "@/lib/messages";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Messages - Sugar Connect",
    description: "Your private conversations with potential matches.",
};

async function getConversations(): Promise<{user: UserProfile, messages: Message[]}[]> {
    const adminUser: UserProfile = {
        id: 'admin-user',
        email: 'admin@sugarconnect.com',
        name: 'Admin',
        age: 99,
        location: 'Cloud',
        role: 'Admin',
        sex: 'Female',
        bio: 'I am the support administrator for Sugar Connect.',
        interests: [],
        image: 'https://placehold.co/100x100.png',
    };

    const conversations = mockUsers.slice(0, 4).map((user, index) => ({
        user: user,
        messages: [
            {
                id: `${index}-1`,
                senderId: user.id,
                text: "Hi Admin, I had a question about my profile visibility. Can you help?",
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            },
            {
                id: `${index}-2`,
                senderId: adminUser.id,
                text: `Hello ${user.name}, of course. What seems to be the issue?`,
                timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
            }
        ]
    }));

    return Promise.resolve(conversations);
}


export default async function MessagesPage() {
  const conversations = await getConversations();
  const currentUser = mockUsers.find(u => u.email === 'alex.doe@example.com') || mockUsers[0];
  
  return (
    <MessagesClient initialConversations={conversations} currentUser={currentUser} />
  );
}
