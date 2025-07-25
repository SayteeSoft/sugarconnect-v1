import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className, inSidebar = false, isScrolled = false }: { className?: string, inSidebar?: boolean, isScrolled?: boolean }) {
  return (
    <Link href="/" className={cn(
      "flex items-center gap-2 font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1 transition-colors",
      inSidebar ? "text-sidebar-primary" : "text-white",
      isScrolled && !inSidebar && "text-primary",
      className
    )}>
      <Heart className="h-6 w-6 fill-current" />
      <span className="text-2xl font-headline">Sugar Connect</span>
    </Link>
  );
}
