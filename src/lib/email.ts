
'use server';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from_name?: string;
};

export async function sendEmail({ to, subject, html, from_name = 'Sugar Connect' }: EmailPayload) {
  const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "3ee1a7f3-b3d8-4b7d-a39a-3f40659920cb";

  const payload = {
    access_key: ACCESS_KEY,
    email: to,
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
