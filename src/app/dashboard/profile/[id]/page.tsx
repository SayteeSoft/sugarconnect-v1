
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound } from "next/navigation";
import { mockUsers } from "@/lib/mock-data";
import { DashboardHeader } from "@/components/profile/dashboard-header";
import { Footer } from "@/components/footer";

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
          return mockUsers;
        }
        const apiUsers = await res.json();
        return apiUsers;
    } catch (e) {
        console.error("Error fetching all profiles, falling back to mock:", e);
        return mockUsers;
    }
};

const getProfileById = async (id: string, allProfiles: UserProfile[]): Promise<UserProfile | undefined> => {
  const profile = allProfiles.find(p => p.id === id);
  if (profile) return profile;

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


export default async function ProfilePage({ params }: ProfilePageProps) {
  const allProfiles = await getAllProfiles();
  const profile = await getProfileById(params.id, allProfiles);

  if (!profile) {
    notFound();
  }

  // A logged-in user would be fetched from a session
  const currentUser = allProfiles.find(u => u.id === '1') || allProfiles[0];

  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <DashboardHeader />
        <main className="flex-grow pt-24 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <ProfileForm initialProfile={profile} currentUser={currentUser} />
            </div>
        </main>
        <Footer />
    </div>
  );
}

