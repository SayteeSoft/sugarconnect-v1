
"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile } from '@/lib/users';
import { Message } from '@/lib/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { sendEmail } from '@/lib/email';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Image from 'next/image';
import { mockUsers } from '@/lib/mock-data';

type Conversation = {
    user: UserProfile;
    messages: Message[];
};

type MessagesClientProps = {
    currentUser: UserProfile;
    selectedUserId?: string | null;
};

const isMockUser = (userId: string) => mockUsers.some(u => u.id === userId);

export function MessagesClient({ currentUser, selectedUserId }: MessagesClientProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [localUser, setLocalUser] = useState<UserProfile>(currentUser);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);

    const getConversationId = (userId1: string, userId2: string) => {
        return [userId1, userId2].sort().join('--');
    };
    
    const loadMessagesForConversation = async (conversation: Conversation) => {
        const conversationId = getConversationId(currentUser.id, conversation.user.id);
        const bothAreMock = isMockUser(currentUser.id) && isMockUser(conversation.user.id);

        if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true' && bothAreMock) {
            const localConversation = localStorage.getItem(`conversation_${conversationId}`);
            return localConversation ? JSON.parse(localConversation).messages : [];
        }
        
        const res = await fetch(`/api/messages/${conversationId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const messages = await res.json();
        return Array.isArray(messages) ? messages : messages.messages || [];
    };


    const handleSelectConversation = async (conversation: Conversation) => {
        if (selectedConversation?.user.id === conversation.user.id) return;

        setLoadingMessages(true);
        setSelectedConversation({ ...conversation, messages: [] }); // Show skeleton while loading
        try {
            const messages = await loadMessagesForConversation(conversation);
            setSelectedConversation({ ...conversation, messages });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not load messages for ${conversation.user.name}` });
            setSelectedConversation(null); // Clear selection on error
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        const fetchConversationsAndSelect = async () => {
            setLoadingConversations(true);
            try {
                const res = await fetch(`/api/conversations`, {
                    headers: { 'x-user-id': currentUser.id }
                });
                if (!res.ok) throw new Error("Failed to fetch conversations");
                const data: Conversation[] = await res.json();
                
                const conversationsWithStatus = data.map(convo => ({
                    ...convo,
                    user: {
                        ...convo.user,
                        onlineStatus: Math.random() > 0.5 ? 'online' : 'offline'
                    }
                }));

                setConversations(conversationsWithStatus);
                
                let conversationIdToSelect = selectedUserId;
                if (!conversationIdToSelect && conversationsWithStatus.length > 0) {
                    conversationIdToSelect = conversationsWithStatus[0].user.id;
                }

                if (conversationIdToSelect) {
                    const conversationToSelect = conversationsWithStatus.find(c => c.user.id === conversationIdToSelect);
                    if (conversationToSelect) {
                       await handleSelectConversation(conversationToSelect);
                    }
                } else {
                    setSelectedConversation(null);
                }

            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversations.' });
            } finally {
                setLoadingConversations(false);
            }
        };

        if(currentUser) {
            fetchConversationsAndSelect();
        }
    }, [selectedUserId, currentUser.id]);

    
    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!loadingMessages) {
             messageEndRef.current?.scrollIntoView();
        }
    }, [selectedConversation, loadingMessages]);

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

    const handleSendMessage = async () => {
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
        }
        
        const conversationId = getConversationId(currentUser.id, selectedConversation.user.id);
        const tempMessageId = Date.now().toString();

        const optimisticMessage: Message = {
            id: tempMessageId,
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            image: imagePreview || undefined,
            conversationId: conversationId
        };
        
        setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null);
        setTimeout(scrollToBottom, 100);

        const currentNewMessage = newMessage;
        const currentImageFile = imageFile;
        setNewMessage("");
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";

        const bothAreMock = isMockUser(currentUser.id) && isMockUser(selectedConversation.user.id);
        
        if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true' && bothAreMock) {
            const localKey = `conversation_${conversationId}`;
            const existingMessages: Message[] = JSON.parse(localStorage.getItem(localKey) || '[]' );
            const updatedMessages = [...existingMessages, optimisticMessage];
            localStorage.setItem(localKey, JSON.stringify(updatedMessages));
            
            setSelectedConversation(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === tempMessageId ? { ...optimisticMessage, id: tempMessageId } : m) } : null);
            return;
        }

        try {
            if (localUser.role === 'Sugar Daddy') {
                const updatedUser = { ...localUser, credits: (localUser.credits ?? 0) - 1 };
                setLocalUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(updatedUser) }));
            }

            const formData = new FormData();
            formData.append('senderId', currentUser.id);
            formData.append('text', currentNewMessage);
            if (currentImageFile) {
                formData.append('image', currentImageFile);
            }

            const response = await fetch(`/api/messages/${conversationId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Failed to send message");

            const savedMessage: Message = await response.json();
            
            setSelectedConversation(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === tempMessageId ? savedMessage : m) } : null);

            sendEmail({
                to: selectedConversation.user.email,
                recipientName: selectedConversation.user.name,
                subject: `You have a new message from ${currentUser.name}`,
                body: `<p>You have received a new message from ${currentUser.name}:</p><p><i>"${currentNewMessage}"</i></p>${imagePreview ? '<p>(An image was attached)</p>' : ''}`,
                callToAction: {
                    text: 'Click here to reply',
                    url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/messages?userId=${currentUser.id}`
                }
            });
        } catch(error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message. Please try again.' });
            setSelectedConversation(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.id !== tempMessageId) } : null);
            setNewMessage(currentNewMessage);
            setImagePreview(imagePreview);
            setImageFile(currentImageFile);
        }
    };

    const handleCall = (type: 'audio' | 'video') => {
        if (!selectedConversation) return;
        toast({
            title: `${type === 'audio' ? 'Audio' : 'Video'} Call`,
            description: `This feature is coming soon.`,
        });
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
                        {loadingConversations ? (
                            <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map(convo => (
                                <div
                                    key={convo.user.id}
                                    className={cn(
                                        "p-4 flex items-center gap-4 cursor-pointer hover:bg-accent",
                                        selectedConversation?.user.id === convo.user.id && "bg-primary/10"
                                    )}
                                    onClick={() => handleSelectConversation(convo)}
                                >
                                    <div className="relative">
                                        <Link href={`/dashboard/profile/${convo.user.id}`}>
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={convo.user.image} alt={convo.user.name} />
                                                <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        {convo.user.onlineStatus === 'online' && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <h3 className="font-semibold">{convo.user.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {convo.messages[convo.messages.length - 1]?.image && !convo.messages[convo.messages.length - 1]?.text ? '[Image]' : convo.messages[convo.messages.length - 1]?.text || "No messages yet"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">No conversations found.</div>
                        )}
                    </ScrollArea>
                </div>
                {/* Right Column: Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Link href={`/dashboard/profile/${selectedConversation.user.id}`}>
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedConversation.user.image} alt={selectedConversation.user.name} />
                                        <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                   </Link>
                                    <div>
                                        <h3 className="font-semibold">{selectedConversation.user.name}</h3>
                                        <p className={cn("text-sm", selectedConversation.user.onlineStatus === 'online' ? "text-green-500" : "text-muted-foreground")}>{selectedConversation.user.onlineStatus === 'online' ? "Online" : "Offline"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <Phone className="h-5 w-5 cursor-pointer hover:text-primary" onClick={() => handleCall('audio')} />
                                    <Video className="h-5 w-5 cursor-pointer hover:text-primary" onClick={() => handleCall('video')} />
                                    <MoreVertical className="h-5 w-5 cursor-pointer hover:text-primary" />
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-6 bg-secondary/50">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                <div className="space-y-6">
                                    {selectedConversation.messages.map(msg => (
                                        <div key={msg.id} className={cn("flex gap-3", msg.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                                            {msg.senderId !== currentUser.id && (
                                              <Link href={`/dashboard/profile/${selectedConversation.user.id}`}>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={selectedConversation.user.image} alt={selectedConversation.user.name} />
                                                    <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                              </Link>
                                            )}
                                            <div className={cn(
                                                "p-3 rounded-lg max-w-xs",
                                                msg.senderId === currentUser.id ? "bg-primary text-primary-foreground" : "bg-background"
                                            )}>
                                                {msg.image && <Image src={msg.image} alt="attached image" width={200} height={200} className="rounded-md mb-2" data-ai-hint="attached image" />}
                                                {msg.text && <p>{msg.text}</p>}
                                            </div>
                                             {msg.senderId === currentUser.id && (
                                                <Link href={`/dashboard/profile/${currentUser.id}`}>
                                                  <Avatar className="h-8 w-8">
                                                      <AvatarImage src={currentUser.image} alt={currentUser.name} />
                                                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messageEndRef} />
                                </div>
                                )}
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

    