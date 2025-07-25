

"use client";

import { useState, useEffect } from 'react';
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound, useParams } from "next/navigation";
import { mockUsers } from '@/lib/mock-data';

async function getProfileById(id: string): Promise<UserProfile | null> {
    if (!id) return null;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || '';
        const response = await fetch(`${baseUrl}/api/users/${id}?t=${new Date().getTime()}`, { cache: 'no-store' });

        if (response.ok) {
            const user = await response.json();
            return user;
        }

        if (response.status === 404) {
            // If user is not in the API, check mock users
            const mockUser = mockUsers.find(u => u.id === id);
            if (mockUser) {
                return mockUser;
            }
            return null; // Truly not found
        }
        
        // For other non-404 errors, we might still want to check mocks as a fallback
        throw new Error(`Failed to fetch profile: ${response.statusText}`);

    } catch (e) {
      console.error(`Error fetching profile by id ${id}, checking mock data. Error:`, e);
      // Fallback to mock users on any fetch error
      const mockUser = mockUsers.find(u => u.id === id);
      return mockUser || null;
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
    
    if (!currentUser) {
        return <p>Loading user session...</p>
    }

    return (
        <ProfileForm initialProfile={profile} currentUser={currentUser} />
    );
}

