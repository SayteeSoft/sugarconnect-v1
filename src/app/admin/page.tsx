
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
    const baseUrl = process.env.URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
    if (!res.ok) {
        // Fallback to mock data if API fails
        const users = [...mockUsers];
        const adminUser = users.find(u => u.role === 'Admin');
        const otherUsers = users.filter(u => u.role !== 'Admin');
        return adminUser ? [adminUser, ...otherUsers] : otherUsers;
    }
    const apiUsers = await res.json();
    const allUsers = [...mockUsers, ...apiUsers.filter((apiUser: UserProfile) => !mockUsers.some(mockUser => mockUser.id === apiUser.id))];

    // Ensure Admin is always first
    const adminUser = allUsers.find(u => u.role === 'Admin');
    const otherUsers = allUsers.filter(u => u.role !== 'Admin');
    return adminUser ? [adminUser, ...otherUsers] : otherUsers;

  } catch (e) {
    console.error("Error fetching users:", e);
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
