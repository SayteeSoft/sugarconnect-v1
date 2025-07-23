import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { client } from '@/lib/paypal';

export async function POST(req: NextRequest) {
    const { amount } = await req.json();

    if (!amount) {
        return NextResponse.json({ success: false, message: 'Missing amount' }, { status: 400 });
    }
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount.toString(),
            }
        }]
    });

    try {
        const order = await client().execute(request);
        return NextResponse.json({ success: true, data: { orderID: order.result.id } });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
