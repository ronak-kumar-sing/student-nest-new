'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  IndianRupee,
  MapPin,
  Moon,
  Sun,
  Cigarette,
  Wine,
  Utensils,
  BookOpen,
  Users,
} from 'lucide-react';
import { apiCreateRoommateRequest, type RoommateRequestPayload } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];

type QuizOption = { value: string; label: string; emoji?: string };

const SLEEP_OPTIONS: QuizOption[] = [
  { value: 'EARLY_BIRD', label: 'Early Bird', emoji: '🌅' },
  { value: 'NORMAL', label: 'Normal (10–11 PM)', emoji: '🌙' },
  { value: 'NIGHT_OWL', label: 'Night Owl', emoji: '🦉' },
];

const SMOKING_OPTIONS: QuizOption[] = [
  { value: 'NON_SMOKER', label: 'Non-Smoker', emoji: '🚭' },
  { value: 'SMOKER_OK', label: 'Smoker / OK with smoking', emoji: '🚬' },
];

const DRINKING_OPTIONS: QuizOption[] = [
  { value: 'NON_DRINKER', label: "Don't drink", emoji: '🧃' },
  { value: 'SOCIAL_DRINKER', label: 'Social drinker', emoji: '🥂' },
  { value: 'ANY', label: "Any", emoji: '🤷' },
];

const FOOD_OPTIONS: QuizOption[] = [
  { value: 'VEG', label: 'Vegetarian', emoji: '🥗' },
  { value: 'NON_VEG', label: 'Non-Vegetarian', emoji: '🍗' },
  { value: 'VEGAN', label: 'Vegan', emoji: '🌿' },
  { value: 'ANY', label: 'Any', emoji: '😋' },
];

const STUDY_OPTIONS: QuizOption[] = [
  { value: 'QUIET', label: 'Quiet environment', emoji: '🤫' },
  { value: 'SOCIAL', label: "Don't mind noise", emoji: '🎵' },
];

const GENDER_OPTIONS: QuizOption[] = [
  { value: 'SAME_GENDER', label: 'Same gender only', emoji: '👤' },
  { value: 'ANY', label: 'Open to any', emoji: '🤝' },
];

function OptionGrid({ options, value, onChange }: {
  options: QuizOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
            value === opt.value
              ? 'border-[#FF385C] bg-[#FF385C]/5'
              : 'border-neutral-200 hover:border-neutral-400'
          }`}
        >
          {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
          <span className={`text-sm font-semibold ${value === opt.value ? 'text-[#FF385C]' : 'text-neutral-700'}`}>
            {opt.label}
          </span>
          {value === opt.value && <CheckCircle2 className="w-4 h-4 text-[#FF385C] ml-auto shrink-0" />}
        </button>
      ))}
    </div>
  );
}

const STEPS = ['Location & Budget', 'Sleep & Study', 'Lifestyle', 'Food & Gender', 'About You'];

interface Props {
  onComplete: () => void;
}

export default function PreferenceQuiz({ onComplete }: Props) {
  const { tokens } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [prefs, setPrefs] = useState<RoommateRequestPayload>({
    city: 'Pune',
    budgetMin: 5000,
    budgetMax: 15000,
    bio: '',
    cleanlinessLevel: 3,
    sleepHabit: 'NORMAL',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'NON_DRINKER',
    foodPreference: 'ANY',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'SAME_GENDER',
  });

  const set = (key: keyof RoommateRequestPayload, val: any) => setPrefs(p => ({ ...p, [key]: val }));

  const canProceed = () => {
    if (step === 0) return prefs.city && prefs.budgetMin > 0 && prefs.budgetMax >= prefs.budgetMin;
    return true;
  };

  const handleSubmit = async () => {
    if (!tokens?.accessToken) { setError('Please sign in first'); return; }
    setSubmitting(true);
    setError('');
    try {
      await apiCreateRoommateRequest(tokens.accessToken, prefs);
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to save preferences');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i <= step ? 'bg-[#FF385C]' : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>

      <h2 className="text-lg font-black text-neutral-900 mb-1">{STEPS[step]}</h2>
      <p className="text-sm text-neutral-500 mb-6">Step {step + 1} of {STEPS.length}</p>

      {/* Step 0: Location & Budget */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1" />Preferred City
            </label>
            <select
              value={prefs.city}
              onChange={e => set('city', e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C]"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              <IndianRupee className="w-4 h-4 inline mr-1" />Monthly Budget Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-neutral-400 mb-1 block">Min (₹)</label>
                <input
                  type="number"
                  value={prefs.budgetMin}
                  onChange={e => set('budgetMin', Number(e.target.value))}
                  min={1000}
                  step={500}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C]"
                />
              </div>
              <span className="text-neutral-400 mt-5">–</span>
              <div className="flex-1">
                <label className="text-xs text-neutral-400 mb-1 block">Max (₹)</label>
                <input
                  type="number"
                  value={prefs.budgetMax}
                  onChange={e => set('budgetMax', Number(e.target.value))}
                  min={prefs.budgetMin}
                  step={500}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C]"
                />
              </div>
            </div>
            <div className="mt-2 bg-neutral-50 rounded-lg px-3 py-2 text-xs text-neutral-500">
              Budget: <strong>₹{prefs.budgetMin.toLocaleString('en-IN')} – ₹{prefs.budgetMax.toLocaleString('en-IN')}</strong>/month
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Sleep & Study */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
              <Moon className="w-4 h-4" /> Sleep Schedule
            </label>
            <OptionGrid options={SLEEP_OPTIONS} value={prefs.sleepHabit!} onChange={v => set('sleepHabit', v)} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
              <BookOpen className="w-4 h-4" /> Study Environment
            </label>
            <OptionGrid options={STUDY_OPTIONS} value={prefs.studyEnvironment!} onChange={v => set('studyEnvironment', v)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Cleanliness Level: {['😫 Very Messy', '😕 Messy', '😐 Average', '🙂 Clean', '✨ Very Clean'][prefs.cleanlinessLevel! - 1]}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={prefs.cleanlinessLevel}
              onChange={e => set('cleanlinessLevel', Number(e.target.value))}
              className="w-full accent-[#FF385C]"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>Very Messy</span><span>Very Clean</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Lifestyle */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
              <Cigarette className="w-4 h-4" /> Smoking
            </label>
            <OptionGrid options={SMOKING_OPTIONS} value={prefs.smokingPreference!} onChange={v => set('smokingPreference', v)} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
              <Wine className="w-4 h-4" /> Drinking
            </label>
            <OptionGrid options={DRINKING_OPTIONS} value={prefs.drinkingPreference!} onChange={v => set('drinkingPreference', v)} />
          </div>
        </div>
      )}

      {/* Step 3: Food & Gender */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
              <Utensils className="w-4 h-4" /> Food Preference
            </label>
            <OptionGrid options={FOOD_OPTIONS} value={prefs.foodPreference!} onChange={v => set('foodPreference', v)} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
              <Users className="w-4 h-4" /> Roommate Gender Preference
            </label>
            <OptionGrid options={GENDER_OPTIONS} value={prefs.roommateGenderPreference!} onChange={v => set('roommateGenderPreference', v)} />
          </div>
        </div>
      )}

      {/* Step 4: Bio */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">About You (optional)</label>
            <textarea
              value={prefs.bio || ''}
              onChange={e => set('bio', e.target.value)}
              rows={4}
              placeholder="Share a bit about yourself — your schedule, hobbies, what you're studying..."
              className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C]"
            />
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-4 text-sm">
            <div className="font-bold text-violet-800 mb-2">Your Preferences Summary</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-violet-700">
              <span>📍 {prefs.city}</span>
              <span>💰 ₹{prefs.budgetMin?.toLocaleString('en-IN')}–{prefs.budgetMax?.toLocaleString('en-IN')}</span>
              <span>🛏️ {SLEEP_OPTIONS.find(o => o.value === prefs.sleepHabit)?.emoji} {SLEEP_OPTIONS.find(o => o.value === prefs.sleepHabit)?.label}</span>
              <span>📚 {STUDY_OPTIONS.find(o => o.value === prefs.studyEnvironment)?.label}</span>
              <span>🚭 {SMOKING_OPTIONS.find(o => o.value === prefs.smokingPreference)?.label}</span>
              <span>{FOOD_OPTIONS.find(o => o.value === prefs.foodPreference)?.emoji} {FOOD_OPTIONS.find(o => o.value === prefs.foodPreference)?.label}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-bold hover:bg-[#E00B41] disabled:opacity-60 transition"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding matches...</> : 'Find Roommates 🏠'}
          </button>
        )}
      </div>
    </div>
  );
}
