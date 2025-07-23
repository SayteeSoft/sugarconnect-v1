
import { UserProfile } from "@/lib/users";
import { ProfileClient } from "@/components/profile-client";
import { notFound } from "next/navigation";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

const getProfileById = async (id: string): Promise<UserProfile | undefined> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/users/${id}`, { cache: 'no-store' });
    if (!res.ok) return undefined;
    return res.json();
  } catch (e) {
    console.error("Error fetching profile by id:", e);
    return undefined;
  }
};

const getAllProfiles = async (): Promise<UserProfile[]> => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error("Error fetching all profiles:", e);
        return [];
    }
};

const getCurrentUser = async (): Promise<UserProfile | undefined> => {
    // For now, we'll hardcode the current user. 
    // In a real app, you would fetch this based on the logged-in session.
    // We will look for a user with the email `alex.doe@example.com`
    const users = await getAllProfiles();
    return users.find(u => u.email === 'alex.doe@example.com');
};


export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfileById(params.id);
  const allProfiles = await getAllProfiles();
  const currentUser = await getCurrentUser();

  if (!profile || !currentUser) {
    notFound();
  }

  return <ProfileClient profile={profile} allProfiles={allProfiles} currentUser={currentUser} />;
}
