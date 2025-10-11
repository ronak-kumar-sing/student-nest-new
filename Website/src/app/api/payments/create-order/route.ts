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
  try {
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
  } catch (error: any) {
    console.error('[verifyToken] Error:', error.message);
    throw error;
  }
}

// POST: Create a new payment order
export async function POST(request: NextRequest) {
  console.log('\n========== CREATE ORDER REQUEST ==========');
  try {
    console.log('[Create Order] 1. Request received');

    // Verify authentication
    let decoded;
    try {
      decoded = await verifyToken(request);
      console.log('[Create Order] 2. User authenticated:', decoded.userId);
    } catch (authError: any) {
      console.error('[Create Order] Authentication failed:', authError.message);
      return NextResponse.json(
        { success: false, error: authError.message || 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Connect to database
    try {
      await connectDB();
      console.log('[Create Order] 3. Database connected');
    } catch (dbError: any) {
      console.error('[Create Order] Database connection failed:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('[Create Order] 4. Request body parsed:', { 
        amount: body.amount, 
        currency: body.currency, 
        bookingId: body.bookingId,
        propertyId: body.propertyId 
      });
    } catch (parseError: any) {
      console.error('[Create Order] Body parse error:', parseError.message);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { amount, currency = 'INR', bookingId, propertyId, description, notes } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('[Create Order] Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Amount must be greater than 0' },
        { status: 400 }
      );
    }

    console.log('[Create Order] 5. Amount validated:', amount);

    // Convert amount to paise
    const amountInPaise = amountToPaise(amount);
    console.log('[Create Order] 6. Amount in paise:', amountInPaise);

    // Generate unique receipt
    const receipt = `receipt_${Date.now()}_${userId}`;
    console.log('[Create Order] 7. Receipt generated:', receipt);

    // Create Razorpay order
    console.log('[Create Order] 8. Creating Razorpay order...');
    let orderResult;
    try {
      orderResult = await createRazorpayOrder({
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
      
      console.log('[Create Order] 9. Razorpay order result:', {
        success: orderResult.success,
        hasData: !!orderResult.data,
        error: orderResult.error
      });
    } catch (razorpayError: any) {
      console.error('[Create Order] Razorpay order creation threw error:', razorpayError.message);
      return NextResponse.json(
        { success: false, error: 'Razorpay order creation failed: ' + razorpayError.message },
        { status: 500 }
      );
    }

    if (!orderResult.success || !orderResult.data) {
      console.error('[Create Order] Razorpay order creation failed:', orderResult.error);
      return NextResponse.json(
        { success: false, error: orderResult.error || 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }

    const order = orderResult.data;
    console.log('[Create Order] 10. Razorpay order created:', order.id);

    // Create transaction record in database
    console.log('[Create Order] 11. Creating transaction record...');
    let transaction;
    try {
      transaction = await Transaction.create({
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
      console.log('[Create Order] 12. Transaction created:', transaction._id);
    } catch (transactionError: any) {
      console.error('[Create Order] Transaction creation failed:', transactionError.message);
      console.error('[Create Order] Transaction error details:', transactionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create transaction record: ' + transactionError.message },
        { status: 500 }
      );
    }

    // Get or create customer record
    console.log('[Create Order] 13. Checking for customer record...');
    let customer;
    try {
      customer = await Customer.findOne({ userId });
      console.log('[Create Order] 14. Customer found:', !!customer);
      
      if (!customer) {
        console.log('[Create Order] 15. Fetching user info...');
        // Fetch user info from User model
        const user = await User.findById(userId);
        
        if (!user) {
          console.error('[Create Order] User not found for userId:', userId);
          return NextResponse.json(
            { success: false, error: 'User not found in database' },
            { status: 404 }
          );
        }

        console.log('[Create Order] 16. Creating customer record...');
        customer = await Customer.create({
          userId,
          name: user.fullName || 'Guest User',
          email: user.email || decoded.email,
          phone: user.phone || '',
        });
        console.log('[Create Order] 17. Customer created:', customer._id);
      }
    } catch (customerError: any) {
      console.error('[Create Order] Customer operation failed:', customerError.message);
      console.error('[Create Order] Customer error details:', customerError);
      // Don't fail the whole request if customer creation fails
      console.warn('[Create Order] Continuing without customer record...');
    }

    console.log('[Create Order] 18. Preparing response...');
    const responseData = {
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
    };

    console.log('[Create Order] 19. SUCCESS! Returning response');
    console.log('==========================================\n');
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('\n========== CREATE ORDER ERROR ==========');
    console.error('[Create Order] Unexpected error:', error);
    console.error('[Create Order] Error message:', error.message);
    console.error('[Create Order] Error stack:', error.stack);
    console.error('==========================================\n');

    if (error.message === 'Invalid token' || error.message === 'No token provided') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
