
"use client";

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { UserProfile } from '@/lib/users';
import { Skeleton } from './ui/skeleton';

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
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(packages[0]);
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreateOrder = async (data: any, actions: any) => {
        try {
            const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    packageId: selectedPackage.id,
                }),
            });
            const order = await response.json();
            if (order.id) {
                return order.id;
            } else {
                const errorDetail = order?.details?.[0];
                const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description}` : JSON.stringify(order);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Create Order Error:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Could not initiate PayPal Checkout. ${error}`,
            });
            return '';
        }
    };
    
    const handleOnApprove = async (data: any, actions: any) => {
        setIsProcessing(true);
        try {
            const response = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            
            const orderData = await response.json();
            
            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                setIsProcessing(false);
                return actions.restart();
            } else if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
            } else {
                toast({
                    title: 'Payment Successful!',
                    description: `Transaction ID: ${orderData.id}. Your ${selectedPackage.credits} credits have been added.`,
                });
                // Here you would typically update the user's credit balance in your database
            }
        } catch (error) {
            console.error("Capture Order Error:", error);
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: `Your transaction could not be processed. ${error}`,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const PaymentForm = () => {
        const [{ isPending }] = usePayPalScriptReducer();
        
        return (
            <div className="space-y-4 pt-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <Label htmlFor="paypal-option" className="flex items-center p-4 border rounded-md has-[:checked]:border-primary">
                        <RadioGroupItem value="paypal" id="paypal-option" />
                        <span className="ml-4 font-medium">PayPal</span>
                    </Label>
                    <Label htmlFor="credit-card-option" className="flex items-center p-4 border rounded-md cursor-not-allowed opacity-50">
                        <RadioGroupItem value="credit-card" id="credit-card-option" disabled />
                        <span className="ml-4 font-medium">Credit Card</span>
                    </Label>
                    <Label htmlFor="debit-card-option" className="flex items-center p-4 border rounded-md cursor-not-allowed opacity-50">
                        <RadioGroupItem value="debit-card" id="debit-card-option" disabled />
                        <span className="ml-4 font-medium">Debit Card</span>
                    </Label>
                </RadioGroup>
                
                {paymentMethod === 'paypal' && (
                    <div className="pt-4">
                        {isPending ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : isProcessing ? (
                            <Button disabled className="w-full">Processing...</Button>
                        ) : (
                            <PayPalButtons
                                key={selectedPackage.id} // Re-render buttons when package changes
                                style={{ layout: "vertical", label: "pay" }}
                                createOrder={handleCreateOrder}
                                onApprove={handleOnApprove}
                                forceReRender={[selectedPackage]}
                            />
                        )}
                    </div>
                )}
            </div>
        )
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
                        <CardDescription>All transactions are secure and encrypted.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <PaymentForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
