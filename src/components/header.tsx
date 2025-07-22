
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';

export function Header() {
  const navLinkClasses = "transition-colors hover:text-primary text-foreground";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <Logo isScrolled={true} />
        </div>

        <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className={navLinkClasses}>
            Profile
          </Link>
          <Link href="#" className={navLinkClasses}>
            Messages
          </Link>
          <Link href="#" className={navLinkClasses}>
            Matches
          </Link>
          <Link href="#" className={navLinkClasses}>
            Search
          </Link>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Button variant="outline" size="sm">
            Unlimited
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
