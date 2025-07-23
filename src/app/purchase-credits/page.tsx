import { PurchaseCreditsClient } from "@/components/purchase-credits-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Purchase Credits - Sugar Connect",
    description: "Unlock conversations by choosing one of our credit packages.",
};

const creditPackages = [
    { id: 1, credits: 100, bonus: 0, price: 49.99, popular: true },
    { id: 2, credits: 250, bonus: 25, price: 99.99, popular: false },
    { id: 3, credits: 500, bonus: 75, price: 179.99, popular: false },
    { id: 4, credits: 1000, bonus: 200, price: 299.99, popular: false },
];

export default function PurchaseCreditsPage() {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!paypalClientId) {
        return <div className="text-center py-10">Error: PayPal Client ID not configured.</div>
    }
    
    return (
        <PurchaseCreditsClient packages={creditPackages} paypalClientId={paypalClientId} />
    );
}
