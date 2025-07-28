
import { MatchesClient } from "@/components/matches-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Matches - Sugar Connect",
    description: "Browse your favorites, see who visited your profile, and who you have viewed.",
};

export default function MatchesPage() {
  return (
    <MatchesClient />
  );
}
