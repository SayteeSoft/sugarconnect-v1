
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Image from 'next/image';

type Conversation = {
    user: UserProfile;
    messages: Message[];
};

type MessagesClientProps = {
    currentUser: UserProfile;
    selectedUserId?: string | null;
};

export function MessagesClient({ currentUser, selectedUserId }: MessagesClientProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSelectConversation = useCallback(async (conversation: Conversation) => {
        if (selectedConversation?.user.id === conversation.user.id && selectedConversation.messages.length > 0) return;

        setLoadingMessages(true);
        setSelectedConversation({ ...conversation, messages: [] }); // Reset messages for skeleton
        try {
            const res = await fetch(`/api/messages/${conversation.user.id}`, {
                headers: { 'x-user-id': currentUser.id },
                cache: 'no-store'
            });
            if (!res.ok) throw new Error("Failed to fetch messages");
            const messages: Message[] = await res.json();
            setSelectedConversation({ ...conversation, messages });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not load messages for ${conversation.user.name}` });
            // If fetching fails but we have a shell, keep it
            if(!selectedConversation) setSelectedConversation(conversation);
        } finally {
            setLoadingMessages(false);
        }
    }, [currentUser.id, selectedConversation, toast]);


    useEffect(() => {
        const fetchConversationsAndUsers = async () => {
            setLoadingConversations(true);
            try {
                const [convRes, usersRes] = await Promise.all([
                    fetch(`/api/conversations`, { 
                        headers: { 'x-user-id': currentUser.id, 'x-user-email': currentUser.email }, 
                        cache: 'no-store' 
                    }),
                    fetch('/api/users', { cache: 'no-store' })
                ]);

                if (!convRes.ok) throw new Error("Failed to fetch conversations");
                if (!usersRes.ok) throw new Error("Failed to fetch users");

                const loadedConversations: Conversation[] = await convRes.json();
                const allUsers: UserProfile[] = await usersRes.json();
                
                const convosWithStatus = loadedConversations.map(c => ({...c, user: {...c.user, onlineStatus: Math.random() > 0.5 ? 'online' : 'offline'}}));
                setConversations(convosWithStatus);

                let conversationToSelect: Conversation | null = null;
                if (selectedUserId) {
                    conversationToSelect = convosWithStatus.find(c => c.user.id === selectedUserId) || null;
                    // If conversation doesn't exist, create a shell for it so we can start one
                    if (!conversationToSelect) {
                        const targetUser = allUsers.find(u => u.id === selectedUserId);
                        if (targetUser) {
                           const newConversationShell: Conversation = {
                                user: targetUser,
                                messages: []
                           };
                           setConversations(prev => [newConversationShell, ...prev]);
                           conversationToSelect = newConversationShell;
                        }
                    }
                } else if (convosWithStatus.length > 0) {
                    conversationToSelect = convosWithStatus[0];
                }
                
                if (conversationToSelect) {
                    handleSelectConversation(conversationToSelect);
                }

            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversations.' });
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConversationsAndUsers();
    }, [currentUser.id, currentUser.email, selectedUserId, toast, handleSelectConversation]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => c.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversations, searchTerm]);
    
    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !imageFile) || !selectedConversation || isSending) return;
        setIsSending(true);

        const tempId = Date.now().toString();
        const optimisticMessage: Message = {
            id: tempId,
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            image: imagePreview || undefined,
            conversationId: '' // Will be set by server
        };
        
        setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null);

        const formData = new FormData();
        formData.append('senderId', currentUser.id);
        formData.append('text', newMessage);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        setNewMessage("");
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        
        try {
            const response = await fetch(`/api/messages/${selectedConversation.user.id}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send message");
            }
            
            const savedMessage: Message = await response.json();
            setSelectedConversation(prev => prev ? {
                ...prev,
                messages: prev.messages.map(m => m.id === tempId ? savedMessage : m)
            } : null);

            // Update credit count for Sugar Daddy
            if (currentUser.role === 'Sugar Daddy') {
                const storedUser = localStorage.getItem('user');
                if(storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    const newCredits = (parsedUser.credits || 0) - 1;
                    const updatedUser = {...parsedUser, credits: newCredits};
                    const userUpdateFormData = new FormData();
                    userUpdateFormData.append('email', updatedUser.email);
                    userUpdateFormData.append('credits', newCredits.toString());
                    
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(updatedUser) }));

                    // Asynchronously save to backend
                    fetch(`/api/users/${currentUser.id}`, { method: 'PUT', body: userUpdateFormData });
                }
            }

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to send message. Please try again.' });
            // Revert optimistic update
            setSelectedConversation(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.id !== tempId) } : null);
            setNewMessage(optimisticMessage.text);
            setImagePreview(optimisticMessage.image || null);
        } finally {
            setIsSending(false);
        }
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
            reader.onloadend = () => { setImagePreview(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => setNewMessage(prev => prev + emojiData.emoji);
    
    return (
        <div className="container mx-auto">
             <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Messages</h1>
                <p className="text-lg text-muted-foreground">Your private conversations with potential matches.</p>
            </div>
            <Card className="h-[70vh] flex shadow-xl">
                {/* Left Column */}
                <div className="w-full md:w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <ScrollArea className="flex-1">
                        {loadingConversations ? (
                            <div className="p-4 text-center text-muted-foreground">Loading...</div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map(convo => (
                                <div key={convo.user.id} onClick={() => handleSelectConversation(convo)}
                                    className={cn("p-4 flex items-center gap-4 cursor-pointer hover:bg-accent", selectedConversation?.user.id === convo.user.id && "bg-primary/10")}>
                                    <Avatar className="h-12 w-12"><AvatarImage src={convo.user.image} /><AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback></Avatar>
                                    <div className="flex-1 truncate">
                                        <h3 className="font-semibold">{convo.user.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{convo.messages[convo.messages.length - 1]?.text || "Click to start conversation..."}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">No conversations found.</div>
                        )}
                    </ScrollArea>
                </div>
                {/* Right Column */}
                <div className="hidden md:flex w-2/3 flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between">
                                <Link href={`/dashboard/profile/${selectedConversation.user.id}`} className="flex items-center gap-4">
                                     <Avatar><AvatarImage src={selectedConversation.user.image} /><AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback></Avatar>
                                     <div>
                                        <h3 className="font-semibold">{selectedConversation.user.name}</h3>
                                        <p className={cn("text-sm", selectedConversation.user.onlineStatus === 'online' ? "text-green-500" : "text-muted-foreground")}>{selectedConversation.user.onlineStatus}</p>
                                    </div>
                                </Link>
                            </div>
                            <ScrollArea className="flex-1 p-6 bg-secondary/50">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                ) : (
                                    <div className="space-y-6">
                                        {selectedConversation.messages.map(msg => (
                                            <div key={msg.id} className={cn("flex gap-3", msg.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                                                {msg.senderId !== currentUser.id && (
                                                    <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.user.image} /><AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback></Avatar>
                                                )}
                                                <div className={cn("p-3 rounded-lg max-w-xs", msg.senderId === currentUser.id ? "bg-primary text-primary-foreground" : "bg-background")}>
                                                    {msg.image && <Image src={msg.image} alt="attached" width={200} height={200} className="rounded-md mb-2" />}
                                                    {msg.text && <p>{msg.text}</p>}
                                                </div>
                                                {msg.senderId === currentUser.id && (
                                                     <Avatar className="h-8 w-8"><AvatarImage src={currentUser.image} /><AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback></Avatar>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </ScrollArea>
                             {imagePreview && (
                                <div className="p-4 border-t relative">
                                    <Image src={imagePreview} alt="Preview" width={80} height={80} className="rounded-md" />
                                    <Button variant="ghost" size="icon" className="absolute top-2 left-20 h-6 w-6 rounded-full bg-black/50 text-white" onClick={() => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}><X className="h-4 w-4" /></Button>
                                </div>
                            )}
                            <div className="p-4 border-t flex items-center gap-4">
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                                <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button></PopoverTrigger><PopoverContent className="p-0 border-0"><EmojiPicker onEmojiClick={handleEmojiClick} /></PopoverContent></Popover>
                                <Input placeholder="Type a message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isSending}/>
                                <Button onClick={handleSendMessage} disabled={isSending || (!newMessage.trim() && !imageFile)}>
                                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground"><p>Select a conversation to start messaging</p></div>
                    )}
                </div>
            </Card>
        </div>
    );
}
