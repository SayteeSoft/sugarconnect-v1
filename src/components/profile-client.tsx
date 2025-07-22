"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserProfile } from "@/lib/mock-data";
import { summarizeProfile } from "@/ai/flows/summarize-profile";
import { matchProfiles, type MatchProfilesOutput } from "@/ai/flows/ai-match-profiles";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Sparkles, Heart } from "lucide-react";

type ProfileClientProps = {
  profile: UserProfile;
  allProfiles: UserProfile[];
  currentUser: UserProfile;
};

export function ProfileClient({ profile, allProfiles, currentUser }: ProfileClientProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState("");
  const [matches, setMatches] = useState<MatchProfilesOutput['matches']>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);

  useEffect(() => {
    async function getSummary() {
      if (!profile) return;
      setIsSummaryLoading(true);
      try {
        const profileDetails = `Name: ${profile.name}, Age: ${profile.age}, Location: ${profile.location}, Role: ${profile.role}, Bio: ${profile.bio}, Interests: ${profile.interests.join(", ")}`;
        const result = await summarizeProfile({
          profileDetails,
          userInterests: currentUser.interests.join(", "),
        });
        setSummary(result.summary);
      } catch (error) {
        console.error("Failed to summarize profile:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not generate profile summary.",
        });
        setSummary("Could not load AI summary.");
      } finally {
        setIsSummaryLoading(false);
      }
    }
    getSummary();
  }, [profile, currentUser.interests, toast]);

  const handleFindMatches = async () => {
    setIsMatchesLoading(true);
    try {
      const candidateProfiles = allProfiles.filter(p => p.id !== profile.id);
      const candidateProfileSummaries = candidateProfiles.map(p => `Name: ${p.name}, Age: ${p.age}, Bio: ${p.bio}, Interests: ${p.interests.join(", ")}`);
      const userProfileSummary = `Name: ${profile.name}, Age: ${profile.age}, Bio: ${profile.bio}, Interests: ${profile.interests.join(", ")}`;
      
      const result = await matchProfiles({
        userProfileSummary,
        candidateProfileSummaries,
        matchCriteria: `Find the best matches for ${profile.name}. Consider shared interests, age compatibility, and role preferences. User is looking for someone who is ${profile.role.includes('Baby') ? 'generous and established' : 'ambitious and attractive'}.`,
      });

      const matchedProfilesWithData = result.matches.map(match => {
        const originalProfile = candidateProfiles.find(p => match.profileSummary.includes(p.name));
        return { ...match, ...originalProfile };
      });
      
      setMatches(matchedProfilesWithData);
    } catch (error) {
      console.error("Failed to find matches:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not find matches for this profile.",
      });
    } finally {
      setIsMatchesLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="overflow-hidden">
            <Image
              src={profile.image}
              alt={profile.name}
              width={600}
              height={600}
              className="w-full aspect-square object-cover"
              data-ai-hint="portrait person"
            />
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold font-headline">{profile.name}</h2>
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{profile.age} years old</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              </div>
              <Badge className="mt-4">{profile.role}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                <span>AI Generated Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-muted-foreground">{summary}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About {profile.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg leading-relaxed">{profile.bio}</p>
              <div>
                <h4 className="font-semibold mb-3">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>

               <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={handleFindMatches} disabled={isMatchesLoading}>
                    {isMatchesLoading ? 'Finding Matches...' : <>
                    <Heart className="mr-2 h-4 w-4" /> Find Matches for {profile.name}
                    </>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Top Matches for {profile.name}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                    {isMatchesLoading ? (
                      <p>Finding the best matches...</p>
                    ) : matches.length > 0 ? (
                      matches.map((match, index) => (
                        <Card key={index}>
                           <CardContent className="p-4 flex gap-4">
                             <Avatar className="h-20 w-20">
                               <AvatarImage src={match.image} alt={match.name} data-ai-hint="portrait person" />
                               <AvatarFallback>{match.name?.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div className="flex-grow">
                              <h4 className="font-bold">{match.name}, {match.age}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{match.reason}</p>
                              <div className="mt-2">
                                <Label className="text-xs">Match Score: {Math.round(match.matchScore * 100)}%</Label>
                                <Progress value={match.matchScore * 100} className="h-2 mt-1" />
                              </div>
                             </div>
                           </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p>No matches found yet. Click the button to start!</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
