
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/users';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const navLinkClasses = "transition-colors hover:text-primary text-foreground text-base";
  const mobileNavLinkClasses = "block py-2 text-lg transition-colors hover:text-primary";
  const [profileUrl, setProfileUrl] = useState('/dashboard/profile');

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const parsedUser: UserProfile = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser && parsedUser.id) {
                setProfileUrl(`/dashboard/profile/${parsedUser.id}`);
            }
        } catch (e) {
            localStorage.removeItem("user");
            setUser(null);
            setProfileUrl('/dashboard/profile');
        }
    }
  }, []);

  const navLinks = [
    { href: profileUrl, label: "Profile" },
    { href: "/messages", label: "Messages" },
    { href: "/matches", label: "Matches" },
    { href: "/search", label: "Search" },
  ];

  const CreditsButton = () => {
    if (!mounted || !user) return null;

    if (user.role === 'Admin' || user.role === 'Sugar Baby') {
      return (
        <Button variant="secondary" asChild>
          <Link href="/purchase-credits">Unlimited Credits</Link>
        </Button>
      );
    }

    if (user.role === 'Sugar Daddy') {
      return (
        <Button variant="secondary" asChild>
          <Link href="/purchase-credits">
            <span>Buy Credits</span>
            <div className="ml-2 bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
              {user.credits ?? 10}
            </div>
          </Link>
        </Button>
      );
    }

    return null;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all bg-white dark:bg-[#22252a] shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Logo isScrolled={true} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-base font-medium">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} className={navLinkClasses}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
              <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              </SheetHeader>
              <div className="p-6">
                <div className="mb-8">
                   <Logo isScrolled={true} />
                </div>
                <nav className="flex flex-col gap-4">
                  {navLinks.map(link => (
                     <Link key={link.label} href={link.href} className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                 <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4">
                    <CreditsButton />
                    <UserNav user={user} mounted={mounted} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-4">
          <CreditsButton />
          <UserNav user={user} mounted={mounted} />
        </div>
      </div>
    </header>
  );
}
