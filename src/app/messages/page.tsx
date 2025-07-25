
"use client";

import { MessagesClient } from "@/components/messages-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";
import { Message } from "@/lib/messages";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";


export default function MessagesPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [conversations, setConversations] = useState<{user: UserProfile, messages: Message[]}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: UserProfile = JSON.parse(storedUser);
                setCurrentUser(parsedUser);

                // Filter out the current user and admin from potential conversations
                const otherUsers = mockUsers.filter(u => u.id !== parsedUser.id && u.role !== 'Admin');

                // Create mock conversations
                const generatedConversations = otherUsers.slice(0, 5).map((user, index) => {
                    const messages: Message[] = [];
                    if (parsedUser.role === 'Sugar Baby' && user.role === 'Sugar Daddy') {
                        messages.push({
                            id: `${user.id}-${index}-1`,
                            senderId: user.id,
                            text: `Hello ${parsedUser.name}, I was impressed by your profile.`,
                            timestamp: new Date(Date.now() - 1000 * 60 * (10 - index)).toISOString(),
                        });
                        messages.push({
                            id: `${user.id}-${index}-2`,
                            senderId: parsedUser.id,
                            text: `Thank you, ${user.name}! I appreciate that.`,
                            timestamp: new Date(Date.now() - 1000 * 60 * (8 - index)).toISOString(),
                        });
                    } else if (parsedUser.role === 'Sugar Daddy' && user.role === 'Sugar Baby') {
                         messages.push({
                            id: `${user.id}-${index}-1`,
                            senderId: parsedUser.id,
                            text: `Hi ${user.name}, you have a lovely profile.`,
                            timestamp: new Date(Date.now() - 1000 * 60 * (12 - index)).toISOString(),
                        });
                        messages.push({
                            id: `${user.id}-${index}-2`,
                            senderId: user.id,
                            text: `Thanks! I'm glad you think so.`,
                            timestamp: new Date(Date.now() - 1000 * 60 * (7 - index)).toISOString(),
                        });
                    } else {
                         messages.push({
                            id: `${user.id}-${index}-1`,
                            senderId: user.id,
                            text: `Hi there!`,
                            timestamp: new Date(Date.now() - 1000 * 60 * (5 - index)).toISOString(),
                        });
                    }
                    return { user, messages };
                });
                
                setConversations(generatedConversations);

            } catch(e) {
                console.error("Error parsing user from storage", e);
                setCurrentUser(null);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto text-center">
                <p>Loading messages...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="container mx-auto text-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Messages</h1>
                    <p className="text-lg text-muted-foreground">Please log in to view your conversations.</p>
                </div>
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-semibold mb-4">Authentication Required</h3>
                        <p className="text-muted-foreground mb-6">
                            You need to be signed in to view your messages.
                        </p>
                        <Button asChild>
                            <Link href="/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Go to Login Page
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
  
    return (
        <MessagesClient initialConversations={conversations} currentUser={currentUser} />
    );
}
