
export type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    image?: string; // Optional image as a base64 data URI
};
