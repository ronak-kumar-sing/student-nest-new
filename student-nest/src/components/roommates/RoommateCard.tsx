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
  Bed,
  Eye,
} from 'lucide-react';
import { apiConnectRoommate } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { broadcastRoommateConnect } from '@/lib/firebase';
import StudentRoomModal from './StudentRoomModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

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
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const name = profile?.fullName || student?.email?.split('@')[0] || 'Student';
  const college = profile?.collegeName || 'University Student';
  const avatar =
    profile?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const scoreColor =
    compatibilityPercent >= 80
      ? 'emerald'
      : compatibilityPercent >= 60
      ? 'blue'
      : compatibilityPercent >= 40
      ? 'amber'
      : 'rose';

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
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-neutral-200/90 flex flex-col justify-between">
      <div>
        {/* Score Header Accent */}
        <div
          className={`h-2 ${
            scoreColor === 'emerald'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
              : scoreColor === 'blue'
              ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
              : scoreColor === 'amber'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
              : 'bg-gradient-to-r from-rose-400 to-pink-500'
          }`}
        />

        <CardContent className="p-5">
          {/* Avatar & Name */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 rounded-2xl">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{name[0]?.toUpperCase() || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">{name}</h3>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[140px]">{college}</span>
                </div>
              </div>
            </div>

            {/* Score Badge */}
            <div
              className={`text-center shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${
                scoreColor === 'emerald'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : scoreColor === 'blue'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : scoreColor === 'amber'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className="text-lg font-black leading-none">{compatibilityPercent}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Match</span>
            </div>
          </div>

          {/* Location & Budget */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{request.city}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <IndianRupee className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>
                ₹{request.budgetMin?.toLocaleString('en-IN')} – ₹{request.budgetMax?.toLocaleString('en-IN')}/mo
              </span>
            </div>
            {request.bio && (
              <p className="text-xs text-neutral-500 line-clamp-2 italic pt-1">
                &ldquo;{request.bio}&rdquo;
              </p>
            )}
          </div>

          {/* STUDENT'S ROOM PREVIEW CARD (IF HAS ROOM) */}
          {request.hasRoom && request.room ? (
            <div className="mb-4 bg-gradient-to-br from-violet-50/90 to-purple-50/50 rounded-2xl p-3 border border-violet-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="violet" className="gap-1 px-2.5 py-0.5">
                  <Bed className="w-3 h-3" /> Room Available
                </Badge>
                <span className="text-xs font-black text-neutral-900">
                  {request.room.currency || (request.room.rentShare > 4000 ? '₹' : '$')}
                  {request.room.rentShare?.toLocaleString()}
                  <span className="text-[10px] font-normal text-neutral-500">/mo</span>
                </span>
              </div>

              {/* Room thumbnail */}
              <div className="relative w-full h-24 rounded-xl overflow-hidden bg-neutral-100 group/img">
                <img
                  src={
                    request.room.images?.[0] ||
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80'
                  }
                  alt={request.room.title}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2 text-white text-[11px] font-bold line-clamp-1">
                  {request.room.title}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-0.5">
                <span className="truncate max-w-[140px] text-neutral-500">{request.room.roomType}</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsRoomModalOpen(true)}
                  className="h-auto p-0 text-violet-700 font-bold hover:underline flex items-center gap-1 shrink-0"
                >
                  <Eye className="w-3 h-3" /> View Room Details
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1.5">
              <span>🔍</span>
              <span>Looking to team up &amp; find a flat together</span>
            </div>
          )}

          {/* Match Tags (Shadcn Badges) */}
          {matchTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {matchTags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="font-medium text-[11px]">
                  ✓ {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Lifestyle Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2 text-[11px]">
            <Badge variant="blue" className="font-normal text-[10px]">
              {request.sleepHabit === 'EARLY_BIRD'
                ? '🌅 Early Bird'
                : request.sleepHabit === 'NIGHT_OWL'
                ? '🦉 Night Owl'
                : '🌙 Normal Schedule'}
            </Badge>
            <Badge variant="emerald" className="font-normal text-[10px]">
              {request.smokingPreference === 'NON_SMOKER' ? '🚭 Non-Smoker' : '🚬 Smoker'}
            </Badge>
            <Badge variant="violet" className="font-normal text-[10px]">
              {request.studyEnvironment === 'QUIET' ? '🤫 Quiet Study' : '🎵 Flexible'}
            </Badge>
            <Badge variant="amber" className="font-normal text-[10px]">
              {request.foodPreference === 'VEG'
                ? '🥗 Veg'
                : request.foodPreference === 'NON_VEG'
                ? '🍗 Non-Veg'
                : request.foodPreference === 'VEGAN'
                ? '🌿 Vegan'
                : '😋 Any Food'}
            </Badge>
          </div>
        </CardContent>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0">
        {status === 'sent' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connection Sent!
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                openChat(undefined, undefined, {
                  partnerId: student?.id || match.request.id,
                  partnerName: name,
                  partnerRole: 'student',
                  partnerAvatar: avatar,
                  initialMessage:
                    message.trim() ||
                    `Hi ${name}! We matched on StudentNest with ${compatibilityPercent}% compatibility.`,
                });
              }}
              className="w-full h-9 rounded-xl"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Open Direct Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {showMsg && (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Add a message (optional)..."
                className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30"
              />
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  openChat(undefined, undefined, {
                    partnerId: student?.id || match.request.id,
                    partnerName: name,
                    partnerRole: 'student',
                    partnerAvatar: avatar,
                    initialMessage:
                      message.trim() ||
                      `Hi ${name}! We matched on StudentNest with ${compatibilityPercent}% compatibility.`,
                  });
                }}
                title="Open Direct Chat"
                className="rounded-xl shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-violet-600" />
              </Button>

              <Button
                variant="coral"
                onClick={handleConnect}
                disabled={status === 'loading'}
                className="flex-1 rounded-xl font-bold"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4" /> Connect
                  </>
                )}
              </Button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-rose-600 text-center">Already sent or error occurred</p>
            )}
          </div>
        )}
      </div>

      {/* STUDENT ROOM DETAIL MODAL */}
      {request.hasRoom && request.room && (
        <StudentRoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          room={request.room}
          student={{
            id: student?.id || request.id,
            name,
            college,
            avatar,
            compatibilityPercent,
            bio: request.bio,
          }}
          onConnect={handleConnect}
          isConnectSent={status === 'sent'}
        />
      )}
    </Card>
  );
}
