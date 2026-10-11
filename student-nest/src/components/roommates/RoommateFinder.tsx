'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  ArrowLeft,
  Home,
  RefreshCcw,
  Loader2,
  Search,
  Sparkles,
  Star,
  Inbox,
  Bed,
  Map as MapIcon,
  LayoutGrid,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  apiGetRoommateMatches,
  apiGetMyRoommateRequests,
  DEFAULT_DEMO_MATCHES,
} from '@/lib/api';
import PreferenceQuiz from '@/components/roommates/PreferenceQuiz';
import RoommateCard from '@/components/roommates/RoommateCard';
import RoommateConnectsInbox from '@/components/roommates/RoommateConnectsInbox';
import StudentAvailableRoomsView from '@/components/roommates/StudentAvailableRoomsView';
import StudentNestMapView from '@/components/map/StudentNestMapView';
import { Listing } from '@/types/listing';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RoommateFinder() {
  const { user, tokens, openAuthModal, loginAsDemoStudent } = useAuth();
  const [mainTab, setMainTab] = useState<'matches' | 'inbox'>('matches');
  const [viewMode, setViewMode] = useState<'profiles' | 'rooms' | 'map'>('profiles');
  const [roomFilter, setRoomFilter] = useState<'all' | 'has_room' | 'seeking_room'>('all');
  const [phase, setPhase] = useState<'checking' | 'quiz' | 'results' | 'no_results'>('checking');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRequest, setMyRequest] = useState<any>(null);

  const checkExistingAndLoad = async () => {
    if (!tokens?.accessToken) {
      setPhase('quiz');
      return;
    }
    setLoading(true);
    try {
      const existingRequests = await apiGetMyRoommateRequests(tokens.accessToken);
      const activeReq = existingRequests.find((r: any) => r.status === 'ACTIVE') || existingRequests[0];
      if (activeReq) {
        setMyRequest(activeReq);
        const data = await apiGetRoommateMatches(tokens.accessToken, activeReq.city);
        const sorted = data.matches || data.data?.matches || [];
        setMatches(sorted.length > 0 ? sorted : DEFAULT_DEMO_MATCHES);
        setPhase('results');
      } else {
        setPhase('quiz');
      }
    } catch {
      setMatches(DEFAULT_DEMO_MATCHES);
      setPhase('results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkExistingAndLoad();
    } else {
      setPhase('quiz');
    }
  }, [user, tokens?.accessToken]);

  const handleQuizComplete = () => {
    setPhase('checking');
    checkExistingAndLoad();
  };

  // Filter matches based on room status
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (roomFilter === 'has_room') return Boolean(m.request?.hasRoom && m.request?.room);
      if (roomFilter === 'seeking_room') return !m.request?.hasRoom;
      return true;
    });
  }, [matches, roomFilter]);

  const totalWithRooms = useMemo(() => {
    return matches.filter((m) => m.request?.hasRoom && m.request?.room).length;
  }, [matches]);

  const totalSeeking = matches.length - totalWithRooms;

  // Convert student rooms to Listing format for Leaflet Map view
  const roomListings: Listing[] = useMemo(() => {
    return matches
      .filter((m) => m.request?.hasRoom && m.request?.room && m.request?.room?.coordinates)
      .map((m) => {
        const r = m.request.room;
        const student = m.request.student;
        const studentName = student?.studentProfile?.fullName || 'Verified Student';
        const avatar =
          student?.studentProfile?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

        return {
          id: r.id || m.request.id,
          title: r.title,
          type: r.roomType || 'Student Shared Flat',
          location: {
            city: r.city,
            neighborhood: r.neighborhood,
            distanceToCampus: r.distanceToCampus || 'Near Campus',
            lat: r.coordinates.lat,
            lng: r.coordinates.lng,
          },
          pricePerMonth: r.rentShare,
          pricePerNight: Math.round(r.rentShare / 30),
          rating: 4.95,
          reviewCount: m.compatibilityPercent || 95,
          guestFavorite: true,
          images: r.images && r.images.length > 0 ? r.images : [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          ],
          category: 'roommates',
          beds: 1,
          baths: 1,
          maxGuests: 1,
          description: `${r.title}. Shared with student scholar ${studentName} (${student?.studentProfile?.collegeName || 'University'}).`,
          host: {
            name: `${studentName} (Flatmate)`,
            avatar,
            isSuperhost: true,
            yearsHosting: 1,
            responseRate: '100%',
            responseTime: 'within minutes',
            verified: true,
            bio: m.request.bio || 'Verified student peer looking for a respectful roommate.',
          },
          amenities: (r.amenities || []).map((a: string, idx: number) => ({
            id: String(idx),
            name: a,
            icon: 'Check',
            category: 'essentials' as const,
          })),
          ratingsBreakdown: {
            cleanliness: 5.0,
            accuracy: 5.0,
            communication: 5.0,
            location: 5.0,
            checkIn: 5.0,
            value: 5.0,
          },
          reviews: [],
          availableDates: r.availableFrom || 'Available Now',
        };
      });
  }, [matches]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-violet-50 via-indigo-50 to-neutral-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-md shadow-violet-500/20">
            <Users className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 mb-3">
            AI Lifestyle Compatibility &amp; Student Rooms
          </span>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">Find Your Room Partner &amp; Student Rooms</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Connect with verified students, explore student-posted rooms and co-living spaces, and match by sleep schedule, study habits, and budget.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => loginAsDemoStudent()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              1-Click Demo Student Sign-In
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-6 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-sm transition"
            >
              Sign In with Your Account
            </button>
          </div>
          <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center gap-4 text-xs text-neutral-400">
            <span>✓ Verified Student IDs</span>
            <span>•</span>
            <span>✓ Available Student Rooms</span>
            <span>•</span>
            <span>✓ Map View</span>
          </div>
        </div>
      </div>
    );
  }

  if (user && user.role === 'owner') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">Student Roommate Matching</h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            Roommate lifestyle matching is specifically engineered for student scholars. You are currently logged in with a Host / Owner account.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => loginAsDemoStudent()}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition shadow-sm"
            >
              Switch to Student Demo (Julian Chen)
            </button>
            <Link
              href="/dashboard"
              className="block w-full py-2.5 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition"
            >
              Return to Owner Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-neutral-100 transition">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                <span>Roommate &amp; Student Room Finder</span>
              </h1>
              <p className="text-xs text-neutral-500">
                Match lifestyle habits &amp; browse rooms available from students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Main Tabs (Matches vs Inbox) */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl">
              <button
                onClick={() => setMainTab('matches')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  mainTab === 'matches'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Find Roommates &amp; Rooms
              </button>
              <button
                onClick={() => setMainTab('inbox')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  mainTab === 'inbox'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-violet-600" />
                <span>Connects Inbox</span>
                <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              </button>
            </div>

            {mainTab === 'matches' && phase === 'results' && (
              <button
                onClick={() => setPhase('quiz')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition"
              >
                <RefreshCcw className="w-3 h-3" /> Redo Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {mainTab === 'inbox' ? (
          <RoommateConnectsInbox />
        ) : (
          <>
            {/* Loading State */}
            {(phase === 'checking' || loading) && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#FF385C]" />
                <p className="text-neutral-500">Finding your student matches &amp; available rooms...</p>
              </div>
            )}

            {/* Quiz */}
            {phase === 'quiz' && !loading && (
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-neutral-900 mb-2">Compatibility Quiz</h2>
                  <p className="text-sm text-neutral-500">
                    Answer a few questions about your lifestyle, budget, and whether you have a room available, and we&apos;ll match you with compatible peers.
                  </p>
                </div>
                <PreferenceQuiz onComplete={handleQuizComplete} />
              </div>
            )}

            {/* Results */}
            {phase === 'results' && !loading && (
              <div className="space-y-6">
                {/* Stats Banner */}
                {myRequest && (
                  <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white flex items-center justify-between flex-wrap gap-4 shadow-lg shadow-violet-500/10">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Searching In</p>
                      <p className="text-2xl font-black">{myRequest.city}</p>
                      <p className="text-xs opacity-90 mt-0.5">
                        Budget: ₹{myRequest.budgetMin?.toLocaleString('en-IN')} – ₹{myRequest.budgetMax?.toLocaleString('en-IN')}/mo
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-black">{matches.length}</div>
                        <div className="text-xs opacity-80">Student Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-amber-300">{totalWithRooms}</div>
                        <div className="text-xs opacity-80">Rooms Available</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2.5">
                      <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                      <div>
                        <span className="text-sm font-bold block">Top Match: {matches[0]?.compatibilityPercent || 0}%</span>
                        <span className="text-[10px] opacity-80">Based on lifestyle &amp; study habits</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SHADCN UI TABS FOR VIEW SWITCHING */}
                <Tabs
                  value={viewMode}
                  onValueChange={(val: any) => setViewMode(val)}
                  className="w-full"
                >
                  <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                    <TabsList className="bg-neutral-100 p-1 rounded-xl">
                      <TabsTrigger value="profiles" className="gap-1.5 font-bold">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Roommate Profiles</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="rooms"
                        className="gap-1.5 font-bold data-[state=active]:text-violet-700"
                      >
                        <Bed className="w-3.5 h-3.5 text-violet-600" />
                        <span>Available Student Rooms</span>
                        <Badge variant="violet" className="ml-1 text-[10px] px-1.5 py-0 font-bold">
                          {totalWithRooms}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="map" className="gap-1.5 font-bold">
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Room &amp; Campus Map</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Filter by Room Availability (active in profiles view) */}
                    {viewMode === 'profiles' && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-neutral-400 font-medium hidden sm:inline">Filter:</span>
                        <Button
                          variant={roomFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRoomFilter('all')}
                          className="rounded-lg h-7 px-2.5 text-xs font-bold"
                        >
                          All ({matches.length})
                        </Button>
                        <Button
                          variant={roomFilter === 'has_room' ? 'violet' : 'outline'}
                          size="sm"
                          onClick={() => setRoomFilter('has_room')}
                          className="rounded-lg h-7 px-2.5 text-xs font-bold gap-1"
                        >
                          <Bed className="w-3 h-3" />
                          <span>Has Room ({totalWithRooms})</span>
                        </Button>
                        <Button
                          variant={roomFilter === 'seeking_room' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRoomFilter('seeking_room')}
                          className="rounded-lg h-7 px-2.5 text-xs font-bold"
                        >
                          Seeking ({totalSeeking})
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* VIEW MODE 1: PROFILES GRID */}
                  <TabsContent value="profiles" className="mt-6">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredMatches.map((match: any) => (
                        <RoommateCard key={match.request.id} match={match} />
                      ))}
                    </div>
                  </TabsContent>

                  {/* VIEW MODE 2: STUDENT AVAILABLE ROOMS GALLERY */}
                  <TabsContent value="rooms" className="mt-6">
                    <StudentAvailableRoomsView matches={matches} />
                  </TabsContent>

                  {/* VIEW MODE 3: MAP VIEW */}
                  <TabsContent value="map" className="mt-6 space-y-3">
                    <div className="bg-white p-3 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
                        <span className="font-bold text-neutral-800">
                          {roomListings.length} Student Shared Rooms Pinpointed
                        </span>
                        <span className="text-neutral-400 hidden sm:inline">
                          • Click any price marker to preview room details
                        </span>
                      </div>
                      <Badge variant="violet" className="font-bold text-[10px]">
                        Live Interactive Map
                      </Badge>
                    </div>
                    <StudentNestMapView listings={roomListings} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* No Results */}
            {phase === 'no_results' && !loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">No matches yet</h3>
                <p className="text-sm text-neutral-500 max-w-sm">
                  We&apos;re building our student community! Check back soon as more students join.
                  Your profile is now live and others can find you.
                </p>
                <button
                  onClick={() => setPhase('quiz')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition"
                >
                  <RefreshCcw className="w-4 h-4" /> Update Preferences
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
