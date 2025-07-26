import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Testimonial } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Link from "next/link";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="flex text-primary mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-current" />
          ))}
        </div>
        <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.quote}&quot;</p>
        <div className="flex items-center gap-3">
            <Link href={`/dashboard/profile/${testimonial.id}`}>
              {testimonial.image ? (
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  data-ai-hint="avatar person"
                />
              ) : (
                <Avatar className="h-10 w-10">
                    <AvatarFallback>{testimonial.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </Link>
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
