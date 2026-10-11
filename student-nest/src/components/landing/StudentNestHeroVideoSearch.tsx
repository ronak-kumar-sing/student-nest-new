'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Wifi,
  GraduationCap,
} from 'lucide-react';
import { SearchFilters } from '@/types/listing';

interface Props {
  onSearch: (filters: SearchFilters) => void;
}

export default function StudentNestHeroVideoSearch({ onSearch }: Props) {
  const [location, setLocation] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [guests, setGuests] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleApply = (locOverride?: string) => {
    onSearch({
      location: locOverride !== undefined ? locOverride : location,
      guests,
    });
  };

  const quickCampuses = [
    { label: 'Harvard Yard', query: 'Harvard' },
    { label: 'MIT Kendall', query: 'MIT' },
    { label: 'Boston University', query: 'Boston' },
    { label: 'Davis Sq (Tufts)', query: 'Somerville' },
    { label: 'Northeastern', query: 'Fenway' },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950 min-h-[580px] lg:min-h-[640px] flex items-center justify-center border-b border-neutral-800">
      {/* BACKGROUND LOOPING ARCHITECTURAL VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster="/videos/tour-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-90 transition-opacity duration-700"
      >
        <source src="/videos/student-nest-walkthrough.mp4" type="video/mp4" />
      </video>

      {/* GRADIENT OVERLAY FOR CONTRAST & STUDENTNEST DEPTH */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 pointer-events-none" />

      {/* TOP/BOTTOM AMBIENT VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/70 pointer-events-none" />

      {/* VIDEO CONTROLS PILL (BOTTOM-RIGHT) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full p-1.5 border border-white/20 text-white text-xs">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={isPlaying ? 'Pause background video' : 'Play video'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <span className="text-[10px] pr-2 text-white/70 font-medium hidden sm:inline">
          Cinematic Tour
        </span>
      </div>

      {/* CENTER HERO CONTENT: STUDENTNEST SEARCH FIRST */}
      <div className="relative z-20 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
        {/* Scholar Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-5 shadow-lg animate-in fade-in slide-in-from-top-3">
          <GraduationCap className="w-4 h-4 text-[#FF385C]" />
          <span>Student-Nest — Premium Academic Living & Fellowships</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md max-w-3xl leading-[1.1]">
          Find your ideal student stay near campus.
        </h1>
        <p className="text-sm sm:text-base text-neutral-200 mt-3 mb-8 max-w-2xl drop-shadow-sm font-normal">
          Architectural studios, sunlit lofts, and quiet study suites for students, researchers, and fellows.
        </p>

        {/* PROMINENT STUDENTNEST SEARCH BOX (CENTER OF THE PAGE) */}
        <div className="w-full max-w-3xl bg-white rounded-3xl sm:rounded-full p-2.5 sm:p-2 shadow-2xl border border-white/40 backdrop-blur-md transition-all">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
            {/* WHERE */}
            <div className="flex-1 px-5 py-2.5 text-left group cursor-pointer">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-800 block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF385C]" /> Where
              </label>
              <input
                type="text"
                placeholder="Search campus or neighborhood..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className="w-full bg-transparent text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-hidden mt-0.5"
              />
            </div>

            {/* WHEN / SEMESTER */}
            <div className="px-5 py-2.5 text-left shrink-0">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-800 block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#FF385C]" /> Academic Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="bg-transparent text-sm font-semibold text-neutral-900 focus:outline-hidden mt-0.5 cursor-pointer"
              >
                <option value="Fall 2026">Fall 2026 (Sep – Dec)</option>
                <option value="Spring 2027">Spring 2027 (Jan – May)</option>
                <option value="Full Year">Full Academic Year (12mo)</option>
                <option value="Summer">Summer Term (Jun – Aug)</option>
              </select>
            </div>

            {/* WHO / SCHOLARS */}
            <div className="px-5 py-2.5 text-left shrink-0 flex items-center justify-between sm:justify-start gap-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-800 block flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#FF385C]" /> Scholars
                </label>
                <div className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {guests} {guests === 1 ? 'scholar' : 'scholars'}
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <button
                onClick={() => handleApply()}
                className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-md shadow-[#FF385C]/30 flex items-center gap-2 transition-transform active:scale-95 ml-2"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* QUICK CAMPUS BUTTONS */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-neutral-300 font-medium mr-1">Popular:</span>
          {quickCampuses.map((camp) => (
            <button
              key={camp.label}
              onClick={() => {
                setLocation(camp.query);
                handleApply(camp.query);
              }}
              className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 transition-all font-medium active:scale-95"
            >
              {camp.label}
            </button>
          ))}
          <Link
            href="/roommates"
            className="px-3 py-1.5 rounded-full bg-violet-600/40 hover:bg-violet-600/70 backdrop-blur-md text-violet-100 border border-violet-400/40 transition-all font-semibold flex items-center gap-1 active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-violet-300" />
            <span>Find Room Partner</span>
          </Link>
        </div>

        {/* TRUST BADGES */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Student Properties</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-sky-400" />
            <span>1 Gbps Fiber & Desks Included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Direct Landlord & Superhosts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
