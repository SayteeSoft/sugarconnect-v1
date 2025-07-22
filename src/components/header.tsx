
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Heart } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinkClasses = "transition-colors hover:text-primary text-foreground";
  const mobileNavLinkClasses = "block py-2 text-lg transition-colors hover:text-primary";

  const navLinks = [
    { href: "/dashboard", label: "Profile" },
    { href: "#", label: "Messages" },
    { href: "#", label: "Matches" },
    { href: "#", label: "Search" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Logo isScrolled={true} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm font-medium">
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
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
                    <Button variant="outline">
                        Unlimited
                    </Button>
                     <UserNav />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" size="sm">
            Unlimited
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
