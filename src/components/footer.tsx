import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <Logo isScrolled={true} />
            <p className="mt-4 text-sm text-muted-foreground">
              The exclusive platform for ambitious and attractive individuals to connect.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-3">
            <div>
              <h3 className="font-semibold text-foreground">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground order-2 sm:order-1 mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} SugarConnect. All rights reserved.
          </p>
          <div className="flex space-x-4 order-1 sm:order-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
