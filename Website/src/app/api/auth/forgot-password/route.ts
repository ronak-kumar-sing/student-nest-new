import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import User from '../../../../lib/models/User';
import OTP from '../../../../lib/models/OTP';
import { sendPasswordResetEmail } from '../../../../lib/utils/email';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to OTP collection with purpose 'password_reset'
    await OTP.create({
      identifier: email.toLowerCase(),
      type: 'email',
      code: resetTokenHash,
      purpose: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't expose email sending errors to the user
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
