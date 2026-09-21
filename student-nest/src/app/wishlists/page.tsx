'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ArrowLeft,
  Trash2,
  MapPin,
  Star,
  Building,
  GraduationCap,
  Sparkles,
  IndianRupee,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import StudentNestRoomCard from '@/components/room/StudentNestRoomCard';

export default function WishlistsPage() {
  const { wishlist, wishlistCount, clearWishlist, removeFromWishlist } = useWishlist();
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating'>('default');

  // Available cities from saved items
  const cities = ['ALL', ...Array.from(new Set(wishlist.map((item) => item.location?.city).filter(Boolean)))];

  // Filter & Sort
  const filtered = wishlist
    .filter((item) => (selectedCity === 'ALL' ? true : item.location?.city === selectedCity))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerMonth - b.pricePerMonth;
      if (sortBy === 'price_desc') return b.pricePerMonth - a.pricePerMonth;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition"
              title="Return to explore"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-neutral-900">Your Wishlists</h1>
                <span className="w-6 h-6 rounded-full bg-[#FF385C]/10 text-[#FF385C] flex items-center justify-center font-bold text-xs">
                  {wishlistCount}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Curated collection of saved student accommodations & campus suites
              </p>
            </div>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Clear all saved properties from your wishlist?')) {
                    clearWishlist();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-rose-300 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 pt-8">
        {wishlistCount === 0 ? (
          <div className="max-w-md mx-auto py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Heart className="w-10 h-10 fill-[#FF385C]" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Your wishlist is empty</h2>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-sm mx-auto">
              As you search, tap the heart icon on any student listing to save your favorite rooms and compare them here before booking.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-sm shadow-md transition"
              >
                <Building className="w-4 h-4" />
                <span>Start Exploring Rooms</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Filter and Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
              {/* City Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition ${
                      selectedCity === city
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {city === 'ALL' ? 'All Cities' : city}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-800 focus:outline-none"
                >
                  <option value="default">Recently Added</option>
                  <option value="price_asc">Rent: Low to High</option>
                  <option value="price_desc">Rent: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Grid of Saved Rooms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {filtered.map((listing) => (
                <div key={listing.id} className="relative group">
                  <StudentNestRoomCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
