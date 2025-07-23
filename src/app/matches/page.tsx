import { MatchesClient } from "@/components/matches-client";
import { UserProfile } from "@/lib/users";
import { mockUsers } from "@/lib/mock-data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Matches - Sugar Connect",
    description: "Browse your favorites, see who visited your profile, and who you have viewed.",
};

async function getMatches(): Promise<UserProfile[]> {
  // In a real app, you would fetch different lists for favorites, visitors, etc.
  // For this example, we'll use a subset of the mock data.
  return Promise.resolve(mockUsers.slice(0, 4));
}

export default async function MatchesPage() {
  const matches = await getMatches();
  
  return (
    <MatchesClient initialMatches={matches} />
  );
}
