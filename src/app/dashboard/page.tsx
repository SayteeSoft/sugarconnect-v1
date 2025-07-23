
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your profile and find connections.</p>
        <Button asChild className="mt-6">
            <Link href="/dashboard/search">Go to Search</Link>
        </Button>
      </div>
    </div>
  );
}
