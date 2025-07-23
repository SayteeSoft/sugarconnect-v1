
import { SearchClient } from "@/components/search-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";

async function getProfiles(): Promise<UserProfile[]> {
  // In a real app, you'd fetch this from your API
  // For this example, we'll use mock data to ensure we have profiles to display
  const users = await Promise.resolve(mockUsers.filter(u => u.role !== 'Admin'));
  
  // Add some placeholder users to match the design
  const placeholderUsers: UserProfile[] = [
    {
        id: 'olivia-placeholder',
        email: 'olivia@example.com',
        name: 'Olivia',
        age: 23,
        location: 'Medellin, CO',
        role: 'Sugar Baby',
        sex: 'Female',
        bio: 'Placeholder bio for Olivia.',
        interests: ['Travel', 'Music'],
        image: 'https://placehold.co/400x400.png?text=Olivia'
    },
    {
        id: 'cecilia-placeholder',
        email: 'cecilia@example.com',
        name: 'Cecilia',
        age: 25,
        location: 'Rio, Brazil',
        role: 'Sugar Baby',
        sex: 'Female',
        bio: 'Placeholder bio for Cecilia.',
        interests: ['Dancing', 'Beaches'],
        image: 'https://placehold.co/400x400.png?text=Cecilia'
    }
  ];

  return [...users, ...placeholderUsers];
}


export default async function SearchPage() {
  const profiles = await getProfiles();

  return (
      <SearchClient initialProfiles={profiles} />
  );
}
