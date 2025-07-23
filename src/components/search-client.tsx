
"use client";

import { useState, useMemo } from "react";
import { UserProfile } from "@/lib/users";
import { ProfileCard } from "./profile-card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Filter, Wifi, Sparkles, Image as ImageIcon } from "lucide-react";

type SearchClientProps = {
  initialProfiles: UserProfile[];
};

export function SearchClient({ initialProfiles }: SearchClientProps) {
  const [profiles] = useState(initialProfiles);
  const [locationFilter, setLocationFilter] = useState("");
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [heightRange, setHeightRange] = useState([150, 200]); // in cm
  const [isNew, setIsNew] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [withPhoto, setWithPhoto] = useState(true);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const locationMatch = locationFilter === "" || profile.location.toLowerCase().includes(locationFilter.toLowerCase());
      const ageMatch = profile.age >= ageRange[0] && profile.age <= ageRange[1];
      const photoMatch = !withPhoto || (!!profile.image && !profile.image.includes('placeholder'));
      
      // Note: 'isNew' and 'isOnline' are simulated as there's no data for them yet.
      // In a real app, you would have this data in your UserProfile model.
      const newMatch = !isNew || Math.random() > 0.8; // Simulating 20% of profiles are "new"
      const onlineMatch = !isOnline || Math.random() > 0.5; // Simulating 50% of profiles are "online"

      return locationMatch && ageMatch && photoMatch && newMatch && onlineMatch;
    });
  }, [profiles, locationFilter, ageRange, withPhoto, isNew, isOnline]);
  
  const formatHeight = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const handleClearFilters = () => {
    setLocationFilter("");
    setAgeRange([18, 65]);
    setHeightRange([150, 200]);
    setIsNew(false);
    setIsOnline(false);
    setWithPhoto(true);
  };

  return (
    <div className="bg-secondary dark:bg-background flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Discover Your Match</h1>
                <p className="text-lg text-muted-foreground">Use our advanced search to find exactly who you're looking for.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <Card className="p-6 sticky top-24 shadow-lg">
                       <div className="flex items-center gap-2 mb-6">
                         <Filter className="h-5 w-5"/>
                         <h2 className="text-xl font-bold font-headline">Filters</h2>
                       </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="new-filter" className="flex items-center gap-2"><Sparkles className="h-4 w-4" />New</Label>
                                <Switch id="new-filter" checked={isNew} onCheckedChange={setIsNew} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="online-filter" className="flex items-center gap-2"><Wifi className="h-4 w-4" />Online</Label>
                                <Switch id="online-filter" checked={isOnline} onCheckedChange={setIsOnline} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="photo-filter" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />With Photo</Label>
                                <Switch id="photo-filter" checked={withPhoto} onCheckedChange={setWithPhoto} />
                            </div>
                            <div className="space-y-3 pt-2">
                                <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
                                <Slider
                                    value={ageRange}
                                    onValueChange={(value) => setAgeRange(value)}
                                    min={18}
                                    max={70}
                                    step={1}
                                />
                            </div>
                             <div className="space-y-3 pt-2">
                                <Label>Height: {formatHeight(heightRange[0])} - {formatHeight(heightRange[1])}</Label>
                                <Slider
                                    value={heightRange}
                                    onValueChange={(value) => setHeightRange(value)}
                                    min={150}
                                    max={200}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="location-filter">Location</Label>
                                <Input
                                    id="location-filter"
                                    placeholder="e.g. London"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 pt-4">
                                <Button>Apply Filters</Button>
                                <Button variant="ghost" onClick={handleClearFilters}>Clear Filters</Button>
                            </div>
                        </div>
                    </Card>
                </aside>

                <main className="lg:col-span-3">
                    <div className="mb-4">
                        <p className="font-semibold text-muted-foreground">{filteredProfiles.length} Profiles found</p>
                    </div>
                     {filteredProfiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProfiles.map((profile) => (
                            <ProfileCard key={profile.id} user={profile} />
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                        <p className="text-lg font-medium">No Profiles Found</p>
                        <p className="text-muted-foreground">Try adjusting your filters to find more people.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    </div>
  );
}
