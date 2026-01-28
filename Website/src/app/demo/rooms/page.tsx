import Link from 'next/link';
import { ArrowLeft, MapPin, Wifi, Wind, Shield, Star, Users, Home } from 'lucide-react';
import roomsData from '@/data/demo-rooms.json';
import type { Room } from '@/types';

export default function RoomsDemo() {
    const rooms = roomsData.rooms as Room[];

    const getRoomTypeColor = (type: string) => {
        switch (type) {
            case 'single': return '#7c3aed';
            case 'shared': return '#3b82f6';
            case 'studio': return '#10b981';
            default: return '#a1a1aa';
        }
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="w-4 h-4" />;
            case 'ac': return <Wind className="w-4 h-4" />;
            case 'security': return <Shield className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            {/* Header */}
            <header className="border-b border-[#2a2a2b] bg-[#0a0a0b]/90 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/demo"
                            className="p-2 hover:bg-[#1a1a1b] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Room Listings Demo</h1>
                        <span className="px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-sm">
                            {rooms.length} Properties
                        </span>
                    </div>
                </div>
            </header>

            {/* Rooms Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div
                                key={room._id}
                                className="bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300"
                            >
                                {/* Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-[#7c3aed]/20 to-[#3b82f6]/20 flex items-center justify-center">
                                    <Home className="w-16 h-16 text-[#a1a1aa]" />
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Title and Type */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
                                            {room.title}
                                        </h3>
                                        <span
                                            className="px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                                            style={{
                                                backgroundColor: `${getRoomTypeColor(room.roomType)}20`,
                                                color: getRoomTypeColor(room.roomType)
                                            }}
                                        >
                                            {room.roomType.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-2 mb-4">
                                        <MapPin className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-[#a1a1aa] line-clamp-2">
                                            {room.location.address}, {room.location.city}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <div className="text-3xl font-bold text-white">
                                            ₹{room.price.toLocaleString()}
                                            <span className="text-sm font-normal text-[#a1a1aa]">/month</span>
                                        </div>
                                        <div className="text-xs text-[#a1a1aa] mt-1">
                                            + ₹{room.securityDeposit.toLocaleString()} deposit
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {room.amenities.slice(0, 6).map((amenity, idx) => (
                                            <div
                                                key={idx}
                                                className="px-2 py-1 rounded-lg bg-[#3a3a3b] text-xs text-[#a1a1aa] flex items-center gap-1"
                                            >
                                                {getAmenityIcon(amenity)}
                                                <span className="capitalize">{amenity.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                        {room.amenities.length > 6 && (
                                            <div className="px-2 py-1 rounded-lg bg-[#3a3a3b] text-xs text-[#a1a1aa]">
                                                +{room.amenities.length - 6} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#3a3a3b]">
                                        <div>
                                            <div className="flex items-center gap-1 text-[#f59e0b] mb-1">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-bold text-white">{room.rating}</span>
                                            </div>
                                            <div className="text-xs text-[#a1a1aa]">{room.totalReviews} reviews</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <Users className="w-4 h-4 text-[#3b82f6]" />
                                                <span className="text-sm font-bold text-white">{room.maxSharingCapacity}</span>
                                            </div>
                                            <div className="text-xs text-[#a1a1aa]">Max sharing</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-1">
                                                {room.features.area}
                                            </div>
                                            <div className="text-xs text-[#a1a1aa]">sq ft</div>
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    <div className="mt-4 pt-4 border-t border-[#3a3a3b]">
                                        {room.availability.isAvailable ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                                                <span className="text-sm text-[#10b981] font-medium">
                                                    Available from {new Date(room.availability.availableFrom).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                                                <span className="text-sm text-[#ef4444] font-medium">Not Available</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
