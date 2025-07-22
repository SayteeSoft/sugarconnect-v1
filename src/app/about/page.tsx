
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us - Sugar Connect",
    description: "Learn about Sugar Connect's mission to create empowering, transparent, and tailored relationships.",
};

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
            <Header />
            <main className="flex-grow pt-36 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Welcome to Sugar Connect</h1>
                        <p className="text-lg text-muted-foreground">Where Ambitious Hearts and Discerning Tastes Meet</p>
                    </div>
                    <Card className="max-w-4xl mx-auto shadow-xl">
                        <CardContent className="p-8 md:p-12">
                            <div className="prose dark:prose-invert max-w-none space-y-8 text-lg text-foreground/80">
                                <p>
                                    At Sugar Connect, we believe that relationships should be empowering, transparent, and tailored to the modern world. We have created an exclusive platform where successful, established individuals and ambitious, attractive people can connect on their own terms. Our community is built on a foundation of respect, honesty, and the shared desire for a relationship that enhances, rather than complicates, life.
                                </p>

                                <div>
                                    <h2 className="text-3xl font-headline font-bold text-primary mb-4">Our Mission</h2>
                                    <p>
                                        Our mission is to redefine the landscape of modern dating by providing a high-quality, secure, and intuitive platform for creating mutually beneficial relationships. We strive to eliminate the ambiguity of conventional dating, allowing our members to be upfront about their desires and expectations from the very beginning. We are dedicated to fostering a community where every connection is a meaningful one.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-3xl font-headline font-bold text-primary mb-6">Why Choose Sugar Connect?</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-xl text-primary">Exclusivity & Quality</h3>
                                            <p>We curate our community to ensure a high caliber of members. Every profile is reviewed to maintain a network of genuine, successful, and ambitious individuals who are serious about finding a quality connection.</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-primary">Privacy & Discretion</h3>
                                            <p>Your privacy is our utmost priority. We employ industry-leading security measures and provide tools that give you full control over your profile's visibility, ensuring your experience is both safe and discreet.</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-primary">Meaningful Connections</h3>
                                            <p>We move beyond the superficial. Sugar Connect is for those who seek more than just a date; it's for individuals looking for mentorship, companionship, and a partnership that enriches their lives. Our platform encourages clear communication about expectations, leading to more honest and fulfilling relationships.</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-primary">A Modern Approach</h3>
                                            <p>The world of dating has evolved, and so have we. We provide a sophisticated, streamlined experience that respects your time and aspirations. With advanced search filters and a user-friendly interface, finding your ideal match has never been more efficient.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center pt-8">
                                    <h2 className="text-3xl font-headline font-bold text-primary mb-4">Join Our Community Today</h2>
                                    <p className="max-w-2xl mx-auto text-muted-foreground mb-8">Discover a new standard of dating. Find a partner who understands your ambition and complements your lifestyle.</p>
                                    <Button size="lg" asChild>
                                        <Link href="/login">
                                            <Heart className="mr-2 h-5 w-5" /> Find Your Match
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
