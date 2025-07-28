
import { Message } from './messages';
import { mockUsers } from './mock-data';

const adminUser = mockUsers.find(u => u.email === 'saytee.software@gmail.com');
const darianna = mockUsers.find(u => u.name === 'Darianna');
const kateryna = mockUsers.find(u => u.name === 'Kateryna');
const sofia = mockUsers.find(u => u.name === 'Sofia');
const vanessa = mockUsers.find(u => u.name === 'Vanessa');

const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('--');
};

type MockConversation = {
    conversationId: string;
    participants: { id: string, name: string }[];
    messages: Message[];
}

export const mockConversations: MockConversation[] = [];

// AI-Generated mock conversations for the admin user
const aiGeneratedInquiries = [
    "Hi there, I was wondering how the profile verification process works? I want to make sure I'm doing everything correctly.",
    "I'm having some trouble uploading photos to my gallery. It keeps giving me an error. Can you help?",
    "Just wanted to say I'm really enjoying the app so far! The quality of profiles is excellent.",
    "Is there a way to filter my search results by height? I can't seem to find the option.",
    "I have a suggestion for a new feature: maybe a 'wink' or 'poke' button to show interest without sending a full message?",
    "Quick question - how long does it typically take to find a match on here? Just curious!",
];

const mockSenders = [darianna, kateryna, sofia, vanessa].filter(Boolean);

if (adminUser) {
    aiGeneratedInquiries.forEach((inquiry, index) => {
        const sender = mockSenders[index % mockSenders.length];
        if (sender) {
            const conversationId = getConversationId(adminUser.id, sender.id);
            mockConversations.push({
                conversationId,
                participants: [{ id: adminUser.id, name: adminUser.name }, { id: sender.id, name: sender.name }],
                messages: [
                    { 
                        id: `msg-ai-${index}`, 
                        conversationId, 
                        senderId: sender.id, 
                        text: inquiry, 
                        timestamp: new Date(Date.now() - 1000 * 60 * (60 * (index + 1))).toISOString() 
                    },
                    { 
                        id: `msg-ai-${index}-reply`, 
                        conversationId, 
                        senderId: adminUser.id, 
                        text: `Hi ${sender.name}, thanks for reaching out. I'll look into that for you.`, 
                        timestamp: new Date(Date.now() - 1000 * 60 * (60 * (index + 1) - 5)).toISOString() 
                    },
                ]
            });
        }
    });
}
