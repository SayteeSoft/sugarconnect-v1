
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound } from "next/navigation";
import { getStore, type Store } from '@netlify/blobs';
import { Header } from "@/components/header";

async function findUserById(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    
    let userStore: Store;
    if (process.env.NETLIFY) {
        userStore = getStore('users');
    } else {
        userStore = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    }

    const { blobs } = await userStore.list();
    for (const blob of blobs) {
      try {
        const user = await userStore.get(blob.key, { type: 'json' });
        if (user.id === userId) {
          const { password, ...userToReturn } = user;
          return userToReturn as UserProfile;
        }
      } catch (e) {
        // Silently ignore blobs that are not valid JSON or don't match the user profile structure.
      }
    }
    return null;
}

const getProfileById = async (id: string): Promise<UserProfile | undefined> => {
  try {
    const user = await findUserById(id);
    if (user) return user;
    
    // Fallback to mock data if user not found in blob store
    const { mockUsers } = await import('@/lib/mock-data');
    return mockUsers.find(u => u.id === id);
  } catch (e) {
    console.error(`Error fetching profile by id ${id}, falling back to mock:`, e);
    const { mockUsers } = await import('@/lib/mock-data');
    return mockUsers.find(u => u.id === id);
  }
};


export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  // In a real app, you would fetch the current user from session/auth context.
  // For now, we assume the currentUser is the one being viewed, or an admin.
  // A more robust solution would be needed for a real app.
  const currentUser = profile;

  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
      <Header />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileForm initialProfile={profile} currentUser={currentUser} />
        </div>
      </main>
    </div>
  );
}
