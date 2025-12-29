import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'booking' | 'payment' | 'visit' | 'message' | 'negotiation' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: {
    bookingId?: mongoose.Types.ObjectId;
    roomId?: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    visitId?: mongoose.Types.ObjectId;
    negotiationId?: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    actionUrl?: string;
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['booking', 'payment', 'visit', 'message', 'negotiation', 'system', 'reminder'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    data: {
      bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
      roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
      paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
      visitId: { type: Schema.Types.ObjectId, ref: 'VisitRequest' },
      negotiationId: { type: Schema.Types.ObjectId, ref: 'Negotiation' },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      actionUrl: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create notification
notificationSchema.statics.createNotification = async function(
  userId: string,
  type: INotification['type'],
  title: string,
  message: string,
  data?: INotification['data'],
  priority: INotification['priority'] = 'normal'
) {
  const notification = await this.create({
    userId,
    type,
    title,
    message,
    data,
    priority,
  });
  return notification;
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId: string, userId: string) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
