'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Calendar,
  Wifi,
  Coffee,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourChapter {
  id: string;
  name: string;
  subtitle: string;
  time: number; // in seconds
  icon: React.ElementType;
}

const TOUR_CHAPTERS: TourChapter[] = [
  {
    id: 'studio',
    name: 'Private Studio Suite',
    subtitle: 'Oak study desk & campus window',
    time: 0,
    icon: BookOpen
  },
  {
    id: 'lounge',
    name: 'Collaborative Lounge',
    subtitle: 'Co-working desks & sunset view',
    time: 4.2,
    icon: Wifi
  },
  {
    id: 'kitchen',
    name: 'Kitchenette & Bar',
    subtitle: 'Espresso station & breakfast nook',
    time: 8.4,
    icon: Coffee
  }
];

export default function ApartmentVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(13.4);
  const [activeChapterId, setActiveChapterId] = useState('studio');
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Determine active chapter
      if (time >= 8.4) {
        setActiveChapterId('kitchen');
      } else if (time >= 4.2) {
        setActiveChapterId('lounge');
      } else {
        setActiveChapterId('studio');
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    if (!isPlaying) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentChapter = TOUR_CHAPTERS.find(c => c.id === activeChapterId) || TOUR_CHAPTERS[0];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-2/3 left-1/3 w-[450px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Cinematic Virtual Walkthrough</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Step Inside Your <span className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Future Student Nest</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Tour curated, verified student studio apartments, collaborative study lounges, and campus-adjacent spaces in high definition before scheduling your visit.
        </p>
      </div>

      {/* Video Container Card */}
      <div
        ref={containerRef}
        className="relative group rounded-3xl overflow-hidden border border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl transition-all duration-300"
        onMouseEnter={() => setShowControls(true)}
      >
        {/* Main Video Element */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            src="/videos/student-nest-walkthrough.mp4"
            poster="/videos/tour-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlays for Readability & Cinematic Framing */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
            {/* Verification Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Student Property • 100% Inspected</span>
            </div>

            {/* Live Tour Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span>HD 1080p Virtual Tour</span>
            </div>
          </div>

          {/* Central Play/Pause Action Overlay (Visible on Hover or when Paused) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <button
              onClick={togglePlay}
              className={`p-4 sm:p-5 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md shadow-2xl border border-white/20 hover:scale-110 active:scale-95 transition-all pointer-events-auto ${
                isPlaying ? 'opacity-0 group-hover:opacity-85' : 'opacity-100 scale-105'
              }`}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          {/* Active Scene Overlay (Bottom-Left) */}
          <div className="absolute bottom-16 left-4 sm:left-6 z-20 max-w-sm pointer-events-none transition-all duration-300">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/80 backdrop-blur-md text-primary-foreground text-[11px] font-semibold uppercase tracking-wider mb-1.5">
              <currentChapter.icon className="w-3.5 h-3.5" />
              <span>{currentChapter.name}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-md">
              {currentChapter.subtitle}
            </h3>
          </div>

          {/* Video Control Bar (Bottom) */}
          <div className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-20 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Timeline Scrubber */}
            <div
              className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/timeline overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(pos * duration);
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-primary transition-all rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
                </button>

                <span className="font-mono text-[11px] text-white/80">
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Navigation Tabs Bar */}
        <div className="p-4 sm:p-5 bg-card/80 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
                Tour Scenes:
              </span>
              {TOUR_CHAPTERS.map((chapter) => {
                const Icon = chapter.icon;
                const isActive = activeChapterId === chapter.id;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleSeek(chapter.time)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{chapter.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Direct Action Link */}
            <div className="flex items-center gap-2.5">
              <Link href="/rooms" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto rounded-xl gap-2 font-medium">
                  <Compass className="w-4 h-4" />
                  <span>Browse Similar Rooms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight Cards Beneath Video */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Verified Property Guarantee</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every room is physically inspected and photos/videos are verified for exact accuracy.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Book In-Person Visits</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Love what you see? Schedule an accompanied physical viewing directly with verified owners.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Secure Deposit Escrow</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reserve with full peace of mind. Your deposit is held in escrow until you move in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
