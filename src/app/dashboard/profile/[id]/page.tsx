
import { UserProfile } from "@/lib/users";
import { ProfileForm } from "@/components/profile/profile-form";
import { notFound } from "next/navigation";
import { getStore, type Store } from '@netlify/blobs';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

async function findUserById(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
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
  const profile = await getProfileById(params.id);

  if (!profile) {
    notFound();
  }

  // In a real app, you would fetch the current user from session/auth context.
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
                 <Card className="max-w-6xl mx-auto shadow-xl">
                    <CardContent className="p-8 md:p-12">
                        <ProfileForm initialProfile={profile} currentUser={currentUser} />
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
