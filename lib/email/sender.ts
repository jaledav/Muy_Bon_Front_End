import { Resend } from 'resend';

// Check if API key is available and log for debugging
const isResendKeyAvailable = !!process.env.RESEND_API_KEY;
console.log('RESEND_API_KEY available:', isResendKeyAvailable);

// Initialize Resend only if API key is present
const resend = isResendKeyAvailable ? new Resend(process.env.RESEND_API_KEY) : null;

// Interface for the welcome email data
interface SendWelcomeEmailParams {
  to: string; // recipient email
  name: string; // user's name
  confirmationUrl?: string; // optional confirmation URL
}

/**
 * Sends a welcome email to a newly registered user
 */
export async function sendWelcomeEmail({ to, name, confirmationUrl }: SendWelcomeEmailParams) {
  if (!resend) {
    console.error('Resend API client not initialized - missing API key');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Muy Bon Directory <signup@muybon.com>',
      to: [to],
      subject: 'Welcome to Muy Bon Directory!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #D92B2B;">Welcome to Muy Bon Directory!</h1>
          <p>Hello ${name},</p>
          <p>Thank you for signing up for Muy Bon Directory! We're excited to have you join our community of food lovers.</p>
          ${confirmationUrl ? `
            <p>Please confirm your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="background-color: #D92B2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Confirm Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser: ${confirmationUrl}</p>
          ` : ''}
          <p>With Muy Bon Directory, you can:</p>
          <ul>
            <li>Save your favorite restaurants</li>
            <li>Get personalized recommendations</li>
            <li>Discover new dining spots</li>
          </ul>
          <p>Happy dining!</p>
          <p>The Muy Bon Directory Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception when sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a verification email for account confirmation
 */
export async function sendVerificationEmail({ to, name, confirmationUrl }: SendWelcomeEmailParams) {
  if (!resend) {
    console.error('Resend API client not initialized - missing API key');
    return { success: false, error: 'Email service not configured' };
  }

  if (!confirmationUrl) {
    console.error('Confirmation URL is required for verification emails');
    return { success: false, error: 'Confirmation URL is required' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Muy Bon <verify@muybon.com>', // Changed
      to: [to],
      subject: 'Verify Your Email Address - Muy Bon', // Changed
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #D92B2B;">Verify Your Email</h1>
          <p>Hello ${name},</p>
          <p>Thank you for creating an account with Muy Bon. To complete your registration, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #D92B2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p>${confirmationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <p>Best regards,</p>
          <p>The Muy Bon Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception when sending verification email:', error);
    return { success: false, error };
  }
}
