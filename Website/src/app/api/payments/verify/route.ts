import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import Transaction from '../../../../lib/models/Transaction';
import Booking from '../../../../lib/models/Booking';
import Notification from '../../../../lib/models/Notification';
import { verifyAccessToken } from '../../../../lib/utils/jwt';
import { verifyRazorpaySignature } from '../../../../lib/utils/razorpay';

// Check if we're in mock mode
function isMockMode(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const mockEnabled = process.env.MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'development';

  if (!keyId || !keySecret) return true;
  if (keyId.includes('xxxx') || keySecret === 'your_razorpay_key_secret') return true;

  return false;
}

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = await verifyAccessToken(token);

  if (!decoded || !decoded.userId) {
    throw new Error('Invalid token');
  }

  return decoded;
}

// POST: Verify payment signature
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = await verifyToken(request);

    await connectDB();

    const body = await request.json();
    const { orderId, paymentId, signature, bookingId } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In mock mode, accept mock orders without signature verification
    const mockMode = isMockMode();
    const isMockOrder = orderId.startsWith('order_mock_');

    if (mockMode && isMockOrder) {
      console.log('[Payment Verify] Mock mode: Skipping signature verification');
    } else {
      // Verify signature for real payments
      const isValid = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature,
      });

      if (!isValid) {
        // Update transaction as failed
        await Transaction.findOneAndUpdate(
          { orderId },
          {
            status: 'failed',
            errorCode: 'SIGNATURE_VERIFICATION_FAILED',
            errorDescription: 'Payment signature verification failed',
          }
        );

        return NextResponse.json(
          { success: false, error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    }

    // Update transaction as captured (or create if mock mode)
    let transaction = await Transaction.findOne({ orderId });

    if (!transaction && mockMode && isMockOrder) {
      // In mock mode, create a mock transaction record
      console.log('[Payment Verify] Mock mode: Creating mock transaction record');
      transaction = await Transaction.create({
        orderId,
        paymentId,
        signature,
        amount: 0, // Will be updated from booking
        currency: 'INR',
        status: 'captured',
        userId: decoded.userId,
        bookingId: bookingId || undefined,
      });
    } else if (transaction) {
      // Update existing transaction
      transaction.paymentId = paymentId;
      transaction.signature = signature;
      transaction.status = 'captured';
      transaction.updatedAt = new Date();
      await transaction.save();
    }

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // AUTO-CONFIRM BOOKING ON SUCCESSFUL ONLINE PAYMENT
    if (bookingId || transaction.bookingId) {
      const targetBookingId = bookingId || transaction.bookingId;

      try {
        const booking = await Booking.findById(targetBookingId)
          .populate('room', 'title')
          .populate('student', 'fullName')
          .populate('owner', 'fullName');

        if (booking && booking.status === 'pending') {
          // Auto-confirm the booking
          booking.status = 'confirmed';
          booking.confirmedAt = new Date();
          booking.paymentStatus = 'paid';
          booking.paymentMethod = 'online';
          await booking.save();

          // Create notification for student (booking confirmed)
          await Notification.create({
            userId: booking.student._id || booking.student,
            type: 'booking',
            title: 'Booking Confirmed!',
            message: `Your booking for "${(booking.room as any)?.title}" has been confirmed with payment.`,
            data: { bookingId: booking._id, actionUrl: '/student/bookings' },
            priority: 'high',
          });

          // Create notification for owner (payment received)
          await Notification.create({
            userId: booking.owner._id || booking.owner,
            type: 'payment',
            title: 'Payment Received',
            message: `Payment received for "${(booking.room as any)?.title}" from ${(booking.student as any)?.fullName}`,
            data: { bookingId: booking._id, actionUrl: '/owner/bookings' },
            priority: 'high',
          });
        }
      } catch (bookingError) {
        console.error('Error auto-confirming booking:', bookingError);
        // Don't fail the payment verification if booking update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        transactionId: transaction._id,
        orderId: transaction.orderId,
        paymentId: transaction.paymentId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);

    if (error.message === 'Invalid token' || error.message === 'No token provided') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
