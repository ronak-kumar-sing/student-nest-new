import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@student-nest.live';
const FROM_NAME = 'Student Nest';
const REPLY_TO_EMAIL = 'support@student-nest.live';
const IS_DEV = process.env.NODE_ENV === 'development';

// Company details for CAN-SPAM compliance
const COMPANY_ADDRESS = 'Student Nest, India';
const UNSUBSCRIBE_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live'}/unsubscribe`;

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key not configured - running in mock mode');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  category?: string;
}

/**
 * Generate email footer with unsubscribe and address (CAN-SPAM compliance)
 */
function getEmailFooter(): string {
  return `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
      <p>&copy; ${new Date().getFullYear()} Student Nest. All rights reserved.</p>
      <p style="margin-top: 10px;">${COMPANY_ADDRESS}</p>
      <p style="margin-top: 10px;">
        <a href="${UNSUBSCRIBE_URL}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live'}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
      </p>
      <p style="margin-top: 10px; font-size: 11px;">
        This email was sent to you because you have an account with Student Nest. 
        If you did not create an account, please ignore this email.
      </p>
    </div>
  `;
}

/**
 * Send email using SendGrid with spam-prevention best practices
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In development without API key, simulate success
  if (!SENDGRID_API_KEY) {
    if (IS_DEV) {
      console.log(`[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`);
      return true;
    }
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@student-nest.live>`;
    
    await sgMail.send({
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      replyTo: {
        email: REPLY_TO_EMAIL,
        name: FROM_NAME
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      categories: options.category ? [options.category] : ['transactional'],
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Student Nest Mailer',
        'Message-ID': messageId,
        'List-Unsubscribe': `<${UNSUBSCRIBE_URL}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      trackingSettings: {
        clickTracking: { enable: true, enableText: false },
        openTracking: { enable: true },
        subscriptionTracking: { enable: false },
      },
      mailSettings: {
        bypassListManagement: { enable: false },
        sandboxMode: { enable: false },
      },
    });

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // In development, return true even on error to allow testing
    if (IS_DEV) {
      console.log('[DEV MODE] Simulating successful email send');
      return true;
    }
    return false;
  }
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  // Log OTP in development mode for testing
  if (IS_DEV) {
    console.log(`\n========================================`);
    console.log(`📧 [DEV OTP] Email: ${email}`);
    console.log(`🔐 [DEV OTP] Code: ${otp}`);
    console.log(`========================================\n`);
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Student Nest</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Student Nest</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Hello,</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Your One-Time Password (OTP) for email verification is:</p>
                    <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 25px; margin: 25px 0; text-align: center; border-radius: 8px;">
                      <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 10px; font-family: 'Courier New', monospace;">${otp}</div>
                    </div>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #e74c3c;"><strong>⏰ This OTP is valid for 10 minutes only.</strong></p>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">If you didn't request this OTP, please ignore this email. Your account is safe.</p>
                    <p style="margin: 25px 0 0 0; font-size: 16px;">Best regards,<br><strong>Student Nest Team</strong></p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} Student Nest. All rights reserved.</p>
                    <p style="margin: 0 0 10px 0;">${COMPANY_ADDRESS}</p>
                    <p style="margin: 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live'}" style="color: #667eea; text-decoration: none;">Visit our website</a> | 
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live'}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const textVersion = `
Student Nest - Email Verification

Hello,

Your One-Time Password (OTP) for email verification is: ${otp}

This OTP is valid for 10 minutes only.

If you didn't request this OTP, please ignore this email. Your account is safe.

Best regards,
Student Nest Team

---
© ${new Date().getFullYear()} Student Nest. All rights reserved.
${COMPANY_ADDRESS}
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Student Nest',
    html,
    text: textVersion,
    category: 'otp-verification'
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string, role: 'student' | 'owner'): Promise<boolean> {
  const roleText = role === 'student' ? 'Student' : 'Property Owner';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Student Nest</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to Student Nest!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to find the perfect accommodation starts here</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${name},</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Welcome to Student Nest! We're thrilled to have you join our community as a <strong>${roleText}</strong>.</p>
                    ${role === 'student'
                      ? '<p style="margin: 0 0 20px 0; font-size: 16px;">You can now start browsing available rooms and connect with verified property owners near your college.</p>'
                      : '<p style="margin: 0 0 20px 0; font-size: 16px;">You can now start listing your properties and connect with students looking for quality accommodation.</p>'
                    }
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${appUrl}" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Get Started
                      </a>
                    </div>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">If you have any questions, feel free to reach out to our support team at <a href="mailto:support@student-nest.live" style="color: #667eea;">support@student-nest.live</a>.</p>
                    <p style="margin: 25px 0 0 0; font-size: 16px;">Best regards,<br><strong>Student Nest Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} Student Nest. All rights reserved.</p>
                    <p style="margin: 0 0 10px 0;">${COMPANY_ADDRESS}</p>
                    <p style="margin: 0;">
                      <a href="${appUrl}" style="color: #667eea; text-decoration: none;">Visit Website</a> | 
                      <a href="${appUrl}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> |
                      <a href="${UNSUBSCRIBE_URL}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const textVersion = `
Welcome to Student Nest!

Hi ${name},

Welcome to Student Nest! We're thrilled to have you join our community as a ${roleText}.

${role === 'student' 
  ? 'You can now start browsing available rooms and connect with verified property owners near your college.' 
  : 'You can now start listing your properties and connect with students looking for quality accommodation.'}

Get started: ${appUrl}

If you have any questions, feel free to reach out to our support team at support@student-nest.live.

Best regards,
Student Nest Team

---
© ${new Date().getFullYear()} Student Nest. All rights reserved.
${COMPANY_ADDRESS}
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Welcome to Student Nest! 🏠',
    html,
    text: textVersion,
    category: 'welcome'
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live';
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Student Nest</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Student Nest</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Hello,</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px;">We received a request to reset your password for your Student Nest account. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Reset Password
                      </a>
                    </div>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #e74c3c;"><strong>⏰ This link is valid for 1 hour only.</strong></p>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                    <p style="margin: 0 0 15px 0; font-size: 12px; color: #999; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                      <strong>Can't click the button?</strong> Copy and paste this URL into your browser:<br>
                      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                    </p>
                    <p style="margin: 25px 0 0 0; font-size: 16px;">Best regards,<br><strong>Student Nest Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} Student Nest. All rights reserved.</p>
                    <p style="margin: 0 0 10px 0;">${COMPANY_ADDRESS}</p>
                    <p style="margin: 0;">
                      <a href="${appUrl}" style="color: #667eea; text-decoration: none;">Visit Website</a> | 
                      <a href="${appUrl}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const textVersion = `
Student Nest - Password Reset Request

Hello,

We received a request to reset your password for your Student Nest account.

Reset your password by visiting this link:
${resetUrl}

This link is valid for 1 hour only.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
Student Nest Team

---
© ${new Date().getFullYear()} Student Nest. All rights reserved.
${COMPANY_ADDRESS}
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Student Nest',
    html,
    text: textVersion,
    category: 'password-reset'
  });
}
