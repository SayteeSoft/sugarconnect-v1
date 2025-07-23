
import { UserProfile } from "@/lib/users";
import { ProfileClient } from "@/components/profile-client";
import { notFound } from "next/navigation";
import { mockUsers } from "@/lib/mock-data";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

const getAllProfiles = async (): Promise<UserProfile[]> => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
        if (!res.ok) {
          console.error(`Failed to fetch profiles, falling back to mock. Status: ${res.status}`);
          return mockUsers.filter(u => u.role !== 'Admin');
        }
        const apiUsers = await res.json();
        return apiUsers.filter((u: UserProfile) => u.role !== 'Admin');
    } catch (e) {
        console.error("Error fetching all profiles, falling back to mock:", e);
        return mockUsers.filter(u => u.role !== 'Admin');
    }
};

const getProfileById = async (id: string, allProfiles: UserProfile[]): Promise<UserProfile | undefined> => {
  // First, try to find the profile in the list we already fetched.
  const profile = allProfiles.find(p => p.id === id);
  if (profile) return profile;

  // If not found (e.g., it's the Admin profile), try a direct fetch.
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/users/${id}`, { cache: 'no-store' });
    if (!res.ok) return undefined;
    return res.json();
  } catch (e) {
    console.error("Error fetching profile by id, falling back to mock:", e);
    return mockUsers.find(u => u.id === id);
  }
};


const getCurrentUser = async (): Promise<UserProfile | undefined> => {
    // In a real app, you would fetch this based on the logged-in session.
    // For this demo, we will use a hardcoded user from the mock data.
    const user = mockUsers.find(u => u.email === 'saytee.software@gmail.com');
    if (user) return user;
    
    // Fallback if the primary user isn't found
    return mockUsers.find(u => u.role === 'Sugar Baby');
};


export default async function ProfilePage({ params }: ProfilePageProps) {
  const allProfiles = await getAllProfiles();
  const profile = await getProfileById(params.id, allProfiles);
  const currentUser = await getCurrentUser();

  if (!profile || !currentUser) {
    notFound();
  }

  return <ProfileClient profile={profile} allProfiles={allProfiles} currentUser={currentUser} />;
}
