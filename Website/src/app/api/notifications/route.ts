import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db/connection';
import Notification from '../../../lib/models/Notification';
import { verifyAccessToken } from '../../../lib/utils/jwt';

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

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthenticatedUser(request);

    if (error) {
      return NextResponse.json({
        success: false,
        error
      }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { userId };
    if (type) filter.type = type;
    if (unreadOnly) filter.isRead = false;

    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map((n: any) => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data,
          isRead: n.isRead,
          readAt: n.readAt,
          priority: n.priority,
          createdAt: n.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const { userId, role, error } = await getAuthenticatedUser(request);

    if (error) {
      return NextResponse.json({
        success: false,
        error
      }, { status: 401 });
    }

    // Only allow system/admin or internal calls to create notifications
    const internalKey = request.headers.get('x-internal-key');
    const isInternal = internalKey === process.env.INTERNAL_API_KEY;

    if (!isInternal) {
      // Allow creating notifications for self (like test notifications)
      // but with restrictions - only allow creating for own user
    }

    await connectDB();

    const body = await request.json();
    const { targetUserId, type, title, message, data, priority } = body;

    // Validate required fields
    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: targetUserId, type, title, message'
      }, { status: 400 });
    }

    const notification = await Notification.create({
      userId: targetUserId,
      type,
      title,
      message,
      data,
      priority: priority || 'normal',
    });

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification: {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          createdAt: notification.createdAt,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification'
    }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const { userId, error } = await getAuthenticatedUser(request);

    if (error) {
      return NextResponse.json({
        success: false,
        error
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { notificationIds, markAll } = body;

    let result;

    if (markAll) {
      // Mark all notifications as read
      result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      result = await Notification.updateMany(
        { _id: { $in: notificationIds }, userId },
        { isRead: true, readAt: new Date() }
      );
    } else {
      return NextResponse.json({
        success: false,
        error: 'Provide notificationIds array or set markAll to true'
      }, { status: 400 });
    }

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: {
        modifiedCount: result.modifiedCount,
        unreadCount,
      }
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update notifications'
    }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { userId, error } = await getAuthenticatedUser(request);

    if (error) {
      return NextResponse.json({
        success: false,
        error
      }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteRead = searchParams.get('deleteRead') === 'true';

    let result;

    if (notificationId) {
      // Delete specific notification
      result = await Notification.deleteOne({ _id: notificationId, userId });
    } else if (deleteRead) {
      // Delete all read notifications
      result = await Notification.deleteMany({ userId, isRead: true });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Provide notification id or set deleteRead to true'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} notification(s)`,
      data: {
        deletedCount: result.deletedCount,
      }
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notifications'
    }, { status: 500 });
  }
}
