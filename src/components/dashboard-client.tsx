
"use client";

import { useState, useMemo, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { ProfileCard } from "./profile-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type DashboardClientProps = {
  initialProfiles: UserProfile[];
};

export function DashboardClient({ initialProfiles }: DashboardClientProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [locationFilter, setLocationFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [ageRange, setAgeRange] = useState([18, 70]);

  useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const locationMatch = locationFilter === "" || profile.location.toLowerCase().includes(locationFilter.toLowerCase());
      const sexMatch = sexFilter === "all" || profile.sex === sexFilter;
      const roleMatch = roleFilter === "all" || profile.role.replace(' ', '-') === roleFilter;
      const ageMatch = profile.age >= ageRange[0] && profile.age <= ageRange[1];
      return locationMatch && sexMatch && roleMatch && ageMatch;
    });
  }, [profiles, locationFilter, sexFilter, roleFilter, ageRange]);

  return (
    <div className="space-y-8">
      <div className="p-4 bg-card rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location-filter"
                placeholder="Search by city..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex-filter">Sex</Label>
            <Select value={sexFilter} onValueChange={setSexFilter}>
              <SelectTrigger id="sex-filter">
                <SelectValue placeholder="Any Sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Sex</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-filter">Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="Any Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Role</SelectItem>
                <SelectItem value="Sugar-Baby">Sugar Baby</SelectItem>
                <SelectItem value="Sugar-Daddy">Sugar Daddy</SelectItem>
                <SelectItem value="Sugar-Mommy">Sugar Mommy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
            <Slider
              value={ageRange}
              onValueChange={(value) => setAgeRange(value)}
              min={18}
              max={70}
              step={1}
            />
          </div>
        </div>
      </div>

      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  );
}
