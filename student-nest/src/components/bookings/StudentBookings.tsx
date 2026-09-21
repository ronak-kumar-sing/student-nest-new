'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  Home,
  X,
  CreditCard,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGetMyBookings, apiCancelBooking } from '@/lib/api';
import { subscribeToBookingUpdates, broadcastBookingUpdate } from '@/lib/firebase';
import RazorpayCheckoutModal from '@/components/payments/RazorpayCheckoutModal';
import ReviewSubmissionModal from '@/components/reviews/ReviewSubmissionModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  PENDING: { label: 'Pending', color: 'amber', icon: Clock, desc: 'Awaiting owner approval' },
  ACCEPTED: { label: 'Accepted - Payment Due', color: 'blue', icon: CheckCircle2, desc: 'Owner accepted! Please pay rent & deposit to confirm' },
  CONFIRMED: { label: 'Confirmed', color: 'blue', icon: CheckCircle2, desc: 'Booking confirmed' },
  PAID: { label: 'Paid (Escrow Secured)', color: 'emerald', icon: ShieldCheck, desc: 'Payment held safely in Escrow vault' },
  CHECKED_IN: { label: 'Checked In', color: 'purple', icon: Package, desc: 'Currently staying' },
  COMPLETED: { label: 'Completed', color: 'neutral', icon: CheckCircle2, desc: 'Stay completed' },
  REJECTED: { label: 'Rejected', color: 'rose', icon: XCircle, desc: 'Owner declined your request' },
  CANCELLED: { label: 'Cancelled', color: 'neutral', icon: X, desc: 'Booking was cancelled' },
};

export default function StudentBookings() {
  const { user, tokens, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<any | null>(null);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!tokens?.accessToken) { setLoading(false); return; }
    (async () => {
      try {
        const data = await apiGetMyBookings(tokens.accessToken);
        setBookings(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [tokens?.accessToken]);

  // Real-time listener for booking status changes & escrow confirmations
  useEffect(() => {
    const unsubscribe = subscribeToBookingUpdates((updatedBooking) => {
      setBookings((prev) => {
        const idx = prev.findIndex((b) => b.id === updatedBooking.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updatedBooking };
          return next;
        }
        return [updatedBooking, ...prev];
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!tokens?.accessToken || !confirm('Cancel this booking?')) return;
    setCancelId(bookingId);
    try {
      await apiCancelBooking(tokens.accessToken, bookingId, 'Cancelled by student');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      broadcastBookingUpdate({ id: bookingId, status: 'CANCELLED' });
    } catch (err: any) {
      alert(err.message);
    } finally { setCancelId(null); }
  };

  if (!user || !tokens) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <Home className="w-12 h-12 text-neutral-300" />
        <h2 className="text-xl font-bold text-neutral-900">Sign in to view your bookings</h2>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-full bg-[#FF385C] text-white font-bold text-sm hover:bg-[#E00B41] transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-neutral-900">My Bookings</h1>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Realtime Escrow
              </span>
            </div>
            <p className="text-sm text-neutral-500">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">No bookings yet</h3>
            <p className="text-sm text-neutral-500">Find a great student room and book it below.</p>
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-[#FF385C] text-white font-bold text-sm hover:bg-[#E00B41] transition"
            >
              Browse Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              const listing = booking.listing;
              const startDate = new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              const endDate = new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              const canCancel = ['PENDING', 'ACCEPTED'].includes(booking.status);

              return (
                <div key={booking.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {/* Photo */}
                    <div className="w-32 h-32 sm:w-40 sm:h-auto shrink-0 bg-neutral-100">
                      {listing?.photoUrls?.[0] ? (
                        <img src={listing.photoUrls[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-neutral-900">{listing?.title || 'Property'}</h3>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0
                          ${cfg.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                            cfg.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                            cfg.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            cfg.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                            cfg.color === 'rose' ? 'bg-rose-100 text-rose-700' :
                            'bg-neutral-100 text-neutral-600'}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{listing?.address || listing?.city}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{startDate} → {endDate}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-emerald-700">{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-neutral-400">total (incl. deposit)</span>
                      </div>

                      <p className="text-xs text-neutral-400 mt-1">{cfg.desc}</p>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {booking.status === 'ACCEPTED' && (
                          <button
                            onClick={() => setPaymentBooking(booking)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] text-white text-xs font-bold hover:opacity-95 shadow-xs transition"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Rent & Deposit (Razorpay)
                          </button>
                        )}

                        {(['COMPLETED', 'CHECKED_IN', 'PAID', 'CONFIRMED'].includes(booking.status)) && (
                          <button
                            onClick={() => setReviewBooking(booking)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-2xs ${
                              booking.reviewed
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${booking.reviewed ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-500 text-amber-500'}`} />
                            {booking.reviewed ? 'Review Submitted ✓' : 'Write Scholar Review'}
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelId === booking.id}
                            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold disabled:opacity-50"
                          >
                            {cancelId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Razorpay Escrow Payment Modal */}
      {paymentBooking && (
        <RazorpayCheckoutModal
          isOpen={Boolean(paymentBooking)}
          onClose={() => setPaymentBooking(null)}
          booking={{
            id: paymentBooking.id,
            listingId: paymentBooking.listingId,
            title: paymentBooking.listing?.title,
            address: paymentBooking.listing?.address,
            city: paymentBooking.listing?.city,
            startDate: new Date(paymentBooking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            endDate: new Date(paymentBooking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            totalAmount: paymentBooking.totalAmount,
            pricePerMonth: paymentBooking.listing?.pricePerMonth,
            securityDeposit: paymentBooking.listing?.securityDeposit,
          }}
          onPaymentSuccess={(bookingId) => {
            setBookings((prev) => {
              const updated = prev.map((b) => (b.id === bookingId ? { ...b, status: 'PAID' } : b));
              if (typeof window !== 'undefined') {
                localStorage.setItem('studentnest_demo_bookings', JSON.stringify(updated));
              }
              return updated;
            });
            broadcastBookingUpdate({ id: bookingId, status: 'PAID' });
          }}
        />
      )}

      {/* Student Review Submission Modal */}
      {reviewBooking && (
        <ReviewSubmissionModal
          isOpen={Boolean(reviewBooking)}
          onClose={() => setReviewBooking(null)}
          booking={{
            id: reviewBooking.id,
            listingId: reviewBooking.listingId,
            title: reviewBooking.listing?.title,
            startDate: new Date(reviewBooking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            endDate: new Date(reviewBooking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          }}
          onReviewSubmitted={(bookingId) => {
            setBookings((prev) => {
              const updated = prev.map((b) => (b.id === bookingId ? { ...b, reviewed: true } : b));
              if (typeof window !== 'undefined') {
                localStorage.setItem('studentnest_demo_bookings', JSON.stringify(updated));
              }
              return updated;
            });
            broadcastBookingUpdate({ id: bookingId, reviewed: true });
          }}
        />
      )}
    </div>
  );
}

