import Link from "next/link";
import Image from "next/image";
import { UserProfile } from "@/lib/users";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

type ProfileCardProps = {
  user: UserProfile;
};

export function ProfileCard({ user }: ProfileCardProps) {
  const isOnline = Math.random() > 0.5; // Simulate online status

  return (
    <Link href={`/dashboard/profile/${user.id}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:scale-105 group">
        <div className="relative aspect-[3/4]">
          <Image
            src={user.image || 'https://placehold.co/400x533.png'}
            alt={user.name}
            fill
            className="object-cover"
            data-ai-hint="portrait person"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="flex items-center gap-2 text-white font-bold text-lg font-headline">
              <span>{user.name}, {user.age}</span>
              {user.role !== 'Sugar Baby' && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
              {isOnline && <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>}
            </div>
            <p className="text-sm text-white/90">{user.location}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
