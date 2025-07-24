
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

export async function POST(request: NextRequest) {
    try {
        const { orderID } = await request.json();

        if (!orderID) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const paypalRequest = new paypal.orders.OrdersCaptureRequest(orderID);
        paypalRequest.requestBody({} as any); // Empty body required for capture

        const capture = await paypalClient.execute(paypalRequest);
        
        // You can save the capture details to your database here
        // For example, linking the transaction to the user's account and adding credits.
        const transactionId = capture.result.purchase_units[0].payments.captures[0].id;


        return NextResponse.json({ id: transactionId, status: capture.result.status });

    } catch (error: any) {
        console.error("Failed to capture order:", error);
        // The error from PayPal's SDK can be complex
        // Check if it's a PayPal specific error object to provide more details
        if (error.statusCode) {
             return NextResponse.json({ error: "Failed to capture order.", details: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Failed to capture order.", details: error.message }, { status: 500 });
    }
}
