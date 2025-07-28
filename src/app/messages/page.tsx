

"use client";

import { MessagesClient } from "@/components/messages-client";
import { UserProfile } from "@/lib/users";
import { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";


function MessagesPageComponent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: UserProfile = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
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
        <MessagesClient 
            currentUser={currentUser}
            selectedUserId={userId} 
        />
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MessagesPageComponent />
        </Suspense>
    )
}
