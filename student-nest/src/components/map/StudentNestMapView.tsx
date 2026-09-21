'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, X, MapPin } from 'lucide-react';
import { Listing } from '@/types/listing';

interface Props {
  listings: Listing[];
}

export default function StudentNestMapView({ listings }: Props) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Map coordinates relative positions on a stylish SVG map canvas
  const getMarkerPosition = (listing: Listing, index: number) => {
    // Generate normalized coordinates for Boston/Cambridge metro area
    const positions = [
      { top: '30%', left: '38%' }, // Harvard Square
      { top: '48%', left: '46%' }, // Back Bay / Fenway
      { top: '42%', left: '54%' }, // Kendall / MIT
      { top: '45%', left: '62%' }, // Beacon Hill
      { top: '22%', left: '42%' }, // Davis Square / Tufts
      { top: '56%', left: '48%' }, // Northeastern
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="relative w-full h-[calc(100vh-160px)] min-h-[550px] bg-[#E5E3DF] rounded-3xl overflow-hidden border border-neutral-300 shadow-inner">
      {/* MAP BACKGROUND CANVAS */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8ECE9] via-[#E5E3DF] to-[#DFE3E5] opacity-90">
        {/* Decorative River (Charles River representation) */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 1000 600">
          <path
            d="M -50 320 Q 200 280 400 340 T 750 300 T 1050 250"
            fill="none"
            stroke="#A5BFD8"
            strokeWidth="38"
            strokeLinecap="round"
          />
          {/* Subtle street grids */}
          <line x1="100" y1="0" x2="500" y2="600" stroke="#FFFFFF" strokeWidth="3" opacity="0.6" />
          <line x1="300" y1="0" x2="700" y2="600" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.5" />
          <line x1="0" y1="200" x2="1000" y2="200" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
          <line x1="0" y1="400" x2="1000" y2="400" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
        </svg>

        {/* Campus District Labels */}
        <div className="absolute top-[28%] left-[34%] text-[11px] font-bold text-neutral-500 uppercase tracking-widest pointer-events-none flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> Harvard Campus
        </div>
        <div className="absolute top-[40%] left-[56%] text-[11px] font-bold text-neutral-500 uppercase tracking-widest pointer-events-none flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> MIT / Kendall
        </div>
        <div className="absolute top-[58%] left-[44%] text-[11px] font-bold text-neutral-500 uppercase tracking-widest pointer-events-none flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> Northeastern University
        </div>
      </div>

      {/* INTERACTIVE STUDENTNEST PRICE PILLS */}
      {listings.map((listing, index) => {
        const pos = getMarkerPosition(listing, index);
        const isSelected = selectedListing?.id === listing.id;

        return (
          <button
            key={listing.id}
            onClick={() => setSelectedListing(listing)}
            style={{ top: pos.top, left: pos.left }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 font-bold text-xs shadow-studentnest-pill transition-all duration-200 z-20 ${
              isSelected
                ? 'bg-neutral-900 text-white scale-110 shadow-lg'
                : 'bg-white hover:bg-white/95 text-neutral-900 hover:scale-105 hover:shadow-md'
            }`}
          >
            ${listing.pricePerMonth.toLocaleString()}
          </button>
        );
      })}

      {/* SELECTED LISTING PREVIEW CARD POPUP */}
      {selectedListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 p-3 relative flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Close */}
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 shadow-xs z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Thumbnail */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-neutral-100">
              <Image
                src={selectedListing.images[0]}
                alt={selectedListing.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between pr-4 py-0.5">
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-900">
                  <Star className="w-3 h-3 fill-neutral-900 stroke-none" />
                  <span>{selectedListing.rating.toFixed(2)}</span>
                  <span className="text-neutral-400 font-normal">({selectedListing.reviewCount})</span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1 mt-0.5">
                  {selectedListing.location.neighborhood}
                </h4>
                <p className="text-xs text-neutral-500 line-clamp-1">
                  {selectedListing.location.distanceToCampus}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-sm font-bold text-neutral-900">
                    ${selectedListing.pricePerMonth.toLocaleString()}
                  </span>
                  <span className="text-xs text-neutral-500"> / mo</span>
                </div>
                <Link
                  href={`/rooms/${selectedListing.id}`}
                  className="text-xs font-bold text-[#FF385C] hover:underline"
                >
                  View Stay →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
