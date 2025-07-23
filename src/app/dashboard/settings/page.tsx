
import { SettingsClient } from "@/components/settings-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Settings - Sugar Connect",
    description: "Manage your profile, password, and account settings.",
};

// In a real app, you would fetch the currently authenticated user.
async function getCurrentUser(): Promise<UserProfile> {
  // We will look for a user with the email `alex.doe@example.com`
  const users = await Promise.resolve(mockUsers);
  return users.find(u => u.email === 'alex.doe@example.com') || users[0];
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  return (
    <SettingsClient user={user} />
  );
}
