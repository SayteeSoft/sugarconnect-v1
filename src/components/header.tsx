
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClasses = cn(
    "transition-colors hover:text-primary",
    isScrolled ? "text-foreground" : "text-white"
  );

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all",
      isScrolled ? "bg-background shadow-md" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo isScrolled={isScrolled} />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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
        </div>
        <div className="flex items-center gap-4">
          <Button variant={isScrolled ? "outline" : "secondary"} size="sm" className={cn(!isScrolled && "bg-white/20 border-white/50 text-white hover:bg-white/30")}>
            Unlimited
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
