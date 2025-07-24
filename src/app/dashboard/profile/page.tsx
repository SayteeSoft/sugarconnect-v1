
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/users';

// This is a client-side component to handle redirection.
export default function MyProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user: UserProfile = JSON.parse(storedUser);
                // Redirect to the dynamic route with the user's ID
                router.replace(`/dashboard/profile/${user.id}`);
            } catch (error) {
                console.error("Failed to parse user from storage", error);
                // If there's an error, redirect to login
                router.replace('/login');
            }
        } else {
            // If no user is found, redirect to login
            router.replace('/login');
        }
    }, [router]);

    // Display a loading state while the redirection is happening.
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Loading your profile...</p>
        </div>
    );
}
