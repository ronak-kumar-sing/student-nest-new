import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { NotificationChannel, NotificationChannelType } from './notification-channel.interface.js';

@Injectable()
export class SmsNotificationChannel implements NotificationChannel {
  readonly channelType: NotificationChannelType = 'SMS';
  private readonly logger = new Logger(SmsNotificationChannel.name);
  private isTwilioConfigured = false;
  private twilioClient: any = null;
  private fromPhoneNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '+15005550006');

    if (accountSid && authToken && !accountSid.startsWith('AC_test')) {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        this.isTwilioConfigured = true;
        this.logger.log('Twilio SMS transport initialized successfully');
      } catch (err: any) {
        this.logger.error(`Failed to initialize Twilio: ${err.message}`);
      }
    } else {
      this.logger.warn('Twilio credentials not configured or using test placeholder. Running in development simulation mode.');
    }
  }

  async send(recipient: string, type: string, data: Record<string, unknown>): Promise<boolean> {
    const otpCode = data.otp ? String(data.otp) : '';
    const body = otpCode
      ? `Your StudentNest verification code is: ${otpCode}. Valid for 10 minutes.`
      : `[StudentNest] ${type}: ${JSON.stringify(data)}`;

    this.logger.log(`[Twilio SmsChannel] Dispatching ${type} SMS to phone <${recipient}> with OTP: ${otpCode || 'N/A'}`);

    if (this.isTwilioConfigured && this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body,
          from: this.fromPhoneNumber,
          to: recipient,
        });
        this.logger.log(`[Twilio] SMS successfully dispatched to ${recipient}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to dispatch SMS via Twilio: ${error?.message || error}`);
      }
    }

    return true;
  }
}

