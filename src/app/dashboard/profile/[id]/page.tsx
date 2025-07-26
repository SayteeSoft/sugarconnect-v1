
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound } from "next/navigation";
import { getStore, type Store } from '@netlify/blobs';
import { Header } from "@/components/header";
import { mockUsers } from "@/lib/mock-data";

async function findUserById(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    
    let userStore: Store;
    // In production, always use the Netlify Blob store as the single source of truth.
    if (process.env.NETLIFY) {
        userStore = getStore('users');
    } else {
        // For local development, use a local mock store.
        userStore = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    }

    try {
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
    } catch (e) {
      console.error("Error connecting to blob store in findUserById:", e);
      // If the blob store itself fails, we should not fall back to mock data in production.
    }
    
    // Fallback to mock data ONLY for local development if user is not in the local blob store.
    // This prevents production from ever showing mock data.
    if (process.env.NODE_ENV !== 'production') {
        const mockUser = mockUsers.find(u => u.id === userId);
        if (mockUser) {
            console.warn(`User with id ${userId} not found in blob store, falling back to mock data for local dev.`);
            return mockUser;
        }
    }
    
    return null;
}

const getProfileById = async (id: string): Promise<UserProfile | null | undefined> => {
  let user: UserProfile | null | undefined = null;
  try {
    user = await findUserById(id);
  } catch (e) {
    console.error(`Error fetching profile by id ${id} from primary source:`, e);
  }
  
  return user;
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
      <main className="flex-grow pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileForm initialProfile={profile} currentUser={currentUser} />
        </div>
      </main>
    </div>
  );
}
