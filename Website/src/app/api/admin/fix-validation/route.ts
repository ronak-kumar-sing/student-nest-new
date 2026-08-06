import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db/connection';
import Room from '../../../../lib/models/Room';
import { verifyAccessToken } from '../../../../lib/utils/jwt';

const VALID_AMENITIES = [
  'wifi', 'ac', 'powerBackup', 'security', 'housekeeping', 'laundry',
  'parking', 'gym', 'library', 'cafeteria', 'mess', 'cctv', 'geyser',
  'cooler', 'fridge', 'tv', 'bed', 'wardrobe', 'study_table', 'chair',
  'water24x7', 'lift', 'elevator', 'balcony', 'attached_bathroom',
  'kitchen', 'dining', 'swimming_pool', 'terrace', 'garden',
  'playground', 'washingMachine', 'fireExtinguisher',
];

const AMENITY_MAPPING: { [key: string]: string } = {
  'Bed': 'bed',
  'Study Table': 'study_table',
  'Wardrobe': 'wardrobe',
  'AC': 'ac',
  'WiFi': 'wifi',
  'Wi-Fi': 'wifi',
  'CCTV': 'cctv',
  'TV': 'tv',
  'Geyser': 'geyser',
  'Cooler': 'cooler',
  'Fridge': 'fridge',
  'Refrigerator': 'fridge',
  'Mess': 'mess',
};

/**
 * POST /api/admin/fix-validation
 * Admin endpoint to fix validation issues in existing rooms
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - No token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Invalid token'
      }, { status: 401 });
    }

    // SECURITY: Verify the caller has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Forbidden — Admin access required'
      }, { status: 403 });
    }

    await connectDB();

    const results = {
      totalFloorsFixed: 0,
      amenitiesFixed: 0,
      totalRoomsProcessed: 0,
      errors: [] as string[],
    };

    // Get all rooms
    const rooms = await Room.find({}).lean();
    results.totalRoomsProcessed = rooms.length;

    for (const room of rooms) {
      const updates: any = {};

      // Fix totalFloors
      if (room.features?.totalFloors !== undefined && room.features.totalFloors < 1) {
        const currentFloor = room.features?.floor || 0;
        updates['features.totalFloors'] = Math.max(currentFloor + 1, 1);
        results.totalFloorsFixed++;
      }

      // Fix amenities
      if (room.amenities && Array.isArray(room.amenities)) {
        const normalizedAmenities = room.amenities
          .map((amenity: string) => {
            if (VALID_AMENITIES.includes(amenity)) {
              return amenity;
            }

            // Try mapping
            const mapped = AMENITY_MAPPING[amenity];
            if (mapped) {
              return mapped;
            }

            // Try normalization
            const normalized = amenity.toLowerCase().replace(/\s+/g, '_');
            if (VALID_AMENITIES.includes(normalized)) {
              return normalized;
            }

            return null; // Invalid
          })
          .filter(Boolean);

        const uniqueAmenities = [...new Set(normalizedAmenities)];

        if (JSON.stringify(room.amenities) !== JSON.stringify(uniqueAmenities)) {
          updates.amenities = uniqueAmenities;
          results.amenitiesFixed++;
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        try {
          await Room.updateOne({ _id: room._id }, { $set: updates }, { runValidators: false });
        } catch (error: any) {
          results.errors.push(`Failed to update room ${room._id}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Validation fixes applied',
      data: results,
    });

  } catch (error: any) {
    console.error('Error fixing validation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix validation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
