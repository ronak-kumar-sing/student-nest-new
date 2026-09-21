'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { SearchFilters } from '@/types/listing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  totalResults: number;
}

export default function StudentNestFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  totalResults,
}: Props) {
  const [minPrice, setMinPrice] = useState(filters.priceMin || 500);
  const [maxPrice, setMaxPrice] = useState(filters.priceMax || 3500);
  const [beds, setBeds] = useState(filters.bedrooms || 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities || []);

  const amenityOptions = [
    'Ultra-fast 1 Gbps WiFi',
    'Dedicated study desk & ergonomic chair',
    'In-unit washer & dryer',
    'Central A/C & heating',
    'Chef-style kitchen with Nespresso bar',
    'Pets allowed (dogs & cats welcome)',
    'Dual 4K Monitor Tech Desk',
    'Private attached bathroom',
  ];

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleApply = () => {
    onApply({
      ...filters,
      priceMin: minPrice > 500 ? minPrice : undefined,
      priceMax: maxPrice < 3500 ? maxPrice : undefined,
      bedrooms: beds > 0 ? beds : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice(500);
    setMaxPrice(3500);
    setBeds(0);
    setSelectedAmenities([]);
    onApply({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-neutral-900">Filters</h2>
          <div className="w-9" />
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Price Range */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Price range</h3>
            <p className="text-sm text-neutral-500 mb-4">Monthly student rent including utilities</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <span className="text-xs text-neutral-400 block font-medium">Minimum</span>
                <div className="flex items-center text-sm font-semibold text-neutral-900 mt-0.5">
                  <span>$</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-hidden ml-1"
                  />
                </div>
              </div>
              <span className="text-neutral-400 font-bold">–</span>
              <div className="flex-1 border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <span className="text-xs text-neutral-400 block font-medium">Maximum</span>
                <div className="flex items-center text-sm font-semibold text-neutral-900 mt-0.5">
                  <span>$</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-hidden ml-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Bedrooms */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Beds & Bedrooms</h3>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setBeds(num)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    beds === num
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'border-neutral-300 text-neutral-800 hover:border-neutral-900'
                  }`}
                >
                  {num === 0 ? 'Any' : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Scholar Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenityOptions.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      checked
                        ? 'border-neutral-900 bg-neutral-50/80'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-sm font-medium text-neutral-900">{amenity}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        checked
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-white">
          <button
            onClick={handleReset}
            className="text-sm font-semibold text-neutral-900 underline hover:text-neutral-600 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-neutral-900 hover:bg-black text-white px-7 py-3 rounded-xl font-semibold text-sm transition-transform active:scale-95"
          >
            Show {totalResults} {totalResults === 1 ? 'place' : 'places'}
          </button>
        </div>
      </div>
    </div>
  );
}
