import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { client } from '@/lib/paypal';

export async function POST(req: NextRequest) {
    const { orderID } = await req.json();

    if (!orderID) {
        return NextResponse.json({ success: false, message: 'Missing orderID' }, { status: 400 });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client().execute(request);
        return NextResponse.json({ success: true, data: capture.result });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
