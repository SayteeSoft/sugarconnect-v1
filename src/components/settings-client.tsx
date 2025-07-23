
"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Trash2 } from "lucide-react";
import Link from "next/link";

type SettingsClientProps = {
  user: UserProfile;
};

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState(user.name);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your username has been successfully changed.",
    });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };
  
  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
        toast({
            variant: "destructive",
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
        });
    }
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your profile, password, and account details.</p>
      </div>
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardContent className="p-8 md:p-12">
            <div className="prose dark:prose-invert max-w-none space-y-12 text-foreground/80">

                {/* Profile Information Section */}
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-base">Username</Label>
                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="max-w-md"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">Email Address</Label>
                            <Input id="email" type="email" value={user.email} disabled className="max-w-md" />
                            <p className="text-xs text-muted-foreground pt-1">Changing your email address is not supported in this demo.</p>
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Change Password</h2>
                     <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" className="max-w-md"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" className="max-w-md"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" className="max-w-md"/>
                        </div>
                        <Button type="submit">Update Password</Button>
                    </form>
                </div>

                {/* Delete Account Section */}
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Danger Zone</h2>
                    <Alert variant="destructive" className="max-w-xl">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Delete Your Account</AlertTitle>
                        <AlertDescription>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p>This action is permanent and cannot be undone. This will permanently delete your account and all associated data.</p>
                                </div>
                                <Button variant="destructive" onClick={handleDeleteAccount} className="flex-shrink-0">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
                 <div className="text-center pt-8">
                    <Button size="lg" asChild>
                        <Link href="/dashboard">
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
