
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound } from "next/navigation";
import { mockUsers } from "@/lib/mock-data";
import { getStore, type Store } from '@netlify/blobs';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// This function will run on the server to find a user by their ID.
// It directly accesses the data store instead of making a network request.
async function findUserById(userId: string): Promise<UserProfile | null> {
    const userStore = getStore( process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    const { blobs } = await userStore.list();
    for (const blob of blobs) {
      try {
        const user = await userStore.get(blob.key, { type: 'json' });
        if (user.id === userId) {
          const { password, ...userToReturn } = user;
          return userToReturn as UserProfile;
        }
      } catch (e) {
        console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
      }
    }
    return null;
}

const getProfileById = async (id: string): Promise<UserProfile | undefined> => {
  try {
    const user = await findUserById(id);
    if (user) {
        return user;
    }
    // Fallback to mock data only if not found in the primary store
    console.warn(`User with ID ${id} not found in blob store. Falling back to mock data.`);
    return mockUsers.find(u => u.id === id);
  } catch (e) {
    console.error(`Error fetching profile by id ${id}, falling back to mock:`, e);
    // Fallback to mock data on any other error
    return mockUsers.find(u => u.id === id);
  }
};


export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await getProfileById(params.id);

  if (!profile) {
    notFound();
  }

  // In a real app, you would fetch the current user from session/auth context.
  // For this demo, we'll use the fetched profile as the current user.
  const currentUser = profile;

  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <Header />
        <main className="flex-grow pt-36 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Your Profile</h1>
                    <p className="text-lg text-muted-foreground">View and manage your profile information.</p>
                </div>
                 <ProfileForm initialProfile={profile} currentUser={currentUser} />
            </div>
        </main>
        <Footer />
    </div>
  );
}
