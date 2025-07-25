import { MatchesClient } from "@/components/matches-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Matches - Sugar Connect",
    description: "Browse your favorites, see who visited your profile, and who you have viewed.",
};

async function getMatches(): Promise<UserProfile[]> {
  // In a real app, this would be a more sophisticated fetch from a DB
  // For now, we return all non-admin mock users for client-side filtering.
  return Promise.resolve(mockUsers.filter(u => u.role !== 'Admin'));
}

export default async function MatchesPage() {
  const matches = await getMatches();
  
  return (
    <MatchesClient initialMatches={matches} />
  );
}
