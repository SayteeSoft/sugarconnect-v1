
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WhatIsSection() {
  const definitions = {
    'sugar-daddy': {
      title: 'Sugar Daddy',
      content:
        'A Sugar Daddy is a successful and generous individual who is willing to provide financial support and mentorship to a partner in exchange for companionship and a mutually beneficial relationship.',
    },
    'sugar-baby': {
      title: 'Sugar Baby',
      content:
        'A Sugar Baby is an ambitious and attractive individual who seeks a mature and affluent partner to enjoy a lifestyle of luxury, receive mentorship, and explore a relationship on their own terms.',
    },
  };

  return (
    <section className="bg-[#f7f3f7] dark:bg-secondary py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="sugar-daddy" className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">
              What is a...
            </h2>
          </div>
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 max-w-xl mx-auto">
            <TabsTrigger value="sugar-daddy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
              {definitions['sugar-daddy'].title}
            </TabsTrigger>
            <TabsTrigger value="sugar-baby" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
              {definitions['sugar-baby'].title}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sugar-daddy">
            <Card className="mt-6 border-0 shadow-lg bg-background/50 dark:bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                {definitions['sugar-daddy'].content}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sugar-baby">
            <Card className="mt-6 border-0 shadow-lg bg-background/50 dark:bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                {definitions['sugar-baby'].content}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
