import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function StatCard({ icon, title, description }: StatCardProps) {
  return (
    <Card className="text-center bg-background/50 border-0 shadow-lg dark:bg-card">
      <CardContent className="p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
