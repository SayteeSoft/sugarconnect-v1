
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Metadata } from "next";

const faqItems = [
    {
        question: "What is Sugar Connect?",
        answer: "Sugar Connect is a premier online dating platform designed for successful, generous individuals (often referred to as Sugar Daddies or Sugar Mommies) and ambitious, attractive people (Sugar Babies) to build relationships on their own terms. We facilitate connections based on mutual respect, clear expectations, and shared lifestyle goals.",
    },
    {
        question: "Is my privacy protected on Sugar Connect?",
        answer: "Absolutely. We prioritize your privacy with the utmost seriousness. Our platform employs robust security measures, including data encryption and profile verification, to ensure your information is safe. You have full control over your profile's visibility and who can contact you, ensuring a discreet and secure experience.",
    },
    {
        question: "How do I create a successful profile?",
        answer: "A successful profile is honest, detailed, and features high-quality photos. Be clear about who you are and what you're seeking in a relationship. Highlight your personality, interests, and lifestyle. For Sugar Babies, this is a chance to express your ambitions. For Sugar Daddies/Mommies, it's an opportunity to showcase your generosity and what you can offer a partner.",
    },
    {
        question: "What is a 'mutually beneficial relationship'?",
        answer: "A mutually beneficial relationship is a partnership where both individuals clearly define their needs and expectations from the outset, and both agree to meet them. It's built on a foundation of honesty, respect, and open communication, where both partners feel valued and enriched by the connection.",
    },
    {
        question: "How does messaging work on the site?",
        answer: "Once you have a membership, you can send and receive messages from other users. Our platform features a secure and private messaging system that allows you to communicate safely. You can get to know your potential matches, discuss expectations, and arrange meetings without sharing personal contact information until you're comfortable.",
    },
    {
        question: "What is the difference between 'allowance' and 'Pay Per Meet' (PPM)?",
        answer: "An 'allowance' is a regular, agreed-upon sum of financial support provided by a Sugar Daddy or Mommy to a Sugar Baby on a weekly or monthly basis. 'Pay Per Meet' (PPM) is an arrangement where financial support is provided for each date or meeting. The choice between these arrangements depends on the agreement between the two individuals in the relationship.",
    },
    {
        question: "Are there safety features on the platform?",
        answer: "Yes, member safety is our top priority. We have a profile verification system, robust privacy controls, and a dedicated support team that you can contact 24/7. We also provide safety tips and encourage all members to practice caution when meeting someone new.",
    },
    {
        question: "Can I use the site for free?",
        answer: "Sugar Babies can create a profile and browse potential matches for free. However, to unlock premium features like unlimited messaging, a subscription is required. Sugar Daddies and Mommies require a premium membership to initiate contact and communicate with Sugar Babies.",
    },
];

export default function FAQPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaqs = faqItems.filter(
        (item) =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
            <Header />
            <main className="flex-grow py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Frequently Asked Questions</h1>
                        <p className="text-lg text-muted-foreground">Find answers to common questions about Sugar Connect and sugar dating.</p>
                    </div>

                    <Card className="max-w-4xl mx-auto shadow-xl">
                        <CardContent className="p-8 md:p-12">
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search questions..."
                                    className="pl-12 h-12 text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {filteredFaqs.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left text-lg hover:no-underline">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                             {filteredFaqs.length === 0 && (
                                <p className="text-center text-muted-foreground mt-8">
                                    No questions found matching your search.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
