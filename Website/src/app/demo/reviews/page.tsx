import Link from 'next/link';
import { ArrowLeft, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import reviewsData from '@/data/demo-reviews.json';
import studentsData from '@/data/demo-students.json';
import roomsData from '@/data/demo-rooms.json';
import type { Review, Student, Room } from '@/types';

export default function ReviewsDemo() {
    const reviews = reviewsData.reviews as Review[];
    const students = studentsData.students as Student[];
    const rooms = roomsData.rooms as Room[];

    const getStudent = (id: string) => students.find(s => s._id === id);
    const getRoom = (id: string) => rooms.find(r => r._id === id);

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                                ? 'fill-[#f59e0b] text-[#f59e0b]'
                                : 'text-[#3a3a3b]'
                            }`}
                    />
                ))}
            </div>
        );
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
                        <h1 className="text-2xl font-bold">Reviews Demo</h1>
                        <span className="px-3 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-sm">
                            {reviews.length} Reviews
                        </span>
                    </div>
                </div>
            </header>

            {/* Reviews List */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {reviews.map((review) => {
                        const student = getStudent(review.student as string);
                        const room = getRoom(review.property as string);

                        return (
                            <div
                                key={review._id}
                                className="bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl p-6"
                            >
                                {/* Property Info */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-white mb-1">{room?.title}</h3>
                                    <p className="text-sm text-[#a1a1aa]">{room?.location.address}</p>
                                </div>

                                {/* Rating Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-3xl font-bold text-white">{review.overallRating}</div>
                                            {renderStars(review.overallRating)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-sm font-bold">
                                                {student?.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{student?.fullName}</div>
                                                <div className="text-xs text-[#a1a1aa]">{review.stayDuration}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {review.isVerified && (
                                        <span className="px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-xs font-medium">
                                            ✓ Verified Stay
                                        </span>
                                    )}
                                </div>

                                {/* Category Ratings */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-[#0a0a0b]/50 rounded-xl">
                                    {Object.entries(review.categories).map(([category, rating]) => (
                                        <div key={category} className="text-center">
                                            <div className="text-lg font-bold text-white">{rating}</div>
                                            <div className="text-xs text-[#a1a1aa] capitalize">{category}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Comment */}
                                {review.comment && (
                                    <div className="mb-4">
                                        <p className="text-white leading-relaxed">{review.comment}</p>
                                    </div>
                                )}

                                {/* Helpful Count */}
                                <div className="flex items-center gap-4 mb-4">
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3a3a3b] hover:bg-[#4a4a4b] transition-colors">
                                        <ThumbsUp className="w-4 h-4 text-[#a1a1aa]" />
                                        <span className="text-sm text-white">Helpful ({review.helpfulCount})</span>
                                    </button>
                                    <span className="text-xs text-[#a1a1aa]">
                                        Posted {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Owner Response */}
                                {review.ownerResponse && (
                                    <div className="p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-[#3b82f6]" />
                                            <span className="text-sm font-medium text-[#3b82f6]">Owner Response</span>
                                            <span className="text-xs text-[#a1a1aa]">
                                                {new Date(review.ownerResponse.respondedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white">{review.ownerResponse.message}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
