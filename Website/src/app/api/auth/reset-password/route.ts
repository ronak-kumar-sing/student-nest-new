import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import User from '../../../../lib/models/User';
import OTP from '../../../../lib/models/OTP';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body);
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

    const { token, email, password } = validationResult.data;

    await connectDB();

    // Hash the token to compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const otpRecord = await OTP.findOne({
      identifier: email.toLowerCase(),
      code: tokenHash,
      purpose: 'password_reset',
      expiresAt: { $gt: new Date() },
      isUsed: { $ne: true },
    });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset token'
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Mark token as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Delete all password reset tokens for this user
    await OTP.deleteMany({
      identifier: email.toLowerCase(),
      purpose: 'password_reset',
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
