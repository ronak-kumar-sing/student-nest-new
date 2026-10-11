'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, GraduationCap, CheckCircle2, Sparkles, Building } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminPortalView from '@/components/admin/AdminPortalView';

export default function AdminPage() {
  const { user, loginAsDemoAdmin, openAuthModal } = useAuth();

  // If user is logged in as admin, show full Admin Moderation Portal
  if (user?.role === 'admin') {
    return <AdminPortalView />;
  }

  // Otherwise, render Access Portal with 1-click Demo Admin auth
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-neutral-800/80 backdrop-blur-md border border-neutral-700/80 rounded-3xl p-8 shadow-2xl text-center">
          {/* Badge & Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Admin Moderation Portal
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed mb-6">
            Authorized access only. Staff moderators verify host Aadhaar KYC, audit room ownership proofs, and protect student escrow deposits.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => loginAsDemoAdmin()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1-Click Authenticate as Demo Moderator</span>
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 rounded-xl border border-neutral-700 hover:bg-neutral-750 text-neutral-300 font-semibold text-xs transition"
            >
              Log in with Admin Credentials
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-700/50 text-[11px] text-neutral-400">
            <div className="font-semibold text-neutral-300 mb-1">Demo Credentials:</div>
            <div>Email: <span className="font-mono text-purple-300">admin@studentnest.demo</span></div>
            <div>Password: <span className="font-mono text-purple-300">AdminPassword123!</span></div>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
