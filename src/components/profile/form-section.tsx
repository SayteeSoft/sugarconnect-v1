
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FormSectionProps = {
    title: string;
    children: React.ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
