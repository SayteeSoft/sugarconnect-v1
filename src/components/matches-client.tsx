
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/lib/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Eye, MessageSquare, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

type MatchesClientProps = {
  initialMatches: UserProfile[];
};

type ListType = 'favorites' | 'visitors' | 'viewed';

export function MatchesClient({ initialMatches }: MatchesClientProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<UserProfile[]>([]);
  const [visitors, setVisitors] = useState<UserProfile[]>([]);
  const [viewed, setViewed] = useState<UserProfile[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);

            let filteredMatches: UserProfile[];

            if (parsedUser.role === 'Admin') {
                filteredMatches = initialMatches;
            } else if (parsedUser.role === 'Sugar Baby') {
                filteredMatches = initialMatches.filter(user => user.role === 'Sugar Daddy');
            } else if (parsedUser.role === 'Sugar Daddy') {
                filteredMatches = initialMatches.filter(user => user.role === 'Sugar Baby');
            } else {
                filteredMatches = [];
            }
            
            setFavorites(filteredMatches.slice(0, 2));
            setVisitors(filteredMatches.slice(1, 4).filter(u => !favorites.some(f => f.id === u.id)));
            setViewed(filteredMatches.slice(2, 5).filter(u => !favorites.some(f => f.id === u.id) && !visitors.some(v => v.id === u.id)));

        } catch (e) {
            console.error("Failed to parse user from storage", e);
        }
    }
  }, [initialMatches]);


  const handleDelete = (userId: string, list: ListType) => {
    switch (list) {
      case 'favorites':
        setFavorites(favorites.filter(u => u.id !== userId));
        break;
      case 'visitors':
        setVisitors(visitors.filter(u => u.id !== userId));
        break;
      case 'viewed':
        setViewed(viewed.filter(u => u.id !== userId));
        break;
    }
    toast({
      title: "Profile Removed",
      description: "The profile has been removed from your list.",
    });
  };

  const MatchItem = ({ user, listType }: { user: UserProfile, listType: ListType }) => {
    const isOnline = Math.random() > 0.5;
    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/profile/${user.id}`}>
                <Avatar className="h-14 w-14">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}, {user.age}</h3>
                         {isOnline && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.location}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove {user.name} from your {listType} list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(user.id, listType)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    );
  };

  const tabContent = (title: string, profiles: UserProfile[], listType: ListType) => (
     profiles.length > 0 ? (
        <div className="space-y-4">
            {profiles.map(profile => <MatchItem key={profile.id} user={profile} listType={listType} />)}
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
                {tabContent("Favorites", favorites, 'favorites')}
            </TabsContent>
            <TabsContent value="visitors">
                {tabContent("Visitors", visitors, 'visitors')}
            </TabsContent>
            <TabsContent value="viewed">
                {tabContent("Viewed", viewed, 'viewed')}
            </TabsContent>
        </Tabs>
    </div>
  );
}
