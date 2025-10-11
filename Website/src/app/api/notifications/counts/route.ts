import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import Booking from '../../../../lib/models/Booking';
import Negotiation from '../../../../lib/models/Negotiation';
import { verifyAccessToken } from '../../../../lib/utils/jwt';

/**
 * GET /api/notifications/counts
 * Get pending notification counts for sidebar badges
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    await connectDB();

    // Get user role from token or query
    const userRole = (decoded.role as string) || 'student';

    let counts = {
      bookings: 0,
      negotiations: 0,
      messages: 0,
      visits: 0,
      total: 0,
    };

    if (userRole.toLowerCase() === 'owner') {
      // Owner counts
      // Pending booking requests (waiting for owner confirmation)
      const pendingBookings = await Booking.countDocuments({
        owner: userId,
        status: { $in: ['pending', 'confirmed'] },
      });

      // Pending negotiations (waiting for owner response)
      const pendingNegotiations = await Negotiation.countDocuments({
        owner: userId,
        status: 'pending',
      });

      // Pending visit requests (if Visit model exists)
      let pendingVisits = 0;
      try {
        // Visit model might not exist yet
        // pendingVisits = await Visit.countDocuments({
        //   owner: userId,
        //   status: 'pending',
        // });
      } catch (error) {
        // Visit model doesn't exist, skip
      }

      counts.bookings = pendingBookings;
      counts.negotiations = pendingNegotiations;
      counts.visits = pendingVisits;
      counts.total = pendingBookings + pendingNegotiations + pendingVisits;

    } else {
      // Student counts
      // Countered negotiations (waiting for student response)
      const counteredNegotiations = await Negotiation.countDocuments({
        student: userId,
        status: 'countered',
      });

      // Bookings awaiting action
      const actionableBookings = await Booking.countDocuments({
        student: userId,
        status: { $in: ['confirmed', 'active'] },
        paymentStatus: { $in: ['pending', 'partial'] },
      });

      counts.negotiations = counteredNegotiations;
      counts.bookings = actionableBookings;
      counts.total = counteredNegotiations + actionableBookings;
    }

    return NextResponse.json({
      success: true,
      data: counts,
    });

  } catch (error: any) {
    console.error('Notification counts error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notification counts' },
      { status: 500 }
    );
  }
}
