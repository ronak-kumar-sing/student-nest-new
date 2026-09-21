'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  MapPin,
  IndianRupee,
  Heart,
  MessageCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiConnectRoommate } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { broadcastRoommateConnect } from '@/lib/firebase';

interface RoommateCardProps {
  match: {
    request: any;
    compatibilityPercent: number;
    matchTags: string[];
  };
}

export default function RoommateCard({ match }: RoommateCardProps) {
  const { tokens } = useAuth();
  const { openChat } = useChat();
  const { request, compatibilityPercent, matchTags } = match;
  const student = request.student;
  const profile = student?.studentProfile;
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showMsg, setShowMsg] = useState(false);

  const name = profile?.fullName || student?.email?.split('@')[0] || 'Student';
  const college = profile?.collegeName || 'University Student';

  const scoreColor =
    compatibilityPercent >= 80 ? 'emerald' :
    compatibilityPercent >= 60 ? 'blue' :
    compatibilityPercent >= 40 ? 'amber' : 'rose';

  const handleConnect = async () => {
    if (!tokens?.accessToken) return;
    setStatus('loading');
    try {
      await apiConnectRoommate(tokens.accessToken, request.id, message || undefined);
      setStatus('sent');
      broadcastRoommateConnect({
        id: `conn_${Date.now()}`,
        fromRequestId: request.id,
        toRequestId: 'target-request',
        status: 'PENDING',
        message: message || undefined,
        fromRequest: request,
      });
    } catch (err: any) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Score Header */}
      <div className={`h-2 ${
        scoreColor === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
        scoreColor === 'blue' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
        scoreColor === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
        'bg-gradient-to-r from-rose-400 to-pink-500'
      }`} />

      <div className="p-5">
        {/* Avatar & Name */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black
              ${scoreColor === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                scoreColor === 'blue' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                scoreColor === 'amber' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                'bg-gradient-to-br from-rose-400 to-pink-500'}`}
            >
              {name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">{name}</h3>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <GraduationCap className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{college}</span>
              </div>
            </div>
          </div>

          {/* Score Badge */}
          <div className={`text-center shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center
            ${scoreColor === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
              scoreColor === 'blue' ? 'bg-blue-50 text-blue-700' :
              scoreColor === 'amber' ? 'bg-amber-50 text-amber-700' :
              'bg-rose-50 text-rose-700'}`}
          >
            <span className="text-xl font-black">{compatibilityPercent}%</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">Match</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{request.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <IndianRupee className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>₹{request.budgetMin?.toLocaleString('en-IN')} – ₹{request.budgetMax?.toLocaleString('en-IN')}/mo</span>
          </div>
          {request.bio && (
            <p className="text-xs text-neutral-500 line-clamp-2 italic">"{request.bio}"</p>
          )}
        </div>

        {/* Match Tags */}
        {matchTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {matchTags.slice(0, 4).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full font-medium">
                ✓ {tag}
              </span>
            ))}
          </div>
        )}

        {/* Lifestyle Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {request.sleepHabit === 'EARLY_BIRD' ? '🌅 Early Bird' :
             request.sleepHabit === 'NIGHT_OWL' ? '🦉 Night Owl' : '🌙 Normal Schedule'}
          </span>
          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            {request.smokingPreference === 'NON_SMOKER' ? '🚭 Non-Smoker' : '🚬 Smoker'}
          </span>
          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            {request.studyEnvironment === 'QUIET' ? '🤫 Quiet Study' : '🎵 Flexible'}
          </span>
          <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
            {request.foodPreference === 'VEG' ? '🥗 Veg' :
             request.foodPreference === 'NON_VEG' ? '🍗 Non-Veg' :
             request.foodPreference === 'VEGAN' ? '🌿 Vegan' : '😋 Any Food'}
          </span>
        </div>

        {/* Connect & Chat Buttons */}
        {status === 'sent' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connection Sent!
            </div>
            <button
              onClick={() => {
                openChat(undefined, undefined, {
                  partnerId: student?.id || match.request.id,
                  partnerName: name,
                  partnerRole: 'student',
                  partnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                  initialMessage: message.trim() || `Hi ${name}! We matched on StudentNest with ${compatibilityPercent}% compatibility.`,
                });
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-black transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Open Direct Chat
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {showMsg && (
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="Add a message (optional)..."
                className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  openChat(undefined, undefined, {
                    partnerId: student?.id || match.request.id,
                    partnerName: name,
                    partnerRole: 'student',
                    partnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                    initialMessage: message.trim() || `Hi ${name}! We matched on StudentNest with ${compatibilityPercent}% compatibility.`,
                  });
                }}
                title="Open Direct Chat"
                className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-[#FF385C] hover:border-[#FF385C]/40 hover:bg-neutral-50 transition"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleConnect}
                disabled={status === 'loading'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FF385C] text-white text-sm font-bold hover:bg-[#E00B41] disabled:opacity-60 transition"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Heart className="w-4 h-4" /> Connect</>
                )}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-rose-600 text-center">Already sent or error occurred</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
