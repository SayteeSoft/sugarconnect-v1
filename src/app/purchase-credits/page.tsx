
"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PurchaseCreditsClient } from "@/components/purchase-credits-client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";

const creditPackages = [
    { id: 'PKG100', credits: 100, price: '49.99', bonus: 'Most Popular' },
    { id: 'PKG250', credits: 250, price: '99.99', bonus: '+25 Bonus' },
    { id: 'PKG500', credits: 500, price: '179.99', bonus: '+75 Bonus' },
    { id: 'PKG1000', credits: 1000, price: '299.99', bonus: '+200 Bonus' },
];

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AfJ7bhG_VDx0Z2o_EtExWS_Ps2eUiZKS0lABsQCbQC02V-c_Z59cOw8xq3yNqO763BAKwSRAf8n7fob8';

export default function PurchaseCreditsPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
        <PayPalScriptProvider options={{ 
            clientId: PAYPAL_CLIENT_ID,
            currency: "USD",
            intent: "capture"
        }}>
            <PurchaseCreditsClient packages={creditPackages} user={currentUser} />
        </PayPalScriptProvider>
    );
}
