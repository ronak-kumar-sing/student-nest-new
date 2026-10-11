'use client';

import React, { useState } from 'react';
import {
  Video,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  User,
  ShieldCheck,
  Building,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';

interface ScheduleTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    address?: string;
    city?: string;
    hostName?: string;
    hostAvatar?: string;
  };
}

const TIME_SLOTS = [
  '10:00 AM - 10:30 AM',
  '11:30 AM - 12:00 PM',
  '02:00 PM - 02:30 PM',
  '04:00 PM - 04:30 PM',
  '06:00 PM - 06:30 PM',
];

export default function ScheduleTourModal({
  isOpen,
  onClose,
  listing,
}: ScheduleTourModalProps) {
  const { user, openAuthModal } = useAuth();
  const { openChat, sendMessage } = useChat();

  const [tourType, setTourType] = useState<'virtual' | 'in_person'>('virtual');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [note, setNote] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const meetCode = `nest-${listing.id.slice(-4)}-${Date.now().toString().slice(-4)}`;
  const meetUrl = `https://meet.google.com/${meetCode}`;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    setScheduled(true);

    // Send automated greeting / invite into chat thread
    const inviteText = tourType === 'virtual'
      ? `Hi ${listing.hostName || 'Host'}, I've scheduled a Google Meet Virtual Tour for "${listing.title}" on ${selectedDate} at ${selectedSlot}. Meeting Link: ${meetUrl}${note ? ` Note: "${note}"` : ''}`
      : `Hi ${listing.hostName || 'Host'}, I've scheduled an In-Person Campus Walkthrough for "${listing.title}" on ${selectedDate} at ${selectedSlot}.${note ? ` Note: "${note}"` : ''}`;

    try {
      sendMessage(inviteText);
    } catch {
      // safe fallback
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(meetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-neutral-100/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                Schedule Tour & Walkthrough
              </h3>
              <p className="text-[11px] text-neutral-500">
                Explore the property virtually or visit in person
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200/80 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {scheduled ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tour Confirmed
                </span>
                <h4 className="text-xl font-black text-neutral-900">
                  {tourType === 'virtual' ? 'Google Meet Tour Booked!' : 'Campus Visit Scheduled!'}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Host <strong>{listing.hostName || 'Eleanor Vance'}</strong> has been notified in real time via Scholar Messages.
                </p>
              </div>

              {/* Pass Card */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Date & Time:</span>
                  <span className="font-bold text-neutral-900">{selectedDate} • {selectedSlot}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Property:</span>
                  <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{listing.title}</span>
                </div>

                {tourType === 'virtual' ? (
                  <div className="pt-2 border-t border-neutral-200 mt-2">
                    <span className="text-[11px] font-bold text-neutral-600 block mb-1">
                      Google Meet Link:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={meetUrl}
                        className="flex-1 text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono text-purple-700 select-all"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-neutral-200 mt-2 flex items-center gap-2 text-xs text-neutral-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Meet at main lobby: <strong>{listing.address || listing.city}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    openChat();
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs transition shadow-xs"
                >
                  Open Direct Chat with Host
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              {/* Tour Mode Tabs */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Select Tour Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTourType('virtual')}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all ${
                      tourType === 'virtual'
                        ? 'border-purple-600 bg-purple-50/60 text-purple-900 font-bold shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Google Meet Tour</div>
                      <div className="text-[10px] text-neutral-500">Live 1-on-1 video call</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTourType('in_person')}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all ${
                      tourType === 'in_person'
                        ? 'border-purple-600 bg-purple-50/60 text-purple-900 font-bold shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">In-Person Visit</div>
                      <div className="text-[10px] text-neutral-500">Physical walkthrough</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Preferred Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Available Time Slot (IST)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-xl text-xs text-left border transition-all ${
                        selectedSlot === slot
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-2xs'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Note */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Note for Host (Optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ask about study desk dimensions, noise levels, move-in flexibility..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Verified Scholar Trust Notice */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2.5 text-xs text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  Tours are 100% free with no deposit required. Hosts verify appointments within 4 business hours.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-98"
              >
                Confirm {tourType === 'virtual' ? 'Google Meet Video Tour' : 'Campus Visit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
