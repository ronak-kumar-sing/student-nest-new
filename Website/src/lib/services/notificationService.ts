import Notification from '../models/Notification';
import mongoose from 'mongoose';

export type NotificationType = 'booking' | 'payment' | 'visit' | 'message' | 'negotiation' | 'system' | 'reminder';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface NotificationData {
  bookingId?: string;
  roomId?: string;
  paymentId?: string;
  visitId?: string;
  negotiationId?: string;
  senderId?: string;
  actionUrl?: string;
  [key: string]: any;
}

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  priority?: NotificationPriority;
}

/**
 * Create a notification for a user
 */
export async function createNotification(options: CreateNotificationOptions) {
  const { userId, type, title, message, data, priority = 'normal' } = options;

  try {
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      message,
      data,
      priority,
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Create booking-related notifications
 */
export const BookingNotifications = {
  // When a student creates a booking
  async bookingCreated(ownerId: string, studentName: string, roomTitle: string, bookingId: string) {
    return createNotification({
      userId: ownerId,
      type: 'booking',
      title: 'New Booking Request',
      message: `${studentName} has requested to book "${roomTitle}"`,
      data: { bookingId, actionUrl: `/owner/bookings` },
      priority: 'high',
    });
  },

  // When owner confirms a booking
  async bookingConfirmed(studentId: string, roomTitle: string, bookingId: string) {
    return createNotification({
      userId: studentId,
      type: 'booking',
      title: 'Booking Confirmed!',
      message: `Your booking for "${roomTitle}" has been confirmed`,
      data: { bookingId, actionUrl: `/student/bookings` },
      priority: 'high',
    });
  },

  // When owner rejects a booking
  async bookingRejected(studentId: string, roomTitle: string, bookingId: string, reason?: string) {
    return createNotification({
      userId: studentId,
      type: 'booking',
      title: 'Booking Declined',
      message: `Your booking for "${roomTitle}" was declined${reason ? `: ${reason}` : ''}`,
      data: { bookingId, actionUrl: `/student/bookings` },
      priority: 'normal',
    });
  },

  // When student cancels a booking
  async bookingCancelled(ownerId: string, studentName: string, roomTitle: string, bookingId: string) {
    return createNotification({
      userId: ownerId,
      type: 'booking',
      title: 'Booking Cancelled',
      message: `${studentName} has cancelled their booking for "${roomTitle}"`,
      data: { bookingId, actionUrl: `/owner/bookings` },
      priority: 'normal',
    });
  },
};

/**
 * Create payment-related notifications
 */
export const PaymentNotifications = {
  // When payment is completed
  async paymentCompleted(userId: string, amount: number, roomTitle: string, paymentId: string, isOwner: boolean = false) {
    return createNotification({
      userId,
      type: 'payment',
      title: isOwner ? 'Payment Received' : 'Payment Successful',
      message: isOwner
        ? `Payment of ₹${amount.toLocaleString()} received for "${roomTitle}"`
        : `Your payment of ₹${amount.toLocaleString()} for "${roomTitle}" was successful`,
      data: { paymentId, actionUrl: isOwner ? `/owner/payments` : `/student/payments` },
      priority: 'high',
    });
  },

  // Payment reminder
  async paymentReminder(studentId: string, amount: number, roomTitle: string, dueDate: Date, bookingId: string) {
    return createNotification({
      userId: studentId,
      type: 'reminder',
      title: 'Payment Reminder',
      message: `Reminder: ₹${amount.toLocaleString()} due for "${roomTitle}" on ${dueDate.toLocaleDateString()}`,
      data: { bookingId, actionUrl: `/student/payments` },
      priority: 'high',
    });
  },

  // Payment failed
  async paymentFailed(studentId: string, amount: number, roomTitle: string, paymentId: string) {
    return createNotification({
      userId: studentId,
      type: 'payment',
      title: 'Payment Failed',
      message: `Payment of ₹${amount.toLocaleString()} for "${roomTitle}" failed. Please try again.`,
      data: { paymentId, actionUrl: `/student/payments` },
      priority: 'urgent',
    });
  },
};

/**
 * Create visit-related notifications
 */
export const VisitNotifications = {
  // When student requests a visit
  async visitRequested(ownerId: string, studentName: string, roomTitle: string, visitId: string, date: string) {
    return createNotification({
      userId: ownerId,
      type: 'visit',
      title: 'New Visit Request',
      message: `${studentName} wants to visit "${roomTitle}" on ${date}`,
      data: { visitId, actionUrl: `/owner/visits` },
      priority: 'high',
    });
  },

  // When owner confirms a visit
  async visitConfirmed(studentId: string, roomTitle: string, visitId: string, date: string, time: string) {
    return createNotification({
      userId: studentId,
      type: 'visit',
      title: 'Visit Confirmed',
      message: `Your visit to "${roomTitle}" is confirmed for ${date} at ${time}`,
      data: { visitId, actionUrl: `/student/visits` },
      priority: 'high',
    });
  },

  // When owner rejects a visit
  async visitRejected(studentId: string, roomTitle: string, visitId: string) {
    return createNotification({
      userId: studentId,
      type: 'visit',
      title: 'Visit Request Declined',
      message: `Your visit request for "${roomTitle}" was declined`,
      data: { visitId, actionUrl: `/student/visits` },
      priority: 'normal',
    });
  },

  // Visit reminder
  async visitReminder(userId: string, roomTitle: string, visitId: string, date: string, time: string) {
    return createNotification({
      userId,
      type: 'reminder',
      title: 'Visit Reminder',
      message: `Reminder: Your visit to "${roomTitle}" is scheduled for ${date} at ${time}`,
      data: { visitId },
      priority: 'high',
    });
  },
};

/**
 * Create negotiation-related notifications
 */
export const NegotiationNotifications = {
  // When student starts a negotiation
  async negotiationStarted(ownerId: string, studentName: string, roomTitle: string, negotiationId: string, offeredPrice: number) {
    return createNotification({
      userId: ownerId,
      type: 'negotiation',
      title: 'New Price Negotiation',
      message: `${studentName} offered ₹${offeredPrice.toLocaleString()}/mo for "${roomTitle}"`,
      data: { negotiationId, actionUrl: `/owner/negotiations` },
      priority: 'high',
    });
  },

  // When owner counters
  async negotiationCountered(studentId: string, roomTitle: string, negotiationId: string, counterPrice: number) {
    return createNotification({
      userId: studentId,
      type: 'negotiation',
      title: 'Counter Offer Received',
      message: `Owner countered with ₹${counterPrice.toLocaleString()}/mo for "${roomTitle}"`,
      data: { negotiationId, actionUrl: `/student/negotiations` },
      priority: 'high',
    });
  },

  // When negotiation is accepted
  async negotiationAccepted(userId: string, roomTitle: string, negotiationId: string, finalPrice: number, isOwner: boolean) {
    return createNotification({
      userId,
      type: 'negotiation',
      title: 'Negotiation Accepted',
      message: `${isOwner ? 'Student' : 'Owner'} accepted ₹${finalPrice.toLocaleString()}/mo for "${roomTitle}"`,
      data: { negotiationId },
      priority: 'high',
    });
  },
};

/**
 * Create system notifications
 */
export const SystemNotifications = {
  // Welcome notification
  async welcomeUser(userId: string, userName: string, role: string) {
    return createNotification({
      userId,
      type: 'system',
      title: 'Welcome to StudentNest!',
      message: `Hello ${userName}! ${role === 'student'
        ? 'Start exploring rooms near your college.'
        : 'List your properties to reach thousands of students.'}`,
      priority: 'low',
    });
  },

  // Profile verification reminder
  async verificationReminder(userId: string) {
    return createNotification({
      userId,
      type: 'system',
      title: 'Complete Your Verification',
      message: 'Verify your email and phone to access all features',
      data: { actionUrl: '/profile/verification' },
      priority: 'normal',
    });
  },

  // Generic announcement
  async announcement(userId: string, title: string, message: string) {
    return createNotification({
      userId,
      type: 'system',
      title,
      message,
      priority: 'low',
    });
  },
};

export default {
  createNotification,
  BookingNotifications,
  PaymentNotifications,
  VisitNotifications,
  NegotiationNotifications,
  SystemNotifications,
};
