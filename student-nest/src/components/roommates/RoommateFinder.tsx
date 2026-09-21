'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGetRoommateMatches, apiGetMyRoommateRequests } from '@/lib/api';
import PreferenceQuiz from '@/components/roommates/PreferenceQuiz';
import RoommateCard from '@/components/roommates/RoommateCard';
import RoommateConnectsInbox from '@/components/roommates/RoommateConnectsInbox';

export default function RoommateFinder() {
  const { user, tokens, openAuthModal } = useAuth();
  const [mainTab, setMainTab] = useState<'matches' | 'inbox'>('matches');
  const [phase, setPhase] = useState<'checking' | 'quiz' | 'results' | 'no_results'>('checking');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRequest, setMyRequest] = useState<any>(null);

  const checkExistingAndLoad = async () => {
    if (!tokens?.accessToken) { setPhase('quiz'); return; }
    setLoading(true);
    try {
      const existingRequests = await apiGetMyRoommateRequests(tokens.accessToken);
      const activeReq = existingRequests.find((r: any) => r.status === 'ACTIVE');
      if (activeReq) {
        setMyRequest(activeReq);
        const data = await apiGetRoommateMatches(tokens.accessToken, activeReq.city);
        const sorted = data.matches || [];
        setMatches(sorted);
        setPhase(sorted.length > 0 ? 'results' : 'no_results');
      } else {
        setPhase('quiz');
      }
    } catch {
      setPhase('quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) checkExistingAndLoad();
    else setPhase('quiz');
  }, [user, tokens?.accessToken]);

  const handleQuizComplete = () => {
    setPhase('checking');
    checkExistingAndLoad();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white">
          <Users className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 text-center">Find Your Perfect Roommate</h2>
        <p className="text-sm text-neutral-500 text-center max-w-xs">
          Sign in to take the compatibility quiz and get matched with like-minded students.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-full bg-[#FF385C] text-white font-bold text-sm hover:bg-[#E00B41] transition"
        >
          Sign In to Start
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-neutral-100 transition">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-neutral-900">Roommate Finder</h1>
              <p className="text-sm text-neutral-500">AI-matched by lifestyle compatibility</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl">
              <button
                onClick={() => setMainTab('matches')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  mainTab === 'matches'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Find Matches
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
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition"
              >
                <RefreshCcw className="w-3 h-3" /> Redo Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {mainTab === 'inbox' ? (
          <RoommateConnectsInbox />
        ) : (
          <>
            {/* Loading State */}
            {(phase === 'checking' || loading) && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#FF385C]" />
                <p className="text-neutral-500">Finding your matches...</p>
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
                Answer a few questions about your lifestyle and we'll match you with compatible students.
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
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm opacity-80">Looking in</p>
                  <p className="text-xl font-black">{myRequest.city}</p>
                  <p className="text-sm opacity-80">₹{myRequest.budgetMin?.toLocaleString('en-IN')} – ₹{myRequest.budgetMax?.toLocaleString('en-IN')}/mo</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black">{matches.length}</div>
                  <div className="text-sm opacity-80">Compatible students found</div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                  <Star className="w-5 h-5" />
                  <span className="text-sm font-bold">Top Match: {matches[0]?.compatibilityPercent || 0}%</span>
                </div>
              </div>
            )}

            {/* Match Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match: any, i: number) => (
                <RoommateCard key={match.request.id} match={match} />
              ))}
            </div>
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
              We're building our student community! Check back soon as more students join.
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
