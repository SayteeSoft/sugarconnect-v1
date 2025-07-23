"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Eye, MessageSquare, Trash2 } from "lucide-react";

type MatchesClientProps = {
  initialMatches: UserProfile[];
};

const MatchItem = ({ user }: { user: UserProfile }) => {
    const isOnline = Math.random() > 0.5;
    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}, {user.age}</h3>
                         {isOnline && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.location}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
};


export function MatchesClient({ initialMatches }: MatchesClientProps) {
  const [favorites] = useState(initialMatches.slice(0, 2));
  const [visitors] = useState(initialMatches.slice(1, 4));
  const [viewed] = useState(initialMatches.slice(2, 3));

  const tabContent = (title: string, profiles: UserProfile[]) => (
     profiles.length > 0 ? (
        <div className="space-y-4">
            {profiles.map(profile => <MatchItem key={profile.id} user={profile} />)}
        </div>
    ) : (
        <div className="text-center py-16 text-muted-foreground">
            <p>No profiles in this list yet.</p>
        </div>
    )
  );

  return (
    <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Matches</h1>
            <p className="text-lg text-muted-foreground">Browse your favorites, see who visited your profile, and who you have viewed.</p>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="favorites"><Heart className="mr-2 h-4 w-4" />Favorites</TabsTrigger>
                <TabsTrigger value="visitors"><Users className="mr-2 h-4 w-4" />Visitors</TabsTrigger>
                <TabsTrigger value="viewed"><Eye className="mr-2 h-4 w-4" />Viewed</TabsTrigger>
            </TabsList>
            <TabsContent value="favorites">
                {tabContent("Favorites", favorites)}
            </TabsContent>
            <TabsContent value="visitors">
                {tabContent("Visitors", visitors)}
            </TabsContent>
            <TabsContent value="viewed">
                {tabContent("Viewed", viewed)}
            </TabsContent>
        </Tabs>
    </div>
  );
}
