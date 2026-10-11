import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationChannelType } from './notification-channel.interface.js';

@Injectable()
export class WhatsAppNotificationChannel implements NotificationChannel {
  readonly channelType: NotificationChannelType = 'WHATSAPP';
  private readonly logger = new Logger(WhatsAppNotificationChannel.name);

  async send(recipient: string, type: string, data: Record<string, unknown>): Promise<boolean> {
    this.logger.log(`[WhatsAppChannel] Dispatching ${type} WhatsApp message to <${recipient}> with data: ${JSON.stringify(data)}`);
    // Plug in WhatsApp Business API / Gupshup transport here
    return true;
  }
}
