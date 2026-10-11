'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Globe,
  Menu,
  User,
  Sparkles,
  Building,
  ShieldCheck,
  MessageSquare,
  ArrowRightLeft,
  LogOut,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  Users,
  Heart,
} from 'lucide-react';
import StudentNestSearchWidget from './StudentNestSearchWidget';
import { SearchFilters } from '@/types/listing';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useWishlist } from '@/context/WishlistContext';
import RealtimeToaster from '@/components/notifications/RealtimeToaster';

interface Props {
  onSearch: (filters: SearchFilters) => void;
  activeFilters: SearchFilters;
}

export default function StudentNestHeader({ onSearch, activeFilters }: Props) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    openAuthModal,
    logout,
    switchRole,
    verification,
    loginAsDemoStudent,
    loginAsDemoOwner,
    loginAsDemoAdmin,
  } = useAuth();
  const { totalUnread, openChat } = useChat();
  const { wishlistCount } = useWishlist();


  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 border-b border-neutral-200/80 backdrop-blur-md transition-all">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 h-20 flex items-center justify-between gap-4">
          {/* LOGO (LEFT) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF385C] to-[#E00B41] flex items-center justify-center text-white shadow-md shadow-[#FF385C]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#FF385C] flex items-center gap-0.5">
                student<span className="text-neutral-900">nest</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide -mt-1">
                Verified Student Stays
              </span>
            </div>
          </Link>

          {/* EXPANDABLE SEARCH PILL (CENTER) */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center divide-x divide-neutral-200 border border-neutral-300 hover:border-neutral-400/80 rounded-full py-2 px-4 shadow-studentnest-pill hover:shadow-studentnest-pill-hover cursor-pointer transition-all max-w-lg w-full sm:w-auto"
          >
            <button className="px-3 text-sm font-semibold text-neutral-900 truncate">
              {activeFilters.location || 'Any campus'}
            </button>
            <button className="px-3 text-sm font-semibold text-neutral-900 truncate hidden sm:block">
              {activeFilters.checkIn || 'Any semester'}
            </button>
            <div className="pl-3 flex items-center gap-3 text-sm text-neutral-500">
              <span className="truncate hidden md:block">
                {activeFilters.guests ? `${activeFilters.guests} guests` : 'Add guests'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center shrink-0">
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* USER & HOST CONTROLS (RIGHT) */}
          <div className="flex items-center gap-2.5 shrink-0 relative">
            {/* MESSAGES BUTTON */}
            <button
              onClick={() => openChat()}
              className="flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-full hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors relative"
              title="Open Messages"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Messages</span>
              {totalUnread > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FF385C] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalUnread}
                </span>
              )}
            </button>

            {/* ROLE-BASED NAVIGATION LINKS */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200/80 text-xs font-bold text-purple-800 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Admin Portal
              </Link>
            )}
            {user?.role === 'owner' && (
              <Link
                href="/dashboard"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-xs font-semibold text-neutral-800 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
                Dashboard
              </Link>
            )}
            {user?.role === 'student' && (
              <Link
                href="/bookings"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-xs font-semibold text-neutral-800 transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-neutral-500" />
                My Bookings
              </Link>
            )}

            <Link
              href="/roommates"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 text-xs font-bold text-violet-700 transition-colors border border-violet-200/60 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-violet-600" />
              <span>Room Partner</span>
            </Link>

            <Link
              href="/wishlists"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-[#FF385C] fill-[#FF385C]" />
              <span>Wishlists</span>
              {wishlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#FF385C] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 1-Click Dedicated Demo Switcher Pill */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-neutral-100/90 rounded-full border border-neutral-200/80 shadow-xs">
              <button
                onClick={loginAsDemoStudent}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  user?.email === 'student@studentnest.demo'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-white hover:text-neutral-900'
                }`}
                title="Student Demo (Julian Chen)"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Demo</span>
              </button>

              <button
                onClick={loginAsDemoOwner}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  user?.email === 'owner@studentnest.demo'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-white hover:text-neutral-900'
                }`}
                title="Owner Demo (Eleanor Vance)"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Owner Demo</span>
              </button>

              <button
                onClick={loginAsDemoAdmin}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  user?.email === 'admin@studentnest.demo'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-white hover:text-neutral-900'
                }`}
                title="Admin Demo (Chief Moderator)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            <button
              className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors hidden sm:block"
              aria-label="Language selector"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* USER PROFILE PILL */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 border border-neutral-300 hover:shadow-md rounded-full py-1.5 pl-3.5 pr-1.5 transition-all text-neutral-600 bg-white"
              >
                <Menu className="w-4 h-4" />
                {user ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-neutral-200">
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* DROPDOWN MENU */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-neutral-200 py-3 text-sm z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user ? (
                    <>
                      {/* USER INFO HEADER */}
                      <div className="px-5 py-3 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 truncate">{user.name}</span>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-[#FF385C]/10 text-[#FF385C]">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 truncate mt-0.5">{user.email}</div>
                      </div>

                      {/* VERIFICATION BADGES */}
                      <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Verification Status
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Email Verification</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> SendGrid Verified
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Phone Verification</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Twilio Verified
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Aadhaar / Govt ID</span>
                          {verification?.aadhaarVerified ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> DigiLocker Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => openAuthModal('aadhaar_verify')}
                              className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 text-[11px] underline"
                            >
                              <Clock className="w-3 h-3" /> {verification?.aadhaarStatus === 'skipped' ? 'Skipped (Verify)' : 'Verify Demo'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <button
                        onClick={() => openChat()}
                        className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 font-medium text-neutral-800 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-neutral-500" />
                          Messages
                        </span>
                        {totalUnread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#FF385C] text-white text-xs font-bold flex items-center justify-center">
                            {totalUnread}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={switchRole}
                        className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-neutral-800 flex items-center gap-2 transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-neutral-500" />
                        Switch to {user.role === 'student' ? 'Host Mode' : 'Scholar Mode'}
                      </button>

                      <Link
                        href="/admin"
                        className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-purple-800 flex items-center gap-2 transition-colors font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Moderation Portal
                      </Link>

                      {user.role === 'owner' && (
                        <Link
                          href="/dashboard"
                          className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-neutral-800 flex items-center gap-2 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                          Host Dashboard
                        </Link>
                      )}

                      {user.role === 'student' && (
                        <>
                          <Link
                            href="/bookings"
                            className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-neutral-800 flex items-center gap-2 transition-colors"
                          >
                            <CalendarCheck className="w-4 h-4 text-neutral-500" />
                            My Bookings
                          </Link>
                          <Link
                            href="/roommates"
                            className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-violet-700 flex items-center gap-2 transition-colors font-semibold"
                          >
                            <Users className="w-4 h-4 text-violet-500" />
                            Find Roommate
                          </Link>
                        </>
                      )}
                      <Link
                        href="/wishlists"
                        className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-neutral-800 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-[#FF385C]" />
                          Saved Wishlists
                        </span>
                        {wishlistCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF385C]/10 text-[#FF385C]">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={() => openAuthModal('aadhaar_verify')}
                        className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-neutral-800 flex items-center gap-2 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-neutral-500" />
                        Aadhaar e-KYC Verification
                      </button>

                      {/* 1-Click Switch Account Section */}
                      <div className="px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/70">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                          Switch Dedicated Account
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                          <button
                            onClick={loginAsDemoStudent}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              user?.email === 'student@studentnest.demo'
                                ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-700'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">Student</div>
                            <div className="text-[9px] text-neutral-500 truncate">Julian Chen</div>
                          </button>
                          <button
                            onClick={loginAsDemoOwner}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              user?.email === 'owner@studentnest.demo'
                                ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-700'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">Owner</div>
                            <div className="text-[9px] text-neutral-500 truncate">Eleanor Vance</div>
                          </button>
                          <button
                            onClick={loginAsDemoAdmin}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              user?.email === 'admin@studentnest.demo'
                                ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-700'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">Admin</div>
                            <div className="text-[9px] text-neutral-500 truncate">Moderator</div>
                          </button>
                        </div>
                        <button
                          onClick={() => openAuthModal('signup')}
                          className="w-full text-center py-1.5 px-2 rounded-lg bg-white border border-neutral-300 hover:border-neutral-900 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                        >
                          + Create New Student / Owner Account
                        </button>
                      </div>

                      <div className="h-px bg-neutral-100 my-1" />

                      <button
                        onClick={logout}
                        className="w-full text-left px-5 py-2.5 hover:bg-neutral-50 text-rose-600 font-semibold flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-5 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Dedicated Demo Accounts
                      </div>
                      <div className="px-5 pb-2 grid grid-cols-3 gap-1.5">
                        <button
                          onClick={loginAsDemoStudent}
                          className="p-2 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-center transition-all cursor-pointer"
                        >
                          <div className="text-[11px] font-bold text-sky-900 truncate">Student</div>
                          <div className="text-[9px] text-sky-700 truncate">Julian Chen</div>
                        </button>
                        <button
                          onClick={loginAsDemoOwner}
                          className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-center transition-all cursor-pointer"
                        >
                          <div className="text-[11px] font-bold text-amber-900 truncate">Owner</div>
                          <div className="text-[9px] text-amber-700 truncate">Eleanor Vance</div>
                        </button>
                        <button
                          onClick={loginAsDemoAdmin}
                          className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-center transition-all cursor-pointer"
                        >
                          <div className="text-[11px] font-bold text-purple-900 truncate">Admin</div>
                          <div className="text-[9px] text-purple-700 truncate">Moderator</div>
                        </button>
                      </div>
                      <div className="h-px bg-neutral-100 my-1" />
                      <Link
                        href="/roommates"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-left px-5 py-2.5 hover:bg-violet-50 text-violet-700 flex items-center gap-2 transition-colors font-bold text-xs"
                      >
                        <Users className="w-4 h-4 text-violet-600" />
                        Find Room Partner (AI Match)
                      </Link>
                      <button
                        onClick={() => openAuthModal('signup')}
                        className="w-full text-left px-5 py-2 hover:bg-neutral-50 font-bold text-[#FF385C] transition-colors text-xs"
                      >
                        Create New Account (Student / Owner)
                      </button>
                      <button
                        onClick={() => openAuthModal('login')}
                        className="w-full text-left px-5 py-2 hover:bg-neutral-50 text-neutral-700 transition-colors text-xs"
                      >
                        Existing Account Sign In (Password / Phone)
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY WIDGET */}
      <StudentNestSearchWidget
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={onSearch}
      />

      {/* GLOBAL REALTIME TOASTER */}
      <RealtimeToaster />
    </>
  );
}
