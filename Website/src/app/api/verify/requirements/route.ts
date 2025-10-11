import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import User from '../../../../lib/models/User';
import { verifyAccessToken } from '../../../../lib/utils/jwt';

// Configure route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/verify/requirements
 * Check verification requirements for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    await connectDB();

    // Find user
    const user = await User.findById(decoded.userId).select(
      'role isIdentityVerified identityVerificationSkipped'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isOwner = user.role.toLowerCase() === 'owner';

    // Determine verification requirements
    const verificationRequired = isOwner || !user.identityVerificationSkipped;
    const mustVerify = isOwner; // Owners must verify, students can skip

    return NextResponse.json({
      success: true,
      data: {
        user: {
          role: user.role,
          isIdentityVerified: user.isIdentityVerified || false,
          identityVerificationSkipped: user.identityVerificationSkipped || false,
        },
        requirements: {
          verificationRequired,
          mustVerify,
        },
      },
    });
  } catch (error: any) {
    console.error('[Verify Requirements] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
