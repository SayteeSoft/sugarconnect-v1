
import { ShieldCheck, Lock, LifeBuoy } from 'lucide-react';
import { SecurityCard } from './security-card';

export function SecuritySection() {
  const securityFeatures = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Verified Members',
      description: 'Video verification allows you to know that potential dates look like their photos.',
    },
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: 'Secure Accounts',
      description: 'Industry-leading account protection helps keep your profile and information safe.',
    },
    {
      icon: <LifeBuoy className="h-8 w-8 text-primary" />,
      title: '24/7 Support',
      description: 'We have a dedicated team of customer service agents to support you.',
    },
  ];

  return (
    <section className="bg-[#ebe5eb] py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            High Level Security &amp; Privacy
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {securityFeatures.map((feature) => (
            <SecurityCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
