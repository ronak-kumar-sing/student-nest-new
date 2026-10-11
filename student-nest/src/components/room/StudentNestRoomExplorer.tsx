'use client';

import React, { useState, useMemo } from 'react';
import StudentNestHeader from '@/components/navigation/StudentNestHeader';
import StudentNestHeroVideoSearch from '@/components/landing/StudentNestHeroVideoSearch';
import StudentNestCategoryBar from '@/components/room/StudentNestCategoryBar';
import StudentNestRoomCard from '@/components/room/StudentNestRoomCard';
import StudentNestFilterModal from '@/components/room/StudentNestFilterModal';
import StudentNestMapView from '@/components/map/StudentNestMapView';
import { Listing, SearchFilters } from '@/types/listing';
import { filterListings } from '@/lib/api';
import { Map, List, RotateCcw } from 'lucide-react';

interface Props {
  initialListings: Listing[];
}

export default function StudentNestRoomExplorer({ initialListings }: Props) {
  const [category, setCategory] = useState('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Compute active filters
  const mergedFilters = useMemo(() => {
    return {
      ...filters,
      category: category !== 'all' ? category : filters.category,
    };
  }, [category, filters]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return filterListings(initialListings, mergedFilters);
  }, [initialListings, mergedFilters]);

  // Filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.bedrooms) count++;
    if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.location) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setCategory('all');
    setFilters({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. STUDENTNEST GLOBAL HEADER */}
      <StudentNestHeader
        onSearch={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        activeFilters={mergedFilters}
      />

      {/* 2. CINEMATIC VIDEO HERO WITH SEARCH FIRST */}
      <StudentNestHeroVideoSearch
        onSearch={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
      />

      {/* 3. CATEGORIES CAROUSEL BAR */}
      <StudentNestCategoryBar
        selectedCategory={category}
        onSelectCategory={setCategory}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 3. MAIN CONTENT (GRID OR MAP) */}
      <main className="flex-1 max-w-[1760px] mx-auto w-full px-4 sm:px-8 md:px-12 py-6">
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No exact matches found</h3>
            <p className="text-neutral-500 max-w-md text-sm mb-6">
              Try adjusting or clearing your search filters to find available student stays.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-black transition-colors"
            >
              Reset all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* RESPONSIVE STUDENTNEST CARD GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
            {filteredListings.map((listing) => (
              <StudentNestRoomCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          /* MAP VIEW */
          <div className="w-full">
            <StudentNestMapView listings={filteredListings} />
          </div>
        )}
      </main>

      {/* 4. FLOATING BOTTOM TOGGLE PILL (SHOW MAP / SHOW LIST) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
          className="flex items-center gap-2.5 bg-neutral-900 hover:bg-black hover:scale-105 active:scale-95 text-white px-5 py-3.5 rounded-full font-semibold text-sm shadow-studentnest-floating transition-all duration-200"
        >
          {viewMode === 'grid' ? (
            <>
              <span>Show map</span>
              <Map className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show list</span>
              <List className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* 5. FILTER MODAL */}
      <StudentNestFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={mergedFilters}
        onApply={setFilters}
        totalResults={filteredListings.length}
      />

      {/* 6. STUDENTNEST FOOTER */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-8 mt-12 text-neutral-500 text-xs">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 Student-Nest, Inc.</span>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline">Sitemap</a>
            <span>•</span>
            <span className="text-neutral-400">Connected to StudentNest Backend (4000)</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-neutral-800">
            <span>English (US)</span>
            <span>$ USD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
