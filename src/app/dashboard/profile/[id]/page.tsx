
"use client";

import { useState, useEffect } from 'react';
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound, useParams } from "next/navigation";
import { Header } from "@/components/header";

async function getProfileById(id: string): Promise<UserProfile | null> {
    if (!id) return null;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || '';
        // Add a cache-busting parameter to the fetch request
        const response = await fetch(`${baseUrl}/api/users/${id}?t=${new Date().getTime()}`, { cache: 'no-store' });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            // For other errors, we still want to throw to see what's wrong.
            throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        
        const user = await response.json();
        return user;

    } catch (e) {
      console.error(`Error fetching profile by id ${id}:`, e);
      return null;
    }
}

export default function ProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (id) {
                setLoading(true);
                const fetchedProfile = await getProfileById(id);
                setProfile(fetchedProfile);
                setLoading(false);
            }
        };

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Could not parse current user from localStorage", e);
            }
        }
        
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }
    
    if (!profile) {
        notFound();
    }
    
    // In a real app, you would fetch the current user from session/auth context.
    // We are getting it from localStorage for this demo.
    if (!currentUser) {
        // This case can happen if localStorage is cleared, but they still have the URL
        // We can either redirect to login or show a limited view. For now, we'll show loading.
        return <p>Loading user session...</p>
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
            <Header />
            <main className="flex-grow pb-16 pt-36">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <ProfileForm initialProfile={profile} currentUser={currentUser} />
                </div>
            </main>
        </div>
    );
}
