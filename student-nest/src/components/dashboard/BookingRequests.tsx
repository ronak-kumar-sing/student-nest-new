'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  IndianRupee,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGetMyBookings, apiAcceptBooking, apiRejectBooking } from '@/lib/api';
import { subscribeToBookingUpdates, broadcastBookingUpdate } from '@/lib/firebase';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CHECKED_IN: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-neutral-100 text-neutral-600',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-neutral-100 text-neutral-500',
};

export default function BookingRequests() {
  const { tokens } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    if (!tokens?.accessToken) return;
    setLoading(true);
    try {
      const data = await apiGetMyBookings(tokens.accessToken);
      setBookings(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tokens?.accessToken]);

  // Real-time listener for incoming student reservation requests & payments
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

  const handleAccept = async (bookingId: string) => {
    if (!tokens?.accessToken) return;
    setActionId(bookingId);
    try {
      await apiAcceptBooking(tokens.accessToken, bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'ACCEPTED' } : b));
      broadcastBookingUpdate({ id: bookingId, status: 'ACCEPTED' });
    } catch (err: any) {
      alert(err.message);
    } finally { setActionId(null); }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Reason for rejection (optional):') ?? undefined;
    if (!tokens?.accessToken) return;
    setActionId(bookingId);
    try {
      await apiRejectBooking(tokens.accessToken, bookingId, reason);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'REJECTED' } : b));
      broadcastBookingUpdate({ id: bookingId, status: 'REJECTED' });
    } catch (err: any) {
      alert(err.message);
    } finally { setActionId(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="font-bold text-neutral-900">No booking requests yet</p>
        <p className="text-sm text-neutral-500">Requests will appear here when students book your properties.</p>
      </div>
    );
  }

  const pending = bookings.filter(b => b.status === 'PENDING');
  const others = bookings.filter(b => b.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Awaiting Your Response ({pending.length})
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Live Feed
            </span>
          </div>
          <div className="space-y-3">
            {pending.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isOwnerView
                onAccept={() => handleAccept(booking.id)}
                onReject={() => handleReject(booking.id)}
                actionId={actionId}
              />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
            History ({others.length})
          </h3>
          <div className="space-y-3">
            {others.map(booking => (
              <BookingCard key={booking.id} booking={booking} isOwnerView />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  isOwnerView,
  onAccept,
  onReject,
  actionId,
}: {
  booking: any;
  isOwnerView?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  actionId?: string | null;
}) {
  const student = booking.student;
  const profile = student?.studentProfile;
  const listing = booking.listing;
  const isLoading = actionId === booking.id;

  const startDate = new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDate = new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="border border-neutral-200 rounded-2xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          {isOwnerView && student && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {(profile?.fullName || student.email || 'S')[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900">{profile?.fullName || 'Student'}</div>
                <div className="text-xs text-neutral-400">{student.email}</div>
              </div>
            </div>
          )}
          <div className="text-sm font-semibold text-neutral-800">{listing?.title}</div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
            <Calendar className="w-3 h-3" />
            {startDate} → {endDate}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <IndianRupee className="w-3 h-3 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">{booking.totalAmount?.toLocaleString('en-IN')}</span>
            <span className="text-xs text-neutral-400">total</span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[booking.status] || 'bg-neutral-100 text-neutral-600'}`}>
          {booking.status}
        </span>
      </div>

      {booking.status === 'PENDING' && isOwnerView && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Accept
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline
          </button>
        </div>
      )}

      {booking.status === 'ACCEPTED' && isOwnerView && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-800 font-semibold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Accepted · Awaiting Student Payment</span>
          </div>
          <span className="text-[11px] text-blue-600">Razorpay Invoice Active</span>
        </div>
      )}

      {booking.status === 'PAID' && isOwnerView && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Payment Secured in Escrow</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">Auto-payout 24h after check-in</span>
        </div>
      )}
    </div>
  );
}
