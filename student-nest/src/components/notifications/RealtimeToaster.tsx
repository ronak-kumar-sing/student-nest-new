'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Users,
  X,
  Sparkles,
  ArrowRight,
  Home,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface ToastNotification {
  id: string;
  type: 'CHAT' | 'BOOKING' | 'ROOMMATE' | 'MODERATION';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
}

export default function RealtimeToaster() {
  const { openChat } = useChat();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep at most 4 toasts

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen to custom window events emitted by firebase.ts
    const handleChat = (e: any) => {
      const msg = e.detail;
      if (!msg) return;
      addToast({
        type: 'CHAT',
        title: `Message from ${msg.senderName || 'Host'}`,
        message: msg.text?.slice(0, 75) + (msg.text?.length > 75 ? '...' : ''),
        actionLabel: 'Open Chat',
        onAction: () => openChat(),
      });
    };

    const handleBooking = (e: any) => {
      const bk = e.detail;
      if (!bk) return;
      if (bk.status === 'ACCEPTED') {
        addToast({
          type: 'BOOKING',
          title: 'Booking Accepted! 🎉',
          message: 'Your stay request has been accepted. Pay rent & deposit to secure.',
          actionLabel: 'Pay Deposit',
          actionUrl: '/bookings',
        });
      } else if (bk.status === 'PAID') {
        addToast({
          type: 'BOOKING',
          title: 'Escrow Vault Secured 🛡️',
          message: 'Payment received and held safely in StudentNest Escrow.',
          actionLabel: 'View Booking',
          actionUrl: '/bookings',
        });
      } else if (bk.status === 'PENDING') {
        addToast({
          type: 'BOOKING',
          title: 'New Booking Inquiry 📋',
          message: 'A student has submitted a new reservation request.',
          actionLabel: 'View Dashboard',
          actionUrl: '/dashboard',
        });
      }
    };

    const handleRoommate = (e: any) => {
      const conn = e.detail;
      if (!conn) return;
      if (conn.status === 'PENDING') {
        addToast({
          type: 'ROOMMATE',
          title: 'New Roommate Request 🤝',
          message: 'A matched student wants to connect with your profile!',
          actionLabel: 'View Connects',
          actionUrl: '/roommates',
        });
      } else if (conn.status === 'ACCEPTED') {
        addToast({
          type: 'ROOMMATE',
          title: 'Roommate Connected! 💬',
          message: 'Connection accepted. Direct messaging is now unlocked.',
          actionLabel: 'Open Messages',
          onAction: () => openChat(),
        });
      }
    };

    window.addEventListener('firebase_stream_CHAT_MESSAGE', handleChat);
    window.addEventListener('firebase_stream_BOOKING_UPDATE', handleBooking);
    window.addEventListener('firebase_stream_ROOMMATE_CONNECT', handleRoommate);

    return () => {
      window.removeEventListener('firebase_stream_CHAT_MESSAGE', handleChat);
      window.removeEventListener('firebase_stream_BOOKING_UPDATE', handleBooking);
      window.removeEventListener('firebase_stream_ROOMMATE_CONNECT', handleRoommate);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isChat = toast.type === 'CHAT';
        const isBooking = toast.type === 'BOOKING';
        const isRoommate = toast.type === 'ROOMMATE';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-neutral-900/95 text-white backdrop-blur-md border border-neutral-700/80 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-3 duration-300 transition-all flex items-start gap-3"
          >
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isChat
                  ? 'bg-[#FF385C]/20 text-[#FF385C]'
                  : isBooking
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isRoommate
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {isChat && <MessageSquare className="w-4 h-4" />}
              {isBooking && <ShieldCheck className="w-4 h-4" />}
              {isRoommate && <Users className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
                <span className="text-[10px] text-neutral-400 shrink-0">{toast.timestamp}</span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>

              {/* Action Button */}
              {toast.actionUrl ? (
                <Link
                  href={toast.actionUrl}
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF385C] hover:text-[#ff5273] mt-2 group"
                >
                  <span>{toast.actionLabel || 'View details'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : toast.onAction ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF385C] hover:text-[#ff5273] mt-2 group"
                >
                  <span>{toast.actionLabel || 'Open'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : null}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
