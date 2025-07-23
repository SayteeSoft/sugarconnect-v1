
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user info in local storage
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting you...",
      });
      
      // Force a re-render of the header by reloading the page
      window.location.href = data.user.role === 'Admin' ? '/admin' : '/dashboard';

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center pt-36 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Welcome Back</h1>
                <p className="text-lg text-muted-foreground">Sign in to access your exclusive community.</p>
            </div>
            <Card className="w-full max-w-md mx-auto shadow-2xl">
                <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Login</CardTitle>
                <CardDescription>Enter your email below to login to your account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 text-left">
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="m@example.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-medium text-primary hover:underline">
                        Sign up for free
                    </Link>
                    </p>
                </CardFooter>
                </form>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
