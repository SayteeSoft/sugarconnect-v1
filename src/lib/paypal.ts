import checkout from '@paypal/checkout-server-sdk';

export function client() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials are not set in environment variables.");
    }
    
    // This sample uses SandboxEnvironment. In production, use LiveEnvironment.
    const environment = new checkout.core.SandboxEnvironment(clientId, clientSecret);
    return new checkout.core.PayPalHttpClient(environment);
}
