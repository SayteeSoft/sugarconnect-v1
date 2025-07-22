import { StatCard } from './stat-card';
import { FileText, Users, Heart } from 'lucide-react';

export function ByTheNumbersSection() {
    const stats = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Average Sugar Baby',
      description: 'Age: 23',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: '6x More Sugar Babies',
      description: 'than Sugar Daddies',
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Average Time to Find a Match:',
      description: '4 Days',
    },
  ];

  return (
    <section className="bg-secondary dark:bg-[#22252a] py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            By The Numbers
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              icon={stat.icon}
              title={stat.title}
              description={stat.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
