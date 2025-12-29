import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import User from '../../../../lib/models/User';
import Student from '../../../../lib/models/Student';
import Owner from '../../../../lib/models/Owner';
import { verifyAccessToken } from '../../../../lib/utils/jwt';

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

// GET /api/user/profile - Get current user profile
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

    // Fetch user based on role for more complete data
    let user;
    const userRole = (role as string)?.toLowerCase();

    if (userRole === 'student') {
      user = await Student.findById(userId).lean();
    } else if (userRole === 'owner') {
      user = await Owner.findById(userId).lean();
    } else {
      user = await User.findById(userId).lean();
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Format user data (remove sensitive fields)
    const userData = {
      id: user._id,
      _id: user._id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      name: user.fullName, // Alias for backward compatibility
      firstName: user.fullName?.split(' ')[0] || '',
      lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
      profilePhoto: user.profilePhoto || null,
      avatar: user.profilePhoto || null, // Alias
      role: user.role,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      isIdentityVerified: user.isIdentityVerified || false,
      isActive: user.isActive !== false,
      createdAt: (user as any).createdAt,
      lastLogin: user.lastLogin,
      // Role-specific fields
      ...(userRole === 'student' && {
        collegeId: (user as any).collegeId,
        collegeName: (user as any).collegeName,
        course: (user as any).course,
        yearOfStudy: (user as any).yearOfStudy,
        city: (user as any).city,
        state: (user as any).state,
        bio: (user as any).bio,
        preferences: (user as any).preferences,
        profileCompleteness: (user as any).profileCompleteness,
      }),
      ...(userRole === 'owner' && {
        businessName: (user as any).businessName,
        propertyCount: (user as any).propertyCount,
        totalRooms: (user as any).totalRooms,
        averageRating: (user as any).averageRating,
        responseRate: (user as any).responseRate,
        city: (user as any).city,
        state: (user as any).state,
        bio: (user as any).bio,
      }),
    };

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 });
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId, role, error } = await getAuthenticatedUser(request);

    if (error) {
      return NextResponse.json({
        success: false,
        error
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const userRole = (role as string)?.toLowerCase();

    // Define allowed fields based on role
    const commonFields = ['fullName', 'phone', 'profilePhoto'];
    const studentFields = [...commonFields, 'collegeId', 'collegeName', 'course', 'yearOfStudy', 'city', 'state', 'bio', 'preferences'];
    const ownerFields = [...commonFields, 'businessName', 'city', 'state', 'bio'];

    const allowedFields = userRole === 'student' ? studentFields : userRole === 'owner' ? ownerFields : commonFields;

    // Filter only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update user
    let user;
    if (userRole === 'student') {
      user = await Student.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).lean();
    } else if (userRole === 'owner') {
      user = await Owner.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).lean();
    } else {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).lean();
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Return updated user data
    const userData = {
      id: user._id,
      _id: user._id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      name: user.fullName,
      profilePhoto: user.profilePhoto || null,
      avatar: user.profilePhoto || null,
      role: user.role,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: userData
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 });
  }
}
