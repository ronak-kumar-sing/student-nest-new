'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Send,
  Sparkles,
  MessageSquare,
  Home,
  CheckCheck,
  Building,
  GraduationCap,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export default function StudentNestChatDrawer() {
  const {
    threads,
    activeThread,
    activeMessages,
    isChatOpen,
    closeChat,
    selectThread,
    sendMessage,
    isFirebaseConnected,
  } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  if (!isChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const quickPrompts = [
    'Is this studio available for Fall 2026?',
    'Can I schedule a quick video tour?',
    'Are heating and 1Gbps WiFi included in the monthly rent?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF385C]/10 text-[#FF385C] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span>
                  {user?.role === 'owner' ? 'Host & Landlord Inbox' : user?.role === 'admin' ? 'Admin Direct Dispatch' : 'Scholar Messages'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isFirebaseConnected ? 'Firebase Live' : 'Realtime Sync'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500">
                Logged in as <strong className="text-neutral-800">{user?.name || 'Julian Chen'}</strong> ({user?.role || 'student'})
              </div>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Threads Tabs */}
        <div className="flex gap-2 p-3 bg-neutral-100/70 border-b border-neutral-200 overflow-x-auto no-scrollbar">
          {threads.map((t) => {
            const isSelected = activeThread?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-white text-neutral-900 shadow-xs border-neutral-300 font-bold'
                    : 'bg-transparent text-neutral-600 border-transparent hover:bg-white/60'
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                  <Image src={t.partnerAvatar} alt={t.partnerName} fill className="object-cover" />
                </div>
                <span>{t.partnerName}</span>
                {t.unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#FF385C] text-white text-[9px] flex items-center justify-center font-bold">
                    {t.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Property Context Banner */}
        {activeThread && (
          <div className="px-6 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-700 truncate">
              <Home className="w-4 h-4 text-neutral-500 shrink-0" />
              <span className="font-semibold text-neutral-900 truncate">
                {activeThread.propertyTitle}
              </span>
            </div>
            {activeThread.propertyPrice !== undefined && (
              <span className="font-bold text-neutral-900 shrink-0 ml-2">
                ₹{activeThread.propertyPrice.toLocaleString('en-IN')}/mo
              </span>
            )}
          </div>
        )}

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <div className="text-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600">
              <Sparkles className="w-3 h-3 text-[#FF385C]" />
              <span>Encrypted student & host messaging • Free live sync</span>
            </div>
          </div>

          {activeMessages.map((msg) => {
            // In a 1-on-1 thread, if msg.senderId matches activeThread.partnerId, it is from the other person (partner).
            // Any other message was sent by the current user, preventing sender inversion on page reload.
            const isFromPartner = Boolean(activeThread?.partnerId && msg.senderId === activeThread.partnerId);
            const isMe = !isFromPartner;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="text-[10px] text-neutral-400 font-medium px-1 flex items-center gap-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#FF385C] text-white rounded-br-xs shadow-xs'
                      : 'bg-neutral-100 text-neutral-900 rounded-bl-xs border border-neutral-200/60'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-neutral-50/50 border-t border-neutral-100 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-4 border-t border-neutral-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${activeThread?.partnerName || 'Host'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900 bg-neutral-50/60 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
