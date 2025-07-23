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
    const baseUrl = process.env.URL || 'http://localhost:9002';
    const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
    if (!res.ok) return [...mockUsers];
    const apiUsers = await res.json();
    return [...mockUsers, ...apiUsers.filter((apiUser: UserProfile) => !mockUsers.some(mockUser => mockUser.id === apiUser.id))];
  } catch (e) {
    console.error("Error fetching users:", e);
    return [...mockUsers];
  }
}

export default async function AdminPage() {
  const users = await getUsers();
  
  return (
    <AdminClient initialUsers={users} />
  );
}
