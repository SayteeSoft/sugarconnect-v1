import Link from "next/link";
import Image from "next/image";
import { UserProfile } from "@/lib/users";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

type ProfileCardProps = {
  user: UserProfile;
};

export function ProfileCard({ user }: ProfileCardProps) {
  const roleVariant = user.role.includes('Baby') ? 'secondary' : 'default';

  return (
    <Link href={`/dashboard/profile/${user.id}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:scale-105 hover:border-primary/50">
        <div className="relative">
          <Image
            src={user.image}
            alt={user.name}
            width={400}
            height={400}
            className="aspect-square w-full object-cover"
            data-ai-hint="portrait person"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-bold text-white font-headline">{user.name}, {user.age}</h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
          </div>
          <Badge variant={roleVariant} className="absolute top-3 right-3">{user.role}</Badge>
        </div>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm line-clamp-2 h-10">{user.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="outline">{interest}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
