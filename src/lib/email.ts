
'use server';

type EmailPayload = {
  to: string;
  recipientName: string;
  subject: string;
  body: string; // This will be the main content of the email
  from_name?: string;
  imageUrl?: string;
  callToAction?: {
    text: string;
    url: string;
  };
};

export async function sendEmail({ to, recipientName, subject, body, from_name = 'Sugar Connect', callToAction, imageUrl }: EmailPayload) {
  const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "3ee1a7f3-b3d8-4b7d-a39a-3f40659920cb";
  
  // Construct an HTML email body
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #F5A3F5;">Hello ${recipientName},</h2>
      <p>${body.replace(/\n/g, '<br>')}</p>
  `;

  if (imageUrl) {
    htmlContent += `
      <div style="margin: 20px 0;">
        <a href="${callToAction?.url || '#'}">
          <img src="${imageUrl}" alt="User Profile Image" style="max-width: 150px; height: auto; border-radius: 8px;" />
        </a>
      </div>
    `;
  }

  if (callToAction) {
      htmlContent += `
        <a href="${callToAction.url}" style="background-color: #F5A3F5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          ${callToAction.text}
        </a>
      `;
  }
  
  htmlContent += `
      <p style="margin-top: 30px; font-size: 0.9em; color: #888;">
        Thank you,<br>The Sugar Connect Team
      </p>
    </div>
  `;

  const payload = {
    access_key: ACCESS_KEY,
    to,
    subject,
    from_name,
    html: htmlContent, // Use 'html' for HTML content
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
