
"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendEmail } from "@/lib/email";

type SettingsClientProps = {
  user: UserProfile;
};

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('name', name);

    try {
        const res = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update profile.');
        }

        const updatedUser = await res.json();

        // Update localStorage
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));

        toast({
            title: "Profile Updated",
            description: "Your username has been successfully changed.",
        });

        // Send notification email
        await sendEmail({
            to: user.email,
            recipientName: updatedUser.name,
            subject: "Your Sugar Connect Profile has been updated",
            body: `<p>This is a confirmation that your profile details on Sugar Connect were recently updated.</p><p>If you did not make this change, please contact our support team immediately.</p>`,
            callToAction: {
                text: 'View Your Profile',
                url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/dashboard/profile/${user.id}`
            }
        });

        router.refresh();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
    } finally {
        setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast({
            variant: 'destructive',
            title: 'Passwords do not match',
            description: 'Please ensure your new password and confirmation match.',
        });
        return;
    }
    if (password.length < 8) {
        toast({
            variant: 'destructive',
            title: 'Password too short',
            description: 'Password must be at least 8 characters long.',
        });
        return;
    }

    setIsSavingPassword(true);
    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('password', password);
    
    try {
        const res = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update password.');
        }

        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });

        // Send notification email
         await sendEmail({
            to: user.email,
            recipientName: user.name,
            subject: "Your Sugar Connect password has been changed",
            body: `<p>This is a security alert to inform you that your password on Sugar Connect was recently changed.</p><p>If you did not make this change, please secure your account and contact our support team immediately.</p>`,
            callToAction: {
                text: 'Go to Settings',
                url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/settings`
            }
        });

        setPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
    } finally {
        setIsSavingPassword(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/users/${user.id}/delete`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete account.');
            }
            
            toast({
                title: "Account Deleted",
                description: "Your account is being permanently deleted.",
            });
            
            localStorage.removeItem('user');
            router.push('/'); // Redirect to homepage
            
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message,
            });
        } finally {
            setIsDeleting(false);
        }
    }
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your profile, password, and account details.</p>
      </div>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardContent className="p-8 md:p-12">
            <div className="prose dark:prose-invert max-w-none space-y-12 text-foreground/80">

                {/* Profile Information Section */}
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-base">Username</Label>
                            <Input id="username" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">Email Address</Label>
                            <Input id="email" type="email" value={user.email} disabled />
                            <p className="text-xs text-muted-foreground pt-1">
                                Email cannot be changed. <Link href="/contact" className="underline text-primary">Contact support</Link> for assistance.
                            </p>
                        </div>
                        <Button type="submit" disabled={isSavingProfile}>
                            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Change Password</h2>
                     <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <Button type="submit" disabled={isSavingPassword}>
                             {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSavingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </div>

                {/* Delete Account Section */}
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Danger Zone</h2>
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Delete Your Account</AlertTitle>
                        <AlertDescription>
                            This action is permanent and cannot be undone. This will permanently delete your account and all associated data.
                        </AlertDescription>
                    </Alert>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting || user.email === 'saytee.software@gmail.com'} className="mt-4">
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
      <div className="text-center mt-8">
          <Button size="lg" asChild>
              <Link href="/dashboard">
                  Back to Dashboard
              </Link>
          </Button>
      </div>
    </div>
  );
}
