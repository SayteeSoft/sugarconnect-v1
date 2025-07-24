
import { Footer } from "@/components/footer";
import { DashboardHeader } from "@/components/profile/dashboard-header";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <DashboardHeader />
        <main className="flex-grow pt-24 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
        <Footer />
    </div>
  );
}
