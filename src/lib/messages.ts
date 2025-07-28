

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    timestamp: string;
    image?: string; // Optional image URL from blob store
};
