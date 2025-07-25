
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';
import { UserProfile } from '@/lib/users';
import { FeaturedProfileCard } from '@/components/featured-profile-card';
import { TestimonialsSection } from '@/components/testimonials-section';
import { mockTestimonials, mockUsers, Testimonial } from '@/lib/mock-data';
import { SecuritySection } from '@/components/security-section';
import { ByTheNumbersSection } from '@/components/by-the-numbers-section';
import { SugarRelationshipSection } from '@/components/sugar-relationship-section';
import { WhatIsSection } from '@/components/what-is-section';

async function getFeaturedProfiles(): Promise<UserProfile[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.URL;
    let users: UserProfile[];

    if (!baseUrl) {
      // Fallback for local dev or environments where URL is not set
      console.warn("URL env var not set, falling back to mock users for featured profiles.");
      users = [...mockUsers];
    } else {
      const res = await fetch(`${baseUrl}/api/users`, { cache: 'no-store' });
      const allUsers = [...mockUsers];
      if (res.ok) {
          const apiUsers = await res.json();
          const mockUserIds = new Set(mockUsers.map(u => u.id));
          for (const apiUser of apiUsers) {
              if (!mockUserIds.has(apiUser.id)) {
                  allUsers.push(apiUser);
              }
          }
      } else {
        console.warn(`API call failed with status ${res.status}, using only mock users for featured profiles.`);
      }
      users = allUsers;
    }
    // Filter out admin users and take the first 4 non-admin profiles
    return users.filter((user: UserProfile) => user.role !== 'Admin').slice(0, 4);
  } catch (error) {
    console.error("Error fetching profiles, falling back to mock data:", error);
    // Return mock data on any fetch error
    return mockUsers.filter(user => user.role !== 'Admin').slice(0, 4);
  }
}


export default function Home() {
  const [featuredProfiles, setFeaturedProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>(mockTestimonials);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setIsLoggedIn(true);
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            if (parsedUser.role === 'Sugar Daddy') {
                setFilteredTestimonials(mockTestimonials.filter(t => t.role === 'Sugar Baby'));
            } else if (parsedUser.role === 'Sugar Baby') {
                setFilteredTestimonials(mockTestimonials.filter(t => t.role === 'Sugar Daddy'));
            } else {
                setFilteredTestimonials(mockTestimonials);
            }

        } catch (e) {
            setUser(null);
            setFilteredTestimonials(mockTestimonials);
        }
    } else {
        setIsLoggedIn(false);
        setUser(null);
        setFilteredTestimonials(mockTestimonials);
    }
  }, []);

  const handleScroll = () => {
    setOffsetY(window.scrollY * 0.5);
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      const profiles = await getFeaturedProfiles();
      
      if (user?.role === 'Sugar Daddy') {
        setFeaturedProfiles(profiles.filter(p => p.role === 'Sugar Baby'));
      } else if (user?.role === 'Sugar Baby') {
        setFeaturedProfiles(profiles.filter(p => p.role === 'Sugar Daddy'));
      } else {
        setFeaturedProfiles(profiles);
      }

      setLoading(false);
    };
    loadProfiles();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[85vh] md:h-[85vh] flex items-center justify-center text-white text-center overflow-hidden">
          <Image
            src="/sd-connect-hero-background.jpg"
            alt="Couple"
            fill
            className="absolute inset-0 z-0 object-cover object-center"
            style={{ transform: `translateY(${offsetY + 5}px)` }}
            data-ai-hint="couple relationship"
          />
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="relative z-20 px-4">
            <h1 className="text-8xl md:text-9xl font-headline font-bold tracking-tighter mb-4">
              Sugar Connect
            </h1>
            <p className="max-w-2xl mx-auto text-3xl md:text-4xl font-light mb-6">
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
            <Button size="lg" asChild className="w-full lg:w-auto">
              <Link href="/login">
                <Heart className="mr-2 h-5 w-5" /> Find Your Match
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary dark:bg-[#22252a] py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">Featured Profiles</h2>
            </div>
             {loading ? (
                <div className="text-center text-muted-foreground">Loading profiles...</div>
              ) : featuredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredProfiles.map((profile) => (
                    <FeaturedProfileCard key={profile.id} user={profile} isLoggedIn={isLoggedIn} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No featured profiles available at the moment.
                </div>
              )}
          </div>
        </section>
        
        <TestimonialsSection testimonials={filteredTestimonials} />

        <SugarRelationshipSection />

        <WhatIsSection />

        <ByTheNumbersSection />

        <SecuritySection />

      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
