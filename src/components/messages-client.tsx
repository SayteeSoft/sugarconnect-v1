
"use client";

import { useState, useMemo, useRef } from 'react';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { sendEmail } from '@/lib/email';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Image from 'next/image';

type Conversation = {
    user: UserProfile;
    messages: Message[];
};

type MessagesClientProps = {
    initialConversations: Conversation[];
    currentUser: UserProfile;
};

export function MessagesClient({ initialConversations, currentUser }: MessagesClientProps) {
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [localUser, setLocalUser] = useState<UserProfile>(currentUser);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => c.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversations, searchTerm]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prevMessage => prevMessage + emojiData.emoji);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'Image Too Large',
                    description: 'Please select an image smaller than 2MB.',
                });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = () => {
        if ((newMessage.trim() === "" && !imageFile) || !selectedConversation) return;

        if (localUser.role === 'Sugar Daddy') {
            if ((localUser.credits ?? 0) < 1) {
                toast({
                    variant: 'destructive',
                    title: 'No Credits Remaining',
                    description: 'You must purchase more credits to send messages.',
                    action: <Button asChild><Link href="/purchase-credits">Buy Credits</Link></Button>,
                });
                return;
            }
            
            const updatedUser = { ...localUser, credits: (localUser.credits ?? 0) - 1 };
            setLocalUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            window.dispatchEvent(new StorageEvent('storage', {
                key: 'user',
                newValue: JSON.stringify(updatedUser),
            }));
        }

        const message: Message = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            image: imagePreview || undefined,
        };
        
        const updatedConversations = conversations.map(c => {
            if (c.user.id === selectedConversation.user.id) {
                return { ...c, messages: [...c.messages, message] };
            }
            return c;
        });

        setConversations(updatedConversations);
        setSelectedConversation(updatedConversations.find(c => c.user.id === selectedConversation.user.id) || null);
        
        sendEmail({
            to: selectedConversation.user.email,
            recipientName: selectedConversation.user.name,
            subject: `You have a new message from ${currentUser.name}`,
            body: `
                <p>You have received a new message from ${currentUser.name}:</p>
                <p><i>"${newMessage}"</i></p>
                ${imagePreview ? '<p>(An image was attached)</p>' : ''}
            `,
            callToAction: {
                text: 'Click here to reply',
                url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/messages`
            }
        });

        setNewMessage("");
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="container mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Messages</h1>
                <p className="text-lg text-muted-foreground">Your private conversations with potential matches.</p>
            </div>
            <Card className="h-[70vh] flex shadow-xl">
                {/* Left Column: Conversation List */}
                <div className="w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        {filteredConversations.map(convo => (
                            <div
                                key={convo.user.id}
                                className={cn(
                                    "p-4 flex items-center gap-4 cursor-pointer hover:bg-accent",
                                    selectedConversation?.user.id === convo.user.id && "bg-primary/10"
                                )}
                                onClick={() => setSelectedConversation(convo)}
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={convo.user.image} alt={convo.user.name} />
                                    <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <h3 className="font-semibold">{convo.user.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {convo.messages[convo.messages.length - 1]?.image && !convo.messages[convo.messages.length - 1]?.text ? '[Image]' : convo.messages[convo.messages.length - 1]?.text || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                {/* Right Column: Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedConversation.user.image} alt={selectedConversation.user.name} />
                                        <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{selectedConversation.user.name}</h3>
                                        <p className="text-sm text-green-500">Online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <Phone className="h-5 w-5 cursor-pointer hover:text-primary" />
                                    <Video className="h-5 w-5 cursor-pointer hover:text-primary" />
                                    <MoreVertical className="h-5 w-5 cursor-pointer hover:text-primary" />
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-6 bg-secondary/50">
                                <div className="space-y-6">
                                    {selectedConversation.messages.map(msg => (
                                        <div key={msg.id} className={cn("flex gap-3", msg.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                                            {msg.senderId !== currentUser.id && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={selectedConversation.user.image} alt={selectedConversation.user.name} />
                                                    <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn(
                                                "p-3 rounded-lg max-w-xs",
                                                msg.senderId === currentUser.id ? "bg-primary text-primary-foreground" : "bg-background"
                                            )}>
                                                {msg.image && <Image src={msg.image} alt="attached image" width={200} height={200} className="rounded-md mb-2" data-ai-hint="attached image" />}
                                                {msg.text && <p>{msg.text}</p>}
                                            </div>
                                             {msg.senderId === currentUser.id && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={currentUser.image} alt={currentUser.name} />
                                                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            {imagePreview && (
                                <div className="p-4 border-t relative">
                                    <Image src={imagePreview} alt="Preview" width={80} height={80} className="rounded-md" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 left-20 h-6 w-6 rounded-full bg-black/50 text-white"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="p-4 border-t flex items-center gap-4">
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-5 w-5 text-muted-foreground cursor-pointer" />
                                </Button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Smile className="h-5 w-5 text-muted-foreground cursor-pointer" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-auto border-0">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    placeholder="Type your message..."
                                    className="flex-1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage} disabled={(newMessage.trim() === "" && !imageFile)}>
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center text-muted-foreground">
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
