
import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { getStore, Store } from '@netlify/blobs';

const Environment = process.env.NODE_ENV === 'production' 
    ? paypal.core.LiveEnvironment 
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID || '',
        process.env.PAYPAL_CLIENT_SECRET || ''
    )
);

const getBlobStore = (): Store => {
  if (process.env.NETLIFY) {
    return getStore('users');
  }
  return getStore({
    name: 'users',
    consistency: 'strong',
    siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id',
    token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
  });
};

export async function POST(request: NextRequest) {
    try {
        const { orderID, userEmail } = await request.json();

        if (!orderID || !userEmail) {
            return NextResponse.json({ error: 'Order ID and User Email are required' }, { status: 400 });
        }

        const paypalRequest = new paypal.orders.OrdersCaptureRequest(orderID);
        paypalRequest.requestBody({} as any);

        const capture = await paypalClient.execute(paypalRequest);
        
        const transactionId = capture.result.purchase_units[0].payments.captures[0].id;
        const packageId = capture.result.purchase_units[0].custom_id;

        const store = getBlobStore();
        
        try {
            const user = await store.get(userEmail, { type: 'json' });
            let updatedData = {};

            if (packageId.startsWith('VERIFY')) {
                const now = new Date();
                let verifiedUntil;
                if (packageId === 'VERIFY1W') {
                    verifiedUntil = new Date(now.setDate(now.getDate() + 7));
                } else if (packageId === 'VERIFY2W') {
                    verifiedUntil = new Date(now.setDate(now.getDate() + 14));
                } else if (packageId === 'VERIFY4W') {
                    verifiedUntil = new Date(now.setDate(now.getDate() + 28));
                }
                updatedData = { verifiedUntil: verifiedUntil?.toISOString() };
            } else if (packageId.startsWith('PKG')) {
                 const creditsToAdd = parseInt(packageId.replace('PKG', ''), 10);
                 const currentCredits = user.credits || 0;
                 updatedData = { credits: currentCredits + creditsToAdd };
            }

            const updatedUser = { ...user, ...updatedData };
            await store.setJSON(userEmail, updatedUser);
            
        } catch (dbError) {
            console.error('Failed to update user in DB after payment:', dbError);
            // Even if DB update fails, we should still return success to user but log error
        }


        return NextResponse.json({ id: transactionId, status: capture.result.status });

    } catch (error: any) {
        console.error("Failed to capture order:", error);
        if (error.statusCode) {
             return NextResponse.json({ error: "Failed to capture order.", details: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Failed to capture order.", details: error.message }, { status: 500 });
    }
}
