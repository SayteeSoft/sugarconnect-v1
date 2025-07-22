
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Message Sent! - Sugar Connect",
    description: "Thank you for contacting us.",
};

export default function SuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center pt-36 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto text-center shadow-xl">
            <CardContent className="p-8 md:p-12">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-headline font-bold text-primary mb-3">Message Sent Successfully!</h1>
                <p className="text-muted-foreground mb-8">
                    Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.
                </p>
                <Button asChild>
                    <Link href="/">Return to Homepage</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
