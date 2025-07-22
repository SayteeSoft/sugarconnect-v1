
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";
import { Mail, Phone } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us - Sugar Connect",
    description: "Get in touch with the Sugar Connect team. We're here to help with any questions or feedback you may have.",
};

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
            <Header />
            <main className="flex-grow pt-36 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Contact Us</h1>
                        <p className="text-lg text-muted-foreground">We're here to help. Reach out to us with any questions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
                         <Card className="shadow-xl">
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ContactForm />
                            </CardContent>
                        </Card>
                        <div className="space-y-8 pt-8">
                            <div>
                                <h3 className="text-2xl font-headline font-bold text-primary mb-4 flex items-center gap-3">
                                    <Mail className="h-6 w-6" />
                                    Email Us
                                </h3>
                                <p className="text-muted-foreground">For general inquiries, support, or feedback, please don't hesitate to email our team.</p>
                                <a href="mailto:support@sugarconnect.com" className="text-primary font-medium hover:underline">
                                    support@sugarconnect.com
                                </a>
                            </div>
                             <div>
                                <h3 className="text-2xl font-headline font-bold text-primary mb-4 flex items-center gap-3">
                                    <Phone className="h-6 w-6" />
                                     Call Us
                                </h3>
                                <p className="text-muted-foreground">Our phone lines are open from 9 AM to 5 PM, Monday to Friday.</p>
                                <a href="tel:+1234567890" className="text-primary font-medium hover:underline">
                                    +1 (234) 567-890
                                </a>
                            </div>
                            <div>
                                <h3 className="text-2xl font-headline font-bold text-primary mb-4">
                                     Our Office
                                </h3>
                                <p className="text-muted-foreground">
                                    Sugar Connect HQ<br/>
                                    123 Sweet Street<br/>
                                    Metropolis, 10101
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
