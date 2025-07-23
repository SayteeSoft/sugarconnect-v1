
import { AdminClient } from "@/components/admin-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard - Sugar Connect",
    description: "Manage users and view site statistics.",
};

async function getUsers(): Promise<UserProfile[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL;
    let users: UserProfile[];

    if (!baseUrl) {
      console.warn("URL env var not set, falling back to mock users.");
      users = [...mockUsers];
    } else {
        const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
        if (!res.ok) {
            console.warn(`API call failed with status ${res.status}, falling back to mock users.`);
            users = [...mockUsers];
        } else {
            const apiUsers = await res.json();
            // Combine mock users and API users, preventing duplicates
            const allUsers = [...mockUsers];
            const mockUserIds = new Set(mockUsers.map(u => u.id));
            for (const apiUser of apiUsers) {
                if (!mockUserIds.has(apiUser.id)) {
                    allUsers.push(apiUser);
                }
            }
            users = allUsers;
        }
    }

    // Ensure Admin is always first
    const adminUser = users.find(u => u.role === 'Admin');
    const otherUsers = users.filter(u => u.role !== 'Admin');
    
    return adminUser ? [adminUser, ...otherUsers] : otherUsers;

  } catch (e) {
    console.error("Error fetching users, falling back to mock users:", e);
    const users = [...mockUsers];
    const adminUser = users.find(u => u.role === 'Admin');
    const otherUsers = users.filter(u => u.role !== 'Admin');
    return adminUser ? [adminUser, ...otherUsers] : otherUsers;
  }
}

export default async function AdminPage() {
  const users = await getUsers();
  
  return (
    <AdminClient initialUsers={users} />
  );
}
