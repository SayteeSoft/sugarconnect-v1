"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

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
    <div className="container mx-auto max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your profile, password, and account settings.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your username and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email} disabled />
                 <p className="text-xs text-muted-foreground pt-1">Changing your email address is not supported in this demo.</p>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a new, strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Danger Zone</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Delete your account</p>
                <p>This will permanently delete your account and all associated data.</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
            </div>
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
}
