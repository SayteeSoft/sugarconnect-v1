
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Landmark } from "lucide-react";

type CreditPackage = {
    id: number;
    credits: number;
    bonus: number;
    price: number;
    popular: boolean;
};

type PurchaseCreditsClientProps = {
    packages: CreditPackage[];
    paypalClientId: string;
};

export function PurchaseCreditsClient({ packages, paypalClientId }: PurchaseCreditsClientProps) {
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(packages.find(p => p.popular) || packages[0]);
    const [paymentMethod, setPaymentMethod] = useState("paypal");
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleCreateOrder = async (data: any, actions: any) => {
        try {
            const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: selectedPackage.price }),
            });
            const order = await res.json();
            if (order.success && order.data.orderID) {
                return order.data.orderID;
            } else {
                toast({ variant: "destructive", title: "Error", description: order.message || "Could not create PayPal order." });
                return null;
            }
        } catch(e) {
             toast({ variant: "destructive", title: "Error", description: "Could not create PayPal order." });
             return null;
        }
    };

    const handleOnApprove = async (data: any, actions: any) => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            const result = await res.json();
            
            if (result.success) {
                toast({ title: "Payment Successful", description: "Your credits have been added to your account." });
            } else {
                toast({ variant: "destructive", title: "Payment Error", description: result.message || "There was an issue with your payment." });
            }
        } catch (e) {
             toast({ variant: "destructive", title: "Payment Error", description: "There was an issue with your payment." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOnError = (err: any) => {
        toast({ variant: "destructive", title: "PayPal Error", description: "An error occurred with the PayPal transaction." });
        console.error("PayPal Error:", err);
    };

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture", components: "buttons" }}>
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Purchase Credits</h1>
                    <p className="text-lg text-muted-foreground">Unlock conversations by choosing one of our credit packages.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Package Selection */}
                    <Card className="shadow-lg flex flex-col">
                        <CardHeader>
                            <CardTitle>1. Select a Package</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <RadioGroup value={selectedPackage.id.toString()} onValueChange={(id) => setSelectedPackage(packages.find(p => p.id === parseInt(id))!)}>
                                <div className="space-y-4">
                                    {packages.map((pkg) => (
                                        <Label key={pkg.id} htmlFor={`pkg-${pkg.id}`} className={cn(
                                            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                                            selectedPackage.id === pkg.id ? "border-primary ring-2 ring-primary" : "border-border"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <RadioGroupItem value={pkg.id.toString()} id={`pkg-${pkg.id}`} />
                                                <div>
                                                    <div className="font-semibold">{pkg.credits} Credits</div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {pkg.bonus > 0 && <Badge variant="secondary">+{pkg.bonus} Bonus</Badge>}
                                                        {pkg.popular && <Badge>Most Popular</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-lg">${pkg.price.toFixed(2)}</div>
                                        </Label>
                                    ))}
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card className="shadow-lg flex flex-col">
                        <CardHeader>
                            <CardTitle>2. Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                             <p className="text-sm text-muted-foreground mb-6">All transactions are secure and encrypted.</p>
                             <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                <Label htmlFor="paypal" className={cn("flex items-center gap-4 p-4 border rounded-lg cursor-pointer", paymentMethod === 'paypal' && 'border-primary ring-2 ring-primary')}>
                                    <RadioGroupItem value="paypal" id="paypal" />
                                    <Landmark className="h-5 w-5" />
                                    <span>PayPal</span>
                                </Label>
                                <Label htmlFor="credit-card" className={cn("flex items-center gap-4 p-4 border rounded-lg cursor-pointer text-muted-foreground", paymentMethod === 'credit-card' && 'border-primary ring-2 ring-primary')}>
                                    <RadioGroupItem value="credit-card" id="credit-card" disabled />
                                    <CreditCard className="h-5 w-5" />
                                    <span>Credit Card (coming soon)</span>
                                </Label>
                            </RadioGroup>

                            <div className="mt-auto pt-6">
                                {paymentMethod === 'paypal' ? (
                                    isProcessing ? (
                                        <Button disabled className="w-full">Processing...</Button>
                                    ) : (
                                        <PayPalButtons
                                            key={selectedPackage.id}
                                            style={{ layout: "vertical", label: "pay" }}
                                            createOrder={handleCreateOrder}
                                            onApprove={handleOnApprove}
                                            onError={handleOnError}
                                            disabled={!selectedPackage || isProcessing}
                                        />
                                    )
                                ) : (
                                     <Button className="w-full" disabled>
                                        Coming Soon
                                     </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}
