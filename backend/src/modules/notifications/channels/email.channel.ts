import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { NotificationChannel, NotificationChannelType } from './notification-channel.interface.js';

@Injectable()
export class EmailNotificationChannel implements NotificationChannel {
  readonly channelType: NotificationChannelType = 'EMAIL';
  private readonly logger = new Logger(EmailNotificationChannel.name);
  private isSendGridConfigured = false;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL', 'support@studentnest.com');

    if (apiKey && !apiKey.startsWith('SG.test')) {
      sgMail.setApiKey(apiKey);
      this.isSendGridConfigured = true;
      this.logger.log('SendGrid mail transport initialized');
    } else {
      this.logger.warn('SendGrid API key not configured or using test placeholder. Running in development simulation mode.');
    }
  }

  async send(recipient: string, type: string, data: Record<string, unknown>): Promise<boolean> {
    const subject =
      type === 'EMAIL_OTP'
        ? 'Your StudentNest Verification Code'
        : type === 'EMAIL_VERIFICATION'
        ? 'Verify your StudentNest Email'
        : 'StudentNest Notification';

    const otpCode = data.otp ? String(data.otp) : '';
    const content = otpCode
      ? `Your verification code is: ${otpCode}. It will expire in 10 minutes.`
      : `Notification: ${JSON.stringify(data)}`;

    this.logger.log(`[SendGrid EmailChannel] Dispatching ${type} to <${recipient}> with OTP: ${otpCode || 'N/A'}`);

    if (this.isSendGridConfigured) {
      try {
        await sgMail.send({
          to: recipient,
          from: this.fromEmail,
          subject,
          text: content,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f9f9f9; color: #222;">
              <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 16px; border: 1px solid #eee;">
                <h2 style="color: #FF385C; margin-top: 0;">StudentNest</h2>
                <h3>${subject}</h3>
                <p>Hello,</p>
                <p>Please use the following verification code to complete your signup or verification:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111; margin: 24px 0; padding: 12px; background: #f4f4f4; text-align: center; border-radius: 8px;">
                  ${otpCode}
                </div>
                <p style="color: #777; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
              </div>
            </div>
          `,
        });
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to send email via SendGrid: ${error?.message || error}`, error?.response?.body);
      }
    }

    return true;
  }
}

