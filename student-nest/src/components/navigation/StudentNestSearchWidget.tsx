'use client';

import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';
import { SearchFilters } from '@/types/listing';

interface Props {
  onSearch: (filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentNestSearchWidget({ onSearch, isOpen, onClose }: Props) {
  const [location, setLocation] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [guests, setGuests] = useState(1);
  const [activeTab, setActiveTab] = useState<'where' | 'when' | 'who'>('where');

  const popularCampuses = [
    { name: 'Harvard Square', city: 'Cambridge', tag: '0.2 mi to Yard' },
    { name: 'Kendall / MIT', city: 'Cambridge', tag: 'Tech Hub' },
    { name: 'Fenway / BU', city: 'Boston', tag: 'Commonwealth Ave' },
    { name: 'Davis Square / Tufts', city: 'Somerville', tag: 'Red Line direct' },
    { name: 'Northeastern / MFA', city: 'Boston', tag: 'Huntington Ave' },
  ];

  const handleApply = () => {
    onSearch({
      location,
      guests,
    });
    onClose();
  };

  const handleClear = () => {
    setLocation('');
    setGuests(1);
    onSearch({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex flex-col justify-start pt-4 transition-all">
      <div 
        className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden px-6 py-5 relative animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Type Selector Tabs */}
        <div className="flex items-center justify-center gap-8 border-b border-neutral-100 pb-4 text-sm font-medium">
          <button className="text-neutral-900 border-b-2 border-neutral-900 pb-1 font-semibold">
            Student Stays
          </button>
          <button className="text-neutral-500 hover:text-neutral-800 transition-colors">
            Monthly Sublets
          </button>
          <button className="text-neutral-500 hover:text-neutral-800 transition-colors">
            Campus Roommates
          </button>
        </div>

        {/* Search Bar Segment Bar */}
        <div className="mt-4 bg-neutral-100 rounded-full p-1.5 flex items-center border border-neutral-200 divide-x divide-neutral-200">
          {/* WHERE */}
          <div
            onClick={() => setActiveTab('where')}
            className={`flex-1 px-6 py-2.5 rounded-full cursor-pointer transition-all ${
              activeTab === 'where' ? 'bg-white shadow-md' : 'hover:bg-neutral-200/60'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-800">Where</div>
            <input
              type="text"
              placeholder="Search campus or city..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-hidden"
              autoFocus
            />
          </div>

          {/* WHEN / TERM */}
          <div
            onClick={() => setActiveTab('when')}
            className={`flex-1 px-6 py-2.5 rounded-full cursor-pointer transition-all ${
              activeTab === 'when' ? 'bg-white shadow-md' : 'hover:bg-neutral-200/60'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-800">Semester</div>
            <div className="text-sm font-medium text-neutral-900 truncate">{term}</div>
          </div>

          {/* WHO / GUESTS */}
          <div
            onClick={() => setActiveTab('who')}
            className={`flex-1 px-6 py-2.5 rounded-full cursor-pointer transition-all flex items-center justify-between ${
              activeTab === 'who' ? 'bg-white shadow-md' : 'hover:bg-neutral-200/60'
            }`}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-800">Who</div>
              <div className="text-sm font-medium text-neutral-900">
                {guests} {guests === 1 ? 'scholar' : 'scholars'}
              </div>
            </div>

            {/* Red Search Submit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              className="ml-3 flex items-center gap-2 bg-[#FF385C] hover:bg-[#E00B41] text-white px-5 py-3 rounded-full font-semibold text-sm shadow-md transition-transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Tab Detail Contents */}
        <div className="mt-6 min-h-[160px]">
          {activeTab === 'where' && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Quick Search by University or District
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularCampuses.map((campus) => (
                  <button
                    key={campus.name}
                    onClick={() => {
                      setLocation(campus.name);
                      setActiveTab('when');
                    }}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all text-left group"
                  >
                    <div className="p-2.5 bg-neutral-100 group-hover:bg-[#FF385C]/10 rounded-xl text-neutral-600 group-hover:text-[#FF385C] transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">{campus.name}</div>
                      <div className="text-xs text-neutral-500">{campus.city} • {campus.tag}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'when' && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Select Academic Term or Lease Window
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Fall 2026', desc: 'Sep 1 – Dec 31' },
                  { label: 'Spring 2027', desc: 'Jan 15 – May 30' },
                  { label: 'Full Academic Year', desc: '12-Month Lease' },
                  { label: 'Summer Fellowship', desc: 'Jun 1 – Aug 31' },
                  { label: 'Flexible Month-to-Month', desc: '30-day notice' },
                  { label: 'Immediate Move-in', desc: 'Available this week' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setTerm(item.label);
                      setActiveTab('who');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      term === item.label
                        ? 'border-neutral-900 bg-neutral-50 font-semibold'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <div className="text-sm text-neutral-900 font-medium">{item.label}</div>
                    <div className="text-xs text-neutral-500 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'who' && (
            <div className="max-w-md">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Students / Scholars</div>
                  <div className="text-xs text-neutral-500">Undergrad, graduate, or visiting scholars</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-40 hover:border-neutral-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{guests}</span>
                  <button
                    onClick={() => setGuests(guests + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleClear}
                  className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900"
                >
                  Clear all
                </button>
                <button
                  onClick={handleApply}
                  className="bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors"
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
