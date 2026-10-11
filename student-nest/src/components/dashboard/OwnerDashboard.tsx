'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  CalendarCheck,
  IndianRupee,
  Plus,
  LayoutDashboard,
  Home,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGetMyListings, apiGetMyBookings } from '@/lib/api';
import MyListings from './MyListings';
import BookingRequests from './BookingRequests';
import PropertyPostForm from './PropertyPostForm';

type Tab = 'overview' | 'listings' | 'bookings' | 'post';

export default function OwnerDashboard() {
  const { user, tokens } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    loading: true,
  });

  useEffect(() => {
    if (!tokens?.accessToken) return;
    (async () => {
      try {
        const [listings, bookings] = await Promise.all([
          apiGetMyListings(tokens.accessToken),
          apiGetMyBookings(tokens.accessToken),
        ]);
        const earnings = bookings
          .filter((b: any) => ['PAID', 'COMPLETED', 'CHECKED_IN'].includes(b.status))
          .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
        setStats({
          totalListings: listings.length,
          activeListings: listings.filter((l: any) => l.status === 'VERIFIED').length,
          pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length,
          totalEarnings: earnings,
          loading: false,
        });
      } catch {
        setStats(s => ({ ...s, loading: false }));
      }
    })();
  }, [tokens?.accessToken]);

  const TABS = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'listings' as Tab, label: 'My Listings', icon: Home, badge: stats.totalListings || undefined },
    { id: 'bookings' as Tab, label: 'Bookings', icon: CalendarCheck, badge: stats.pendingBookings || undefined },
    { id: 'post' as Tab, label: 'Post Property', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Host Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Welcome back, {user?.name || 'Host'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('post')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FF385C] text-white text-sm font-bold hover:bg-[#E00B41] transition-colors shadow-md shadow-[#FF385C]/20"
          >
            <Plus className="w-4 h-4" /> Post Property
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white border border-neutral-200 p-1 rounded-2xl mb-8 w-fit">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === id
                  ? 'bg-[#FF385C] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {badge && badge > 0 && (
                <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                  activeTab === id ? 'bg-white/30 text-white' : 'bg-[#FF385C] text-white'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Listings', value: stats.totalListings, icon: Building2, color: 'violet' },
                { label: 'Live Listings', value: stats.activeListings, icon: ShieldCheck, color: 'emerald' },
                { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, color: 'amber' },
                { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'blue' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-neutral-200 rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center
                    ${stat.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                      stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                      stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'}`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-neutral-900">{stat.value}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="font-bold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('post')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[#FF385C] to-[#E00B41] text-white hover:opacity-90 transition text-left"
                >
                  <Plus className="w-6 h-6 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Post New Property</div>
                    <div className="text-xs opacity-80">List a room or apartment</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:opacity-90 transition text-left"
                >
                  <CalendarCheck className="w-6 h-6 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Manage Bookings</div>
                    <div className="text-xs opacity-80">{stats.pendingBookings} awaiting response</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:opacity-90 transition text-left"
                >
                  <TrendingUp className="w-6 h-6 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">View Listings</div>
                    <div className="text-xs opacity-80">{stats.activeListings} live right now</div>
                  </div>
                </button>
              </div>
            </div>

            {stats.pendingBookings > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-800">Action Required</div>
                  <div className="text-sm text-amber-700">
                    You have {stats.pendingBookings} pending booking request{stats.pendingBookings !== 1 ? 's' : ''} that need your response.
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-amber-700 underline mt-1 hover:text-amber-800"
                  >
                    Review now →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <MyListings onPostNew={() => setActiveTab('post')} />
        )}

        {activeTab === 'bookings' && (
          <BookingRequests />
        )}

        {activeTab === 'post' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Post a New Property</h2>
            <PropertyPostForm onSuccess={() => setActiveTab('listings')} />
          </div>
        )}
      </div>
    </div>
  );
}
