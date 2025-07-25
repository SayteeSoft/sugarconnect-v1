
"use client";

import { UserProfile } from "@/lib/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";

type NotificationToastProps = {
  user: UserProfile;
  actionText: string;
  profileUrl: string;
};

export function NotificationToast({ user, actionText, profileUrl }: NotificationToastProps) {
  return (
    <div className="w-full flex items-center gap-4">
      <Avatar>
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p>
          <span className="font-semibold">{user.name}</span>
          <span className="inline-flex items-center gap-1.5 ml-1">
             {actionText.includes('favorited') && <Heart className="inline-block h-4 w-4 text-primary" />}
            {actionText}
          </span>
        </p>
        <div className="mt-2 flex gap-2">
            <Button asChild size="sm">
                <Link href={profileUrl}>View Profile</Link>
            </Button>
             <Button variant="outline" size="sm">
                Not Now
            </Button>
        </div>
      </div>
    </div>
  );
}

    