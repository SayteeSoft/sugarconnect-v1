"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4 dark:bg-background">
       <div className="w-full max-w-4xl text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted-foreground mb-8">Sign in to access your exclusive community.</p>
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
    </div>
  );
}
