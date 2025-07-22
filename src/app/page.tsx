"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { CookieConsent } from '@/components/cookie-consent';

export default function Home() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-white text-center overflow-hidden">
          <Image
            src="/sd-connect-hero-background.jpg"
            alt="Couple"
            fill
            className="absolute inset-0 z-0 object-cover"
            style={{ transform: `translateY(${offsetY * 0.5}px)` }}
            data-ai-hint="couple relationship"
          />
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="relative z-20 px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
              Sugar Connect
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl font-light mb-6">
              For Sugar Daddy and Sugar Baby
            </p>
            <p className="max-w-3xl mx-auto text-base md:text-lg mb-8">
              An exclusive platform for ambitious and attractive individuals
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button size="lg" variant="secondary" asChild className="bg-white/90 hover:bg-white text-black w-full sm:w-auto">
                <Link href="/login">I'm a Sugar Baby</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="bg-white/90 hover:bg-white text-black w-full sm:w-auto">
                <Link href="/login">I'm a Sugar Daddy</Link>
              </Button>
            </div>
            <Button size="lg" asChild>
              <Link href="/login">
                <Heart className="mr-2 h-5 w-5" /> Find Your Match
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">Featured Profiles</h2>
            </div>
            {/* Placeholder for featured profiles */}
             <div className="text-center text-muted-foreground">
                Featured profiles will be displayed here.
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SugarConnect. All rights reserved.</p>
      </footer>
      <CookieConsent />
    </div>
  );
}
