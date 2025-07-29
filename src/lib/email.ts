
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
  
  // Construct a human-readable, plain-text email body
  let textContent = `Hello ${recipientName},\n\n`;
  textContent += `${body}\n\n`;
  
  if (callToAction) {
      textContent += `You can view this by clicking the link below:\n`;
      textContent += `${callToAction.url}\n\n`;
  }
  
  textContent += `Thank you,\nThe Sugar Connect Team`;

  const payload = {
    access_key: ACCESS_KEY,
    to,
    subject,
    message: textContent, // Use 'message' for plain text
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
