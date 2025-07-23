
import { SearchClient } from "@/components/search-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";

async function getProfiles(): Promise<UserProfile[]> {
  // In a real app, you'd fetch this from your API
  // For this example, we'll use mock data to ensure we have profiles to display
  return Promise.resolve(mockUsers.filter(u => u.role !== 'Admin'));
}


export default async function SearchPage() {
  const profiles = await getProfiles();

  return (
    <div className="flex-1">
      <SearchClient initialProfiles={profiles} />
    </div>
  );
}
