
import { SearchClient } from "@/components/search-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";

async function getProfiles(): Promise<UserProfile[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL;
    let users: UserProfile[];

    if (!baseUrl) {
      console.warn("URL env var not set, falling back to mock users for search.");
      users = [...mockUsers];
    } else {
        const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
        const allUsers = [...mockUsers];
        if (res.ok) {
            const apiUsers = await res.json();
            const mockUserIds = new Set(mockUsers.map(u => u.id));
            for (const apiUser of apiUsers) {
                if (!mockUserIds.has(apiUser.id)) {
                    allUsers.push(apiUser);
                }
            }
        } else {
          console.warn(`API call failed with status ${res.status}, using only mock users for search.`);
        }
        users = allUsers;
    }
    
    return users.filter((user: UserProfile) => user.role !== 'Admin');

  } catch (error) {
    console.error("Error fetching profiles for search, falling back to mock data:", error);
    return mockUsers.filter(user => user.role !== 'Admin');
  }
}


export default async function SearchPage() {
  const profiles = await getProfiles();

  return (
      <SearchClient initialProfiles={profiles} />
  );
}
