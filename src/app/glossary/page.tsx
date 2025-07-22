
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

const glossaryItems = [
    {
        term: "Sugar Daddy (SD)",
        definition: "A successful, generous, and typically older individual who provides financial support, mentorship, and gifts to a younger partner in return for companionship."
    },
    {
        term: "Sugar Mommy (SM)",
        definition: "The female equivalent of a Sugar Daddy; a successful, generous woman who provides for a younger partner."
    },
    {
        term: "Sugar Baby (SB)",
        definition: "An ambitious, attractive individual who receives financial benefits, gifts, and mentorship in exchange for companionship with a Sugar Daddy or Sugar Mommy."
    },
    {
        term: "Arrangement",
        definition: "The negotiated agreement and terms of a sugar relationship, outlining the expectations, boundaries, and benefits for both parties."
    },
    {
        term: "Allowance",
        definition: "A regular and consistent sum of money provided by a Sugar Daddy or Mommy to a Sugar Baby, typically on a weekly or monthly basis, as part of their arrangement."
    },
    {
        term: "Pay Per Meet (PPM)",
        definition: "An arrangement where the Sugar Baby receives a specified amount of money for each date or meeting with their Sugar Daddy or Mommy, as opposed to a regular allowance."
    },
    {
        term: "Mutually Beneficial Relationship",
        definition: "The core principle of sugar dating, where both the Sugar Daddy/Mommy and the Sugar Baby have their needs and desires met, creating a partnership based on clear and upfront terms."
    },
    {
        term: "Discretion",
        definition: "The practice of keeping the details of a sugar relationship private and confidential, respected by both parties involved."
    },
    {
        term: "Splenda Daddy",
        definition: "A term used to describe a Sugar Daddy who has less financial means than a traditional Sugar Daddy but still wishes to provide some level of support."
    },
    {
        term: "Salt Daddy",
        definition: "A fake or fraudulent individual posing as a Sugar Daddy with no real intention or ability to provide financial support."
    }
];


export default function GlossaryPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredGlossary = glossaryItems.filter(
        (item) =>
            item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-secondary dark:bg-background">
            <Header />
            <main className="flex-grow pt-36 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Glossary of Terms</h1>
                        <p className="text-lg text-muted-foreground">Understand the language of the sugar dating world.</p>
                    </div>

                    <Card className="max-w-4xl mx-auto shadow-xl">
                        <CardContent className="p-8 md:p-12">
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search terms..."
                                    className="pl-12 h-12 text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {filteredGlossary.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left text-lg hover:no-underline">
                                            {item.term}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                            {item.definition}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                             {filteredGlossary.length === 0 && (
                                <p className="text-center text-muted-foreground mt-8">
                                    No terms found matching your search.
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
