import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/login">
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="mb-6">
             <Badge variant="outline" className="text-primary border-primary/50 py-1 px-4 rounded-full">
               Find Your Perfect Match
             </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6">
            Sweet Connections, Meaningful Relationships
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            SugarConnect is the leading platform for ambitious and attractive individuals to find relationships on their terms. Experience dating like never before.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">Join Now and Connect</Link>
          </Button>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
           <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
             <Image
              src="https://placehold.co/1200x600.png"
              alt="SugarConnect platform screenshot"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              data-ai-hint="dating app people"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
           </div>
        </section>

        <section className="bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Why SugarConnect?</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">Discover the features that make finding your ideal partner seamless and exciting.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline mt-4">AI-Powered Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our intelligent algorithm connects you with the most compatible partners based on your preferences, ensuring quality matches.</p>
                </CardContent>
              </Card>
              <Card className="text-center bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline mt-4">Verified Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">We prioritize your safety. All profiles are manually verified to create a secure and trustworthy community.</p>
                </CardContent>
              </Card>
              <Card className="text-center bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center">
                    <Heart className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline mt-4">Meaningful Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Go beyond superficial swipes. We facilitate genuine conversations that lead to lasting and mutually beneficial relationships.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SugarConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
