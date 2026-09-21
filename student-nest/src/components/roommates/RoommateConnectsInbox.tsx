'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Sparkles,
  GraduationCap,
  MapPin,
  IndianRupee,
  Check,
  X,
  Loader2,
  Inbox,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import {
  apiGetIncomingConnects,
  apiRespondToConnect,
  RoommateConnectItem,
} from '@/lib/api';
import { subscribeToRoommateConnects, broadcastRoommateConnect } from '@/lib/firebase';

export default function RoommateConnectsInbox() {
  const { tokens } = useAuth();
  const { openChat } = useChat();
  const [connects, setConnects] = useState<RoommateConnectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadConnects = async () => {
    try {
      const token = tokens?.accessToken || 'demo-token';
      const data = await apiGetIncomingConnects(token);
      setConnects(data);
    } catch (err: any) {
      console.warn('Error loading connects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnects();
  }, [tokens?.accessToken]);

  // Real-time listener for incoming connection requests & acceptance
  useEffect(() => {
    const unsubscribe = subscribeToRoommateConnects((updated) => {
      setConnects((prev) => {
        const idx = prev.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return [updated, ...prev];
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRespond = async (connectId: string, accept: boolean) => {
    setActionLoadingId(connectId);
    try {
      const token = tokens?.accessToken || 'demo-token';
      await apiRespondToConnect(token, connectId, accept);
      setConnects((prev) =>
        prev.map((c) => (c.id === connectId ? { ...c, status: accept ? 'ACCEPTED' : 'DECLINED' } : c)),
      );
      broadcastRoommateConnect({ id: connectId, status: accept ? 'ACCEPTED' : 'DECLINED' });
    } catch (err: any) {
      alert(err.message || 'Failed to update connection request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingList = connects.filter((c) => c.status === 'PENDING');
  const acceptedList = connects.filter((c) => c.status === 'ACCEPTED');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <p className="text-xs text-neutral-500 font-medium">Loading connection requests...</p>
      </div>
    );
  }

  if (connects.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">No connection requests yet</h3>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
          When students match with your profile from the compatibility quiz and send connection requests, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-200">
              Student Connects Inbox
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Firebase Realtime
            </span>
          </div>
          <h2 className="text-xl font-black mt-0.5">Roommate Inquiries</h2>
          <p className="text-xs text-violet-100/80 mt-1">
            Accept requests to unlock direct messaging and co-lease planning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-2xl font-black">{pendingList.length}</div>
            <div className="text-[10px] uppercase font-bold text-violet-200">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-2xl font-black">{acceptedList.length}</div>
            <div className="text-[10px] uppercase font-bold text-emerald-200">Connected</div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {connects.map((conn) => {
          const req = conn.fromRequest;
          const student = req.student;
          const profile = student.studentProfile;
          const isPending = conn.status === 'PENDING';
          const isAccepted = conn.status === 'ACCEPTED';
          const isDeclined = conn.status === 'DECLINED';
          const isCurrentAction = actionLoadingId === conn.id;

          const studentName = profile?.fullName || student.email.split('@')[0];
          const studentAvatar =
            profile?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

          return (
            <div
              key={conn.id}
              className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                {/* Student Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden relative shrink-0 border border-neutral-200">
                    <img
                      src={studentAvatar}
                      alt={studentName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-neutral-900">{studentName}</h3>
                      {profile?.collegeName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                          <GraduationCap className="w-3 h-3" />
                          {profile.collegeName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{req.city}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-neutral-800">
                          ₹{req.budgetMin?.toLocaleString('en-IN')} – ₹{req.budgetMax?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-neutral-400">/mo</span>
                      </div>
                    </div>

                    {/* Compatibility Tags */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {req.sleepSchedule.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {req.dietary}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        Cleanliness: {req.cleanliness}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge (Top-Right on Desktop) */}
                <div>
                  {isPending && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Pending Approval
                    </span>
                  )}
                  {isAccepted && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Connected Roommate
                    </span>
                  )}
                  {isDeclined && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                      Declined
                    </span>
                  )}
                </div>
              </div>

              {/* Message Note */}
              {conn.message && (
                <div className="mt-4 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Personal Intro Note
                  </div>
                  &ldquo;{conn.message}&rdquo;
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-neutral-400">
                  Received {new Date(conn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleRespond(conn.id, false)}
                        disabled={isCurrentAction}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-600 transition disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>

                      <button
                        onClick={() => handleRespond(conn.id, true)}
                        disabled={isCurrentAction}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                      >
                        {isCurrentAction ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Accept Connection
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() =>
                        openChat(undefined, undefined, {
                          partnerId: student.id,
                          partnerName: studentName,
                          partnerAvatar: studentAvatar,
                          partnerRole: 'student',
                          initialMessage: `Hi ${studentName}! I accepted your roommate connection request on StudentNest. Let's chat!`,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Open Direct Chat
                    </button>
                  )}

                  {isDeclined && (
                    <button
                      onClick={() => handleRespond(conn.id, true)}
                      className="text-xs text-neutral-400 hover:text-neutral-700 underline font-medium"
                    >
                      Undo & Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
