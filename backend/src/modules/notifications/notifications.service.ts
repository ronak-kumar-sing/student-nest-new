import { Injectable, Logger } from '@nestjs/common';
import { EmailNotificationChannel } from './channels/email.channel.js';
import { SmsNotificationChannel } from './channels/sms.channel.js';
import { WhatsAppNotificationChannel } from './channels/whatsapp.channel.js';
import { NotificationChannelType, NotificationChannel } from './channels/notification-channel.interface.js';

export type NotificationType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'PAYMENT_RECEIVED'
  | 'BOOKING_CANCELLED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'EMAIL_VERIFICATION'
  | 'OWNER_VERIFICATION_REMINDER'
  | 'EMAIL_OTP'
  | 'SMS_OTP';

export interface NotificationPayload {
  recipient: string;
  type: NotificationType;
  data: Record<string, unknown>;
  channel?: NotificationChannelType;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly channels = new Map<NotificationChannelType, NotificationChannel>();

  constructor(
    private readonly emailChannel: EmailNotificationChannel,
    private readonly smsChannel: SmsNotificationChannel,
    private readonly whatsappChannel: WhatsAppNotificationChannel,
  ) {
    this.channels.set('EMAIL', this.emailChannel);
    this.channels.set('SMS', this.smsChannel);
    this.channels.set('WHATSAPP', this.whatsappChannel);
  }

  async send(payload: NotificationPayload): Promise<{ delivered: boolean; timestamp: string; channel: string }> {
    const channelType = payload.channel || 'EMAIL';
    const channel = this.channels.get(channelType);

    if (!channel) {
      this.logger.warn(`Unsupported notification channel: ${channelType}, falling back to EMAIL`);
      await this.emailChannel.send(payload.recipient, payload.type, payload.data);
    } else {
      await channel.send(payload.recipient, payload.type, payload.data);
    }

    return {
      delivered: true,
      timestamp: new Date().toISOString(),
      channel: channelType,
    };
  }

  getStatus() {
    return {
      module: 'notifications',
      status: 'ready',
      channels: Array.from(this.channels.keys()),
    };
  }
}
