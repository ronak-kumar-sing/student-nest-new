import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { EmailNotificationChannel } from './channels/email.channel.js';
import { SmsNotificationChannel } from './channels/sms.channel.js';
import { WhatsAppNotificationChannel } from './channels/whatsapp.channel.js';
import { BookingNotificationsListener } from './listeners/booking-notifications.listener.js';

@Module({
  providers: [
    NotificationsService,
    EmailNotificationChannel,
    SmsNotificationChannel,
    WhatsAppNotificationChannel,
    BookingNotificationsListener,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
