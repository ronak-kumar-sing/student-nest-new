export type NotificationChannelType = 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface NotificationChannel {
  readonly channelType: NotificationChannelType;
  send(recipient: string, type: string, data: Record<string, unknown>): Promise<boolean>;
}
