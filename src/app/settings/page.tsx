
"use client";

import { SettingsClient } from "@/components/settings-client";
import { UserProfile } from "@/lib/users";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto text-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="container mx-auto text-center">
          <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Account Settings</h1>
              <p className="text-lg text-muted-foreground">Please log in to manage your account settings.</p>
          </div>
          <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Authentication Required</h3>
                  <p className="text-muted-foreground mb-6">
                      You need to be signed in to access your settings.
                  </p>
                  <Button asChild>
                      <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Go to Login Page
                      </Link>
                  </Button>
              </CardContent>
          </Card>
      </div>
    );
  }
  
  return (
    <SettingsClient user={user} />
  );
}
