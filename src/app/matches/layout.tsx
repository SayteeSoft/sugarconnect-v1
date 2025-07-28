import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Matches - Sugar Connect",
    description: "Browse your favorites, see who visited your profile, and who you have viewed.",
};

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <Header />
        <main className="flex-grow pt-36 pb-16">
            {children}
        </main>
        <Footer />
    </div>
  );
}
