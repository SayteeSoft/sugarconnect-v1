
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sugar Baby');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });
      router.push('/login');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-20 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Create an Account</h1>
                    <p className="text-lg text-muted-foreground">Join our exclusive community today.</p>
                </div>
                <Card className="w-full max-w-md mx-auto shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
                        <CardDescription>Fill in the details below to create your account.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 text-left">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <Label>I am a</Label>
                                <RadioGroup value={role} onValueChange={setRole} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Sugar Baby" id="r1" />
                                    <Label htmlFor="r1">Sugar Baby</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Sugar Daddy" id="r2" />
                                    <Label htmlFor="r2">Sugar Daddy/Mommy</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-primary hover:underline">
                                    Sign In
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
