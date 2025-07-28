'use server';

type EmailPayload = {
  to: string;
  recipientName: string;
  subject: string;
  body: string; // This will be the main content of the email
  from_name?: string;
  callToAction?: {
    text: string;
    url: string;
  };
};

export async function sendEmail({ to, recipientName, subject, body, from_name = 'Sugar Connect', callToAction }: EmailPayload) {
  const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "3ee1a7f3-b3d8-4b7d-a39a-3f40659920cb";
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f2f2f2; margin: 0; padding: 0; }
            .container { background-color: #ffffff; width: 100%; max-width: 600px; margin: 20px auto; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { font-size: 24px; font-weight: bold; color: #333333; }
            .content { font-size: 16px; color: #555555; line-height: 1.6; }
            .cta-button { display: inline-block; background-color: #e83e8c; color: #ffffff; padding: 12px 24px; margin-top: 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <p class="header">Hello, ${recipientName}.</p>
            <div class="content">
                ${body}
                ${callToAction ? `<br><br><a href="${callToAction.url}" class="cta-button">${callToAction.text}</a>` : ''}
            </div>
        </div>
    </body>
    </html>
  `;


  const payload = {
    access_key: ACCESS_KEY,
    to,
    subject,
    html,
    from_name,
  };

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Web3Forms Error:', result.message);
      // We don't throw here to avoid failing the main user-facing action
    }

    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    // We don't throw here to avoid failing the main user-facing action
  }
}
