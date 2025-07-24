
"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PurchaseCreditsClient } from "@/components/purchase-credits-client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/users";

// In a real app, this would come from your backend or a config file
const creditPackages = [
    { id: 'PKG100', credits: 100, price: '49.99', bonus: 'Most Popular' },
    { id: 'PKG250', credits: 250, price: '99.99', bonus: '+25 Bonus' },
    { id: 'PKG500', credits: 500, price: '179.99', bonus: '+75 Bonus' },
    { id: 'PKG1000', credits: 1000, price: '299.99', bonus: '+200 Bonus' },
];

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AfJ7bhG_VDx0Z2o_EtExWS_Ps2eUiZKS0lABsQCbQC02V-c_Z59cOw8xq3yNqO763BAKwSRAf8n7fob8';

export default function PurchaseCreditsPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }
    }, []);

    if (!currentUser) {
        // You can show a loading spinner or a message here
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading user information...</p>
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
