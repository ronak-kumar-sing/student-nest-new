'use client';

import React from 'react';
import Image from 'next/image';
import { X, Share, Heart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
}

export default function StudentNestPhotoGalleryModal({
  isOpen,
  onClose,
  images,
  title,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col animate-in fade-in duration-200">
      {/* Fixed Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-neutral-100 font-semibold text-sm text-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Close gallery</span>
        </button>

        <div className="text-sm font-semibold text-neutral-700 truncate max-w-md hidden md:block">
          {title}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors" aria-label="Share">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors" aria-label="Save">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gallery Photo Feed */}
      <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-100 shadow-md">
            <Image
              src={img}
              alt={`${title} - photo ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority={idx < 2}
            />
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full">
              {idx + 1} / {images.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
