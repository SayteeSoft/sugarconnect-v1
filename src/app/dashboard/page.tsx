
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Welcome to your Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Manage your profile and find connections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:shadow-primary/10 transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              <span>Find Connections</span>
            </CardTitle>
            <CardDescription>
              Use our advanced search to discover profiles that match your preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
                <Link href="/search">Go to Search</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-primary/10 transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <span>Your Profile</span>
            </CardTitle>
            <CardDescription>
              Keep your profile up-to-date to attract the best matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/profile">View My Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
