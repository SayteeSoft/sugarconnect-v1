
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
        <Header />
        <main className="flex-grow pt-28 pb-16">
            {children}
        </main>
        <Footer />
    </div>
  );
}
