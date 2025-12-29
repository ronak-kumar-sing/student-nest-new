import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import { verifyAccessToken } from '../../../../lib/utils/jwt';
import mongoose from 'mongoose';

// Payment schema (inline to avoid circular imports)
const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay', 'upi', 'cash', 'bank_transfer'], default: 'razorpay' },
  transactionId: String,
  orderId: String,
  paidDate: Date,
  dueDate: Date,
}, { timestamps: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// Helper function to verify authentication
async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No valid authorization header found' };
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return { error: 'Invalid token payload' };
    }

    return { userId: decoded.userId, role: decoded.role as string };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Invalid or expired token' };
  }
}

// GET /api/payments/summary - Get payment summary for user
export async function GET(request: NextRequest) {
  try {
    const { userId, role, error } = await getAuthenticatedUser(request);

    if (error) {
      return NextResponse.json({
        success: false,
        error
      }, { status: 401 });
    }

    await connectDB();

    // Build filter based on role
    const filter: any = {};
    if (role === 'student') {
      filter.studentId = new mongoose.Types.ObjectId(userId);
    } else if (role === 'owner') {
      filter.ownerId = new mongoose.Types.ObjectId(userId);
    }

    // Get payment statistics
    const [summary] = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
        }
      }
    ]);

    // Get recent payments
    const recentPayments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('propertyId', 'title')
      .populate('studentId', 'fullName')
      .populate('ownerId', 'fullName')
      .lean();

    // Get next due payment
    const nextDue = await Payment.findOne({
      ...filter,
      status: 'pending',
      dueDate: { $exists: true, $ne: null }
    }).sort({ dueDate: 1 }).lean() as any;

    // Return format expected by mobile app
    return NextResponse.json({
      success: true,
      data: {
        // Fields for mobile app
        totalPaid: summary?.completedAmount || 0,
        totalPending: summary?.pendingAmount || 0,
        nextDue: nextDue ? {
          amount: nextDue.amount,
          dueDate: nextDue.dueDate
        } : null,
        // Additional summary for web dashboard
        summary: summary || {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          completedAmount: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          failedPayments: 0,
        },
        recentPayments: recentPayments.map((p: any) => ({
          id: p._id,
          amount: p.amount,
          status: p.status,
          paymentMethod: p.paymentMethod,
          property: p.propertyId?.title,
          student: p.studentId?.fullName,
          owner: p.ownerId?.fullName,
          paidDate: p.paidDate,
          createdAt: p.createdAt,
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payment summary'
    }, { status: 500 });
  }
}
