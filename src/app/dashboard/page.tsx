
import { DashboardClient } from "@/components/dashboard-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";

async function getProfiles(): Promise<UserProfile[]> {
  // In a real app, this would be an API call to your backend
  // For local development, we are using mock data.
  if (process.env.NETLIFY) {
      try {
        const res = await fetch(`/api/users`, { cache: 'no-store' });
        if (!res.ok) {
          console.error("Failed to fetch profiles:", res.statusText);
          return [];
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching profiles:", error);
        return [];
      }
  }
  return Promise.resolve(mockUsers);
}


export default async function DashboardPage() {
  const profiles = await getProfiles();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Discover Profiles</h1>
        <p className="text-muted-foreground">Browse and connect with members of the community.</p>
      </div>
      <DashboardClient initialProfiles={profiles} />
    </div>
  );
}
