
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/users';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This is a client-side component to handle redirection.
export default function MyProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user: UserProfile = JSON.parse(storedUser);
                if (user && user.id) {
                    router.replace(`/dashboard/profile/${user.id}`);
                } else {
                    setError("Your session is invalid. Please log in again.");
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to parse user from storage", error);
                setError("There was an issue loading your profile. Please try logging in again.");
                setIsLoading(false);
            }
        } else {
            // If no user is found, update state to show login prompt.
            setError("You must be logged in to view your profile.");
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="flex flex-col justify-center items-center min-h-screen text-center">
                <h1 className="text-2xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button asChild>
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        )
    }

    return null; // Should not be reached if redirection or error handling works
}
