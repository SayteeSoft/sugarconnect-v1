
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound } from "next/navigation";
import { mockUsers } from "@/lib/mock-data";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

// Helper function to get the base URL
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  if (process.env.URL) {
    return `https://${process.env.URL}`;
  }
  return 'http://localhost:3000';
};


const getProfileById = async (id: string): Promise<UserProfile | undefined> => {
  // Always fetch from the API to get the most up-to-date data
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/users/${id}`, { cache: 'no-store' });
    if (!res.ok) {
        console.error(`API fetch failed with ${res.status}. Falling back to mock data for user ${id}.`);
        return mockUsers.find(u => u.id === id);
    }
    return res.json();
  } catch (e) {
    console.error(`Error fetching profile by id ${id}, falling back to mock:`, e);
    // Fallback to mock data on error
    return mockUsers.find(u => u.id === id);
  }
};


export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfileById(params.id);

  if (!profile) {
    notFound();
  }

  // In a real app, you would fetch the current user from session/auth context
  // For now, we'll just pass the fetched profile as the current user if it matches a known pattern,
  // or a default mock user. This part is for demonstration.
  const currentUser = profile;

  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <main className="flex-grow pt-24 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <ProfileForm initialProfile={profile} currentUser={currentUser} />
            </div>
        </main>
    </div>
  );
}
