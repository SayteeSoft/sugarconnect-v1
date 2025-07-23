
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Metadata } from "next";
import { 
    Home, 
    Search, 
    MessageSquare, 
    Users, 
    User, 
    LogIn, 
    UserPlus, 
    CreditCard, 
    Info, 
    HelpCircle, 
    BookText,
    ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
    title: "Sitemap - Sugar Connect",
    description: "Navigate through all the pages available on Sugar Connect.",
};

const sitemapSections = [
    {
        title: "Main Pages",
        links: [
            { icon: Home, text: "Home", description: "The main landing page of Sugar Connect.", href: "/" },
            { icon: Search, text: "Search", description: "Find and filter profiles.", href: "/search" },
            { icon: MessageSquare, text: "Messages", description: "Your private conversations.", href: "/messages" },
            { icon: Users, text: "Matches", description: "View your matches and favorites.", href: "/matches" },
        ]
    },
    {
        title: "User Account",
        links: [
            { icon: User, text: "My Profile", description: "View and edit your profile.", href: "/dashboard/profile" },
            { icon: LogIn, text: "Login", description: "Access your account.", href: "/login" },
            { icon: UserPlus, text: "Sign Up", description: "Create a new account for free.", href: "/login" },
            { icon: CreditCard, text: "Purchase Credits", description: "Buy credits to connect with others.", href: "/purchase-credits" },
        ]
    },
    {
        title: "Legal & Info",
        links: [
            { icon: Info, text: "About Us", description: "Learn more about our mission.", href: "/about" },
            { icon: HelpCircle, text: "FAQs", description: "Find answers to your questions.", href: "/faq" },
            { icon: BookText, text: "Glossary", description: "Understand common terms.", href: "/glossary" },
        ]
    }
];

const SitemapLinkCard = ({ icon: Icon, text, description, href }: { icon: React.ElementType, text: string, description: string, href: string }) => (
    <Link href={href}>
        <div className="border rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/50 h-full">
            <div className="bg-primary/10 p-3 rounded-md">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-foreground">{text}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
    </Link>
);


export default function SitemapPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
            <Header />
            <main className="flex-grow pt-36 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Sitemap</h1>
                        <p className="text-lg text-muted-foreground">Navigate through all the pages available on Sugar Connect.</p>
                    </div>
                    <Card className="max-w-4xl mx-auto shadow-xl">
                        <CardContent className="p-8 md:p-12 space-y-10">
                            {sitemapSections.map(section => (
                                <div key={section.title}>
                                    <h2 className="text-2xl font-headline font-bold text-primary mb-6">{section.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {section.links.map(link => (
                                            <SitemapLinkCard key={link.text} {...link} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
