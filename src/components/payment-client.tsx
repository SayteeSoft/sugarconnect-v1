
"use client";

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/users';
import { Skeleton } from './ui/skeleton';

type CreditPackage = {
    id: string;
    credits: number;
    price: string;
    bonus: string;
};

type PaymentClientProps = {
    selectedPackage: CreditPackage;
    user: UserProfile;
};

export function PaymentClient({ selectedPackage, user }: PaymentClientProps) {
    const { toast } = useToast();
    const [{ isPending }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreateOrder = async () => {
        try {
            const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId: selectedPackage.id }),
            });
            const order = await response.json();
            if (order.id) {
                return order.id;
            } else {
                throw new Error(order.message || 'Failed to create order');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Could not initiate PayPal Checkout. ${error.message}`,
            });
            return '';
        }
    };
    
    const handleOnApprove = async (data: { orderID: string }) => {
        setIsProcessing(true);
        try {
            const response = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            
            const orderData = await response.json();
            
            if (response.ok) {
                toast({
                    title: 'Payment Successful!',
                    description: `Transaction ID: ${orderData.id}. Your ${selectedPackage.credits} credits have been added.`,
                });
                // In a real app, you would update user credits in DB and redirect
            } else {
                 throw new Error(orderData.message || 'Failed to capture payment');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: `Your transaction could not be processed. ${error.message}`,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-lg">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Complete Your Purchase</CardTitle>
                    <CardDescription>Finalize your payment securely with PayPal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/50 p-4 rounded-md mb-6 text-center">
                        <p className="font-semibold">{selectedPackage.credits} Credits</p>
                        <p className="text-2xl font-bold">${selectedPackage.price}</p>
                        <p className="text-sm text-primary">{selectedPackage.bonus}</p>
                    </div>

                    {isPending ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : isProcessing ? (
                        <Button disabled className="w-full">Processing Payment...</Button>
                    ) : (
                        <PayPalButtons
                            style={{ layout: "vertical", label: "pay" }}
                            createOrder={handleCreateOrder}
                            onApprove={handleOnApprove as any}
                            forceReRender={[selectedPackage]}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

