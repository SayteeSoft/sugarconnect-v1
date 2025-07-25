
"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const creditPackages = [
    { id: 'PKG100', credits: 100, price: '49.99', bonus: 'Starter Pack' },
    { id: 'PKG500', credits: 500, price: '179.99', bonus: '+75 Bonus' },
    { id: 'PKG1000', credits: 1000, price: '299.99', bonus: '+200 Bonus' },
];

export default function PurchaseCreditsPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(creditPackages[0]);
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                setCurrentUser(null);
            }
        }
        setLoading(false);
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full container mx-auto">
                <p>Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="container mx-auto text-center">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Purchase Credits</h1>
                    <p className="text-lg text-muted-foreground">Please log in to purchase credits and unlock premium features.</p>
                </div>
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-semibold mb-4">Authentication Required</h3>
                        <p className="text-muted-foreground mb-6">
                            You need to be signed in to your account to purchase credit packages.
                        </p>
                        <Button asChild>
                            <Link href="/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Go to Login Page
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
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
                        <RadioGroup value={selectedPackage.id} onValueChange={(id) => setSelectedPackage(creditPackages.find(p => p.id === id) || creditPackages[0])}>
                            {creditPackages.map((pkg) => (
                                <Label key={pkg.id} htmlFor={pkg.id} className="flex items-center justify-between p-4 border rounded-md mb-4 has-[:checked]:border-primary cursor-pointer">
                                    <div className="flex items-center">
                                        <RadioGroupItem value={pkg.id} id={pkg.id} />
                                        <div className="ml-4">
                                            <span className="font-semibold">{pkg.credits} Credits</span>
                                            <p className="text-sm text-primary">{pkg.bonus}</p>
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
