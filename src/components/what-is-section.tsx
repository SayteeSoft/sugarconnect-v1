
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WhatIsSection() {
    const definitions = {
        daddy: 'A Sugar Daddy is a successful and generous individual who is willing to provide financial support and mentorship to a partner in exchange for companionship and a mutually beneficial relationship.',
        baby: 'A Sugar Baby is an ambitious and attractive person who is looking for a relationship with a successful and generous partner who can provide mentorship and a certain lifestyle.',
    };

    return (
        <section className="bg-[#f7f3f7] dark:bg-card py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8">What is a...</h2>
                    <Tabs defaultValue="daddy" className="w-full max-w-lg mx-auto">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="daddy">Sugar Daddy</TabsTrigger>
                            <TabsTrigger value="baby">Sugar Baby</TabsTrigger>
                        </TabsList>
                        <TabsContent value="daddy">
                            <Card className="mt-4">
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    {definitions.daddy}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="baby">
                            <Card className="mt-4">
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    {definitions.baby}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
}
