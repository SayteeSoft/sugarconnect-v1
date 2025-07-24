
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { UserProfile } from '@/lib/users';
import { useRouter } from 'next/navigation';

type CreditPackage = {
    id: string;
    credits: number;
    price: string;
    bonus: string;
};

type PurchaseCreditsClientProps = {
    packages: CreditPackage[];
    user: UserProfile;
};

export function PurchaseCreditsClient({ packages, user }: PurchaseCreditsClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(packages[0]);
    const [paymentMethod, setPaymentMethod] = useState('paypal');

    const handleContinue = () => {
        if (!selectedPackage) {
            toast({
                variant: 'destructive',
                title: 'No Package Selected',
                description: 'Please select a credit package to continue.',
            });
            return;
        }
        // Store selected package in local storage to be picked up by the payment page
        localStorage.setItem('selectedCreditPackage', JSON.stringify(selectedPackage));
        router.push('/payment');
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Purchase Credits</h1>
                <p className="text-lg text-muted-foreground">Unlock conversations by choosing one of our credit packages.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>1. Select a Package</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <RadioGroup value={selectedPackage.id} onValueChange={(id) => setSelectedPackage(packages.find(p => p.id === id) || packages[0])}>
                            {packages.map((pkg) => (
                                <Label key={pkg.id} htmlFor={pkg.id} className="flex items-center justify-between p-4 border rounded-md mb-4 has-[:checked]:border-primary cursor-pointer">
                                    <div className="flex items-center">
                                        <RadioGroupItem value={pkg.id} id={pkg.id} />
                                        <div className="ml-4">
                                            <span className="font-semibold">{pkg.credits} Credits</span>
                                            {pkg.bonus === "Most Popular" ? (
                                                <Badge variant="default" className="ml-2">Popular</Badge>
                                            ) : (
                                                <p className="text-sm text-primary">{pkg.bonus}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-semibold">${pkg.price}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>2. Payment Method</CardTitle>
                        <CardDescription>You will be redirected to complete your purchase.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                         <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                            <Label htmlFor="paypal-option" className="flex items-center p-4 border rounded-md has-[:checked]:border-primary">
                                <RadioGroupItem value="paypal" id="paypal-option" />
                                <span className="ml-4 font-medium">PayPal</span>
                            </Label>
                            <Label htmlFor="credit-card-option" className="flex items-center p-4 border rounded-md cursor-pointer has-[:checked]:border-primary">
                                <RadioGroupItem value="credit-card" id="credit-card-option" />
                                <span className="ml-4 font-medium">Credit Card</span>
                            </Label>
                            <Label htmlFor="debit-card-option" className="flex items-center p-4 border rounded-md cursor-pointer has-[:checked]:border-primary">
                                <RadioGroupItem value="debit-card" id="debit-card-option" />
                                <span className="ml-4 font-medium">Debit Card</span>
                            </Label>
                        </RadioGroup>
                        <Button onClick={handleContinue} className="w-full mt-6">Continue</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
