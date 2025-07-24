import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Purchase Credits - Sugar Connect",
    description: "Purchase credits to unlock conversations and features.",
};

export default function PurchaseCreditsLayout({
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
