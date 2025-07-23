import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function AdminLayout({
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
