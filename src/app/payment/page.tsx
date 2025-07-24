
"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PaymentClient } from "@/components/payment-client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AfJ7bhG_VDx0Z2o_EtExWS_Ps2eUiZKS0lABsQCbQC02V-c_Z59cOw8xq3yNqO763BAKwSRAf8n7fob8';

type CreditPackage = {
    id: string;
    credits: number;
    price: string;
    bonus: string;
};

export default function PaymentPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        
        const storedPackage = localStorage.getItem('selectedCreditPackage');
        if (storedPackage) {
            setSelectedPackage(JSON.parse(storedPackage));
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
                 <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Please Log In</h1>
                <p className="text-lg text-muted-foreground mb-6">You must be logged in to complete a purchase.</p>
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
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

    if (!selectedPackage) {
         return (
            <div className="container mx-auto text-center">
                 <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">No Package Selected</h1>
                <p className="text-lg text-muted-foreground mb-6">Please go back and select a credit package.</p>
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
                        <Button asChild>
                            <Link href="/purchase-credits">
                                Back to Packages
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
            <PaymentClient selectedPackage={selectedPackage} user={currentUser} />
        </PayPalScriptProvider>
    );
}

