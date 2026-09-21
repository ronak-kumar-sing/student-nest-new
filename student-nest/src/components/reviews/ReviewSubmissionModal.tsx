'use client';

import React, { useState } from 'react';
import {
  Star,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Building,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiCreateReview } from '@/lib/api';
import { broadcastReview } from '@/lib/firebase';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    listingId: string;
    title?: string;
    startDate?: string;
    endDate?: string;
  };
  onReviewSubmitted: (bookingId: string) => void;
}

const RATING_LABELS = ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Exceptional'];

export default function ReviewSubmissionModal({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted,
}: ReviewSubmissionModalProps) {
  const { tokens, user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [wifiStudy, setWifiStudy] = useState<number>(5);
  const [safetyHost, setSafetyHost] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setError('Please select an overall star rating.');
      return;
    }

    setLoading(true);
    setError(null);

    const token = tokens?.accessToken || 'demo_token';

    try {
      await apiCreateReview(token, {
        bookingId: booking.id,
        listingId: booking.listingId,
        authorName: user?.name || 'Verified Scholar',
        rating,
        comment: comment.trim() || undefined,
        cleanliness,
        wifiStudy,
        safetyHost,
      });

      broadcastReview(booking.listingId, {
        id: `rev_${Date.now()}`,
        authorName: user?.name || 'Verified Scholar',
        authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        rating,
        comment: comment.trim() || 'Verified student review on StudentNest.',
        cleanliness,
        wifiStudy,
        safetyHost,
      });

      setSubmitted(true);
      onReviewSubmitted(booking.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-neutral-100/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 stroke-none" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">Write a Scholar Review</h3>
              <p className="text-[11px] text-neutral-500">Help fellow students find their ideal nest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-neutral-900">Review Submitted!</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Thank you for rating your stay. Your review has been added to the property page.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-black transition-colors"
              >
                Back to Bookings
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Property snippet */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="w-9 h-9 rounded-xl bg-[#FF385C]/10 text-[#FF385C] flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-neutral-900 truncate">
                    {booking.title || 'Student Accommodation'}
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Stay completed · Verified Tenant
                  </p>
                </div>
              </div>

              {/* Overall Star Rating */}
              <div className="text-center py-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Overall Experience
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= activeRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-100 text-neutral-300 stroke-[1.5]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-neutral-800 mt-1 h-4">
                  {RATING_LABELS[activeRating]}
                </div>
              </div>

              {/* Category Breakdown Sliders */}
              <div className="space-y-3 pt-2 border-t border-neutral-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Cleanliness & Hygiene</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCleanliness(s)}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold ${
                          s <= cleanliness ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Wi-Fi & Study Desk Setup</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setWifiStudy(s)}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold ${
                          s <= wifiStudy ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Host Communication & Safety</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSafetyHost(s)}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold ${
                          s <= safetyHost ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Review */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-700">
                  Detailed Feedback for Fellow Scholars
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="How was the study environment? Was it quiet during exam periods? How fast was the Wi-Fi?"
                  className="w-full text-xs border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30 focus:border-[#FF385C] resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Publish Scholar Review
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
