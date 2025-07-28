
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

if (adminUser && darianna) {
    const conversationId = getConversationId(adminUser.id, darianna.id);
    mockConversations.push({
        conversationId,
        participants: [{ id: adminUser.id, name: adminUser.name }, { id: darianna.id, name: darianna.name }],
        messages: [
            { id: 'msg1', conversationId, senderId: darianna.id, text: 'Hey there! I saw your profile and was really impressed.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 'msg2', conversationId, senderId: adminUser.id, text: 'Hello Darianna, thank you. Your profile is quite captivating as well.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
            { id: 'msg3', conversationId, senderId: darianna.id, text: 'I\'m glad you think so! I\'d love to chat more and see if we connect.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        ]
    });
}

if (adminUser && kateryna) {
    const conversationId = getConversationId(adminUser.id, kateryna.id);
    mockConversations.push({
        conversationId,
        participants: [{ id: adminUser.id, name: adminUser.name }, { id: kateryna.id, name: kateryna.name }],
        messages: [
            { id: 'msg4', conversationId, senderId: kateryna.id, text: 'Hi! I noticed we have a shared interest in museums.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
            { id: 'msg5', conversationId, senderId: adminUser.id, text: 'Yes, I\'m a great admirer of the arts. Do you have a favorite period?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
        ]
    });
}

if (adminUser && sofia) {
    const conversationId = getConversationId(adminUser.id, sofia.id);
    mockConversations.push({
        conversationId,
        participants: [{ id: adminUser.id, name: adminUser.name }, { id: sofia.id, name: sofia.name }],
        messages: [
            { id: 'msg6', conversationId, senderId: sofia.id, text: 'Your profile caught my eye. You seem like a very interesting person.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        ]
    });
}

if (adminUser && vanessa) {
    const conversationId = getConversationId(adminUser.id, vanessa.id);
    mockConversations.push({
        conversationId,
        participants: [{ id: adminUser.id, name: adminUser.name }, { id: vanessa.id, name: vanessa.name }],
        messages: [
             { id: 'msg7', conversationId, senderId: vanessa.id, text: 'Hello there, how are you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
        ]
    });
}
