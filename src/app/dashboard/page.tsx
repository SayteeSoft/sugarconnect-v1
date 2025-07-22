import { users } from "@/lib/mock-data";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  // In a real app, this would be an API call to your backend
  const profiles = users;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Discover Profiles</h1>
        <p className="text-muted-foreground">Browse and connect with members of the community.</p>
      </div>
      <DashboardClient profiles={profiles} />
    </div>
  );
}
