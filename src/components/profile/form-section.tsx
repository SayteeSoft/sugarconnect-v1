
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FormSectionProps = {
    title: string;
    children: React.ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-primary mb-4">{title}</h2>
            {children}
        </div>
    );
}
