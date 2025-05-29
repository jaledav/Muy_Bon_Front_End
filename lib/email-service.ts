import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Muy Bon <notifications@muybon.com>',
      to: email,
      subject: 'Verify your Muy Bon account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d4401f;">Welcome to Muy Bon!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please verify your email address to get started:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #d4401f; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify My Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #4a5568;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create this account, you can ignore this email.</p>
          <p>Thanks,<br>The Muy Bon Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }

    console.log('Verification email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Muy Bon <notifications@muybon.com>',
      to: email,
      subject: 'Welcome to Muy Bon!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d4401f;">Welcome to Muy Bon!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining Muy Bon! We're excited to have you as part of our community.</p>
          <p>With your new account, you can:</p>
          <ul>
            <li>Save your favorite restaurants</li>
            <li>Get personalized recommendations</li>
            <li>Keep up with the latest restaurant reviews</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/directory" 
               style="background-color: #d4401f; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Explore Restaurants
            </a>
          </div>
          <p>Thanks,<br>The Muy Bon Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Welcome email sending failed:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}
