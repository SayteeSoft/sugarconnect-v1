
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Complete Payment - Sugar Connect",
    description: "Finalize your credit purchase securely.",
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <Header />
        <main className="flex-grow flex items-center pt-36 pb-16">
            {children}
        </main>
        <Footer />
    </div>
  );
}
