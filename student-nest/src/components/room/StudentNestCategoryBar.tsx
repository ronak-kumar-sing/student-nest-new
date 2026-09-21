'use client';

import React, { useRef } from 'react';
import {
  Sparkles,
  GraduationCap,
  Award,
  Home,
  Crown,
  Building,
  PiggyBank,
  BedDouble,
  PawPrint,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { CATEGORIES } from '@/data/mockListings';

interface Props {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  GraduationCap,
  Award,
  Home,
  Crown,
  Building,
  PiggyBank,
  BedDouble,
  PawPrint,
  BookOpen,
};

export default function StudentNestCategoryBar({
  selectedCategory,
  onSelectCategory,
  onOpenFilters,
  activeFilterCount,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4 py-3">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex w-7 h-7 rounded-full border border-neutral-300 items-center justify-center text-neutral-600 hover:scale-105 hover:border-neutral-800 transition-all shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Categories Carousel */}
        <div
          ref={scrollRef}
          className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
        >
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-2 pb-2 border-b-2 transition-all shrink-0 group ${
                  isSelected
                    ? 'border-neutral-900 text-neutral-900 opacity-100 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 opacity-70 hover:opacity-100'
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                    isSelected ? 'stroke-[2.2]' : 'stroke-[1.6]'
                  }`}
                />
                <span className="text-xs whitespace-nowrap tracking-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex w-7 h-7 rounded-full border border-neutral-300 items-center justify-center text-neutral-600 hover:scale-105 hover:border-neutral-800 transition-all shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* FILTERS BUTTON */}
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2.5 px-4 py-2.5 border border-neutral-300 hover:border-neutral-900 rounded-xl text-xs font-semibold text-neutral-800 hover:shadow-xs transition-all shrink-0 relative"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#FF385C] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
