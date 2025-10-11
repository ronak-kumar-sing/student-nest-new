import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import Transaction from '../../../../lib/models/Transaction';
import Customer from '../../../../lib/models/Customer';
import User from '../../../../lib/models/User';
import { verifyAccessToken } from '../../../../lib/utils/jwt';
import { createRazorpayOrder, amountToPaise } from '../../../../lib/utils/razorpay';

// Configure route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

// POST: Create a new payment order
export async function POST(request: NextRequest) {
  try {
    console.log('[Create Order] Request received');

    // Verify authentication
    const decoded = await verifyToken(request);
    const userId = decoded.userId;

    console.log('[Create Order] User authenticated:', userId);

    await connectDB();
    console.log('[Create Order] Database connected');

    const body = await request.json();
    const { amount, currency = 'INR', bookingId, propertyId, description, notes } = body;

    console.log('[Create Order] Request body:', { amount, currency, bookingId, propertyId });

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('[Create Order] Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Convert amount to paise
    const amountInPaise = amountToPaise(amount);

    // Generate unique receipt
    const receipt = `receipt_${Date.now()}_${userId}`;

    // Create Razorpay order
    console.log('[Create Order] Creating Razorpay order with:', {
      amountInPaise,
      currency,
      receipt
    });

    const orderResult = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        ...notes,
        userId,
        bookingId: bookingId || '',
        propertyId: propertyId || '',
      },
    });

    console.log('[Create Order] Razorpay order result:', {
      success: orderResult.success,
      hasData: !!orderResult.data,
      error: orderResult.error
    });

    if (!orderResult.success || !orderResult.data) {
      console.error('[Create Order] Razorpay order creation failed:', orderResult.error);
      return NextResponse.json(
        { success: false, error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      );
    }

    const order = orderResult.data;

    // Create transaction record in database
    const transaction = await Transaction.create({
      orderId: order.id,
      amount: amountInPaise,
      currency,
      status: 'created',
      userId,
      bookingId: bookingId || undefined,
      propertyId: propertyId || undefined,
      description: description || `Payment for booking`,
      receipt,
      notes: order.notes,
    });

    // Get or create customer record
    let customer = await Customer.findOne({ userId });
    if (!customer) {
      // Fetch user info from User model
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      customer = await Customer.create({
        userId,
        name: user.fullName || 'Guest User',
        email: user.email || decoded.email,
        phone: user.phone || '',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
        amount: amountInPaise,
        currency,
        receipt,
        transactionId: transaction._id,
        keyId: process.env.RAZORPAY_KEY_ID, // Send key ID to frontend
      },
    });
  } catch (error: any) {
    console.error('[Create Order] Error:', error);
    console.error('[Create Order] Error message:', error.message);
    console.error('[Create Order] Error stack:', error.stack);

    if (error.message === 'Invalid token' || error.message === 'No token provided') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
