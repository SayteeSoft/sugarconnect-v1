
import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

const Environment = process.env.NODE_ENV === 'production' 
    ? paypal.core.LiveEnvironment 
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID || '',
        process.env.PAYPAL_CLIENT_SECRET || ''
    )
);

// In a real app, this would come from a database or config file
const creditPackages: { [key: string]: { price: string, name: string } } = {
    'PKG100': { price: '49.99', name: '100 Credits Package' },
    'PKG250': { price: '99.99', name: '250 Credits Package' },
    'PKG500': { price: '179.99', name: '500 Credits Package' },
    'PKG1000': { price: '299.99', name: '1000 Credits Package' },
    'VERIFY1W': { price: '149.99', name: '1 Week Verification' },
    'VERIFY2W': { price: '89.99', name: '2 Weeks Verification' },
    'VERIFY4W': { price: '49.99', name: '4 Weeks Verification' },
};


export async function POST(request: NextRequest) {
    try {
        const { packageId } = await request.json();
        const selectedPackage = creditPackages[packageId];

        if (!selectedPackage) {
            return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 });
        }

        const paypalRequest = new paypal.orders.OrdersCreateRequest();
        paypalRequest.prefer("return=representation");
        paypalRequest.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: selectedPackage.price,
                    },
                    description: `Purchase of ${selectedPackage.name} on Sugar Connect`,
                    custom_id: packageId,
                },
            ],
        });

        const order = await paypalClient.execute(paypalRequest);

        return NextResponse.json({ id: order.result.id });

    } catch (error: any) {
        console.error("Failed to create order:", error);
        // The error from PayPal's SDK can be complex, so we log it and send a generic message
        return NextResponse.json({ error: "Failed to create order.", details: error.message }, { status: 500 });
    }
}
