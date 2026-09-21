'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  listing: Listing;
}

export default function StudentNestRoomCard({ listing }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isSaved, toggleWishlist } = useWishlist();

  const isLiked = isSaved(listing.id);

  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing);
  };

  return (
    <div
      className="group flex flex-col cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/rooms/${listing.id}`} className="block">
        {/* Photo Carousel Container */}
        <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl bg-neutral-100 mb-3 shadow-studentnest-card group-hover:shadow-md transition-shadow">
          <Image
            src={images[currentImageIndex]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />

          {/* Guest Favorite Badge */}
          {listing.guestFavorite && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-neutral-900 shadow-md flex items-center gap-1 z-10">
              <Award className="w-3.5 h-3.5 text-[#FF385C]" />
              <span>Guest favorite</span>
            </div>
          )}

          {/* Favorite Heart Button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 rounded-full text-white/90 hover:text-white hover:scale-115 transition-transform z-10"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`w-6 h-6 stroke-[2] drop-shadow-md transition-colors ${
                isLiked ? 'fill-[#FF385C] text-[#FF385C]' : 'fill-black/30 stroke-white'
              }`}
            />
          </button>

          {/* Carousel Arrows (Hover only) */}
          {images.length > 1 && isHovered && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition-transform active:scale-95 z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition-transform active:scale-95 z-10"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentImageIndex
                      ? 'w-2 h-2 bg-white scale-110 shadow-xs'
                      : 'w-1.5 h-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Listing Info */}
        <div className="flex justify-between items-start text-sm">
          <div className="font-semibold text-neutral-900 truncate pr-2">
            {listing.location.neighborhood}, {listing.location.city}
          </div>
          <div className="flex items-center gap-1 text-neutral-900 font-semibold shrink-0">
            <Star className="w-3.5 h-3.5 fill-neutral-900 stroke-none" />
            <span>{listing.rating.toFixed(2)}</span>
            <span className="text-neutral-400 font-normal">({listing.reviewCount})</span>
          </div>
        </div>

        <div className="text-sm text-neutral-500 truncate mt-0.5">
          {listing.location.distanceToCampus}
        </div>

        <div className="text-sm text-neutral-500 truncate mt-0.5">
          {listing.availableDates}
        </div>

        {/* Price */}
        <div className="mt-2 text-sm flex items-baseline gap-1.5">
          <span className="font-bold text-neutral-900 text-base">
            ${listing.pricePerMonth.toLocaleString()}
          </span>
          <span className="text-neutral-600 font-normal">/ month</span>
          {listing.pricePerNight && (
            <span className="text-neutral-400 text-xs font-normal">
              (${listing.pricePerNight}/night)
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
