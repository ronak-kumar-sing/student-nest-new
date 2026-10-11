'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Share,
  Heart,
  Grid,
  Award,
  ShieldCheck,
  MapPin,
  Laptop,
  Key,
  Calendar,
  Check,
  Bed,
  Sparkles,
  Wifi,
  Shirt,
  Thermometer,
  Coffee,
  Trees,
  Sun,
  VolumeX,
  Utensils,
  Bike,
  Dumbbell,
  Car,
  Smartphone,
  Bath,
  PawPrint,
  Home,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  GraduationCap,
  Video,
  Users,
} from 'lucide-react';
import { Listing } from '@/types/listing';
import StudentNestBookingSidebar from './StudentNestBookingSidebar';
import StudentNestPhotoGalleryModal from './StudentNestPhotoGalleryModal';
import ReviewSubmissionModal from '@/components/reviews/ReviewSubmissionModal';
import ScheduleTourModal from './ScheduleTourModal';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useWishlist } from '@/context/WishlistContext';
import { apiGetListingReviews } from '@/lib/api';
import { subscribeToListingReviews } from '@/lib/firebase';
import StudentNestSingleLocationMap from '@/components/map/StudentNestSingleLocationMap';

interface Props {
  listing: Listing;
}

const AMENITY_ICONS: Record<string, any> = {
  Wifi,
  Laptop,
  Shirt,
  Thermometer,
  Coffee,
  Key,
  ShieldCheck,
  Trees,
  Sun,
  VolumeX,
  Utensils,
  Bike,
  Dumbbell,
  Car,
  Smartphone,
  Bath,
  Sparkles,
  PawPrint,
  Home,
};

export default function StudentNestRoomDetailView({ listing }: Props) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const { user, openAuthModal } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();
  const isLiked = isSaved(listing.id);
  const { openChat } = useChat();

  const [liveReviews, setLiveReviews] = useState<any[]>(listing.reviews || []);
  const [reviewStats, setReviewStats] = useState({
    rating: listing.rating || 4.9,
    count: listing.reviewCount || (listing.reviews?.length ?? 0),
  });

  const reloadReviews = React.useCallback(async () => {
    if (!listing.id) return;
    try {
      const res = await apiGetListingReviews(listing.id);
      if (res && res.reviews) {
        const formatted = res.reviews.map((r: any) => ({
          id: r.id,
          authorName: r.student?.studentProfile?.fullName || r.student?.email?.split('@')[0] || 'Verified Scholar',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          rating: r.rating,
          comment: r.comment || 'Verified student review on StudentNest.',
          cleanliness: r.cleanliness,
          wifiStudy: r.wifiStudy,
          safetyHost: r.safetyHost,
        }));

        const existingIds = new Set(formatted.map((f: any) => f.id));
        const combined = [...formatted, ...(listing.reviews || []).filter((r: any) => !existingIds.has(r.id))];
        setLiveReviews(combined);
        const avg = combined.length > 0
          ? Number((combined.reduce((acc: number, cur: any) => acc + (cur.rating || 5), 0) / combined.length).toFixed(2))
          : listing.rating;
        setReviewStats({
          rating: avg,
          count: combined.length,
        });
      }
    } catch {
      // fallback
    }
  }, [listing.id, listing.rating, listing.reviews]);

  React.useEffect(() => {
    reloadReviews();
  }, [reloadReviews]);

  // Real-time listener for incoming listing reviews via Firebase
  React.useEffect(() => {
    if (!listing.id) return;
    const unsubscribe = subscribeToListingReviews(listing.id, (incomingReview) => {
      setLiveReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === incomingReview.id);
        let nextList;
        if (idx !== -1) {
          nextList = [...prev];
          nextList[idx] = { ...nextList[idx], ...incomingReview };
        } else {
          nextList = [incomingReview, ...prev];
        }
        const avg = nextList.length > 0
          ? Number((nextList.reduce((acc: number, cur: any) => acc + (cur.rating || 5), 0) / nextList.length).toFixed(2))
          : 5.0;
        setReviewStats({
          rating: avg,
          count: nextList.length,
        });
        return nextList;
      });
    });
    return () => {
      unsubscribe();
    };
  }, [listing.id]);

  const images = listing.images && listing.images.length > 0 ? listing.images : [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top Breadcrumb & Minimal Nav */}
      <div className="border-b border-neutral-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All student listings</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Link copied to clipboard!')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 text-xs font-semibold text-neutral-700 underline"
            >
              <Share className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => toggleWishlist(listing)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 text-xs font-semibold text-neutral-700 underline"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF385C] text-[#FF385C]' : ''}`}
              />
              <span>{isLiked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6">
        {/* Title & Metadata */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700 mb-6">
          <div className="flex items-center gap-1 font-semibold text-neutral-900">
            <Star className="w-4 h-4 fill-neutral-900 stroke-none" />
            <span>{reviewStats.rating.toFixed(2)}</span>
            <span className="font-normal text-neutral-500">
              ({reviewStats.count} reviews)
            </span>
          </div>
          <span>•</span>
          {listing.host.isSuperhost && (
            <>
              <div className="flex items-center gap-1 text-[#FF385C] font-semibold">
                <Award className="w-4 h-4" />
                <span>Superhost</span>
              </div>
              <span>•</span>
            </>
          )}
          <span className="font-medium underline cursor-pointer">
            {listing.location.neighborhood}, {listing.location.city}
          </span>
          <span>•</span>
          <span className="text-neutral-500">{listing.location.distanceToCampus}</span>
        </div>

        {/* 5-PHOTO BENTO GRID */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-sm border border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[440px] md:h-[500px]">
            {/* Big Hero Photo (Left 50%) */}
            <div
              onClick={() => setIsGalleryOpen(true)}
              className="md:col-span-2 relative h-full cursor-pointer overflow-hidden group"
            >
              <Image
                src={images[0]}
                alt={listing.title}
                fill
                priority
                className="object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Right 4 Grid Photos */}
            <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
              {images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setIsGalleryOpen(true)}
                  className="relative h-full cursor-pointer overflow-hidden group"
                >
                  <Image
                    src={img}
                    alt={`${listing.title} - ${idx + 2}`}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* "Show all photos" Pill Button */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="absolute bottom-5 right-5 bg-white/95 hover:bg-white text-neutral-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md border border-neutral-300 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 z-10"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Show all {images.length} photos</span>
          </button>
        </div>

        {/* TWO-COLUMN DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN (CONTENT) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Host Banner */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {listing.type} hosted by {listing.host.name}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {listing.maxGuests} {listing.maxGuests === 1 ? 'scholar' : 'scholars'} • {listing.beds} {listing.beds === 1 ? 'bed' : 'beds'} • {listing.baths} {listing.baths === 1 ? 'bath' : 'baths'}
                </p>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                  <Image
                    src={listing.host.avatar}
                    alt={listing.host.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {listing.host.isSuperhost && (
                  <div className="absolute -bottom-1 -right-1 bg-[#FF385C] text-white p-1 rounded-full shadow-xs">
                    <Award className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Guest Favorite / Highlights */}
            {listing.guestFavorite && (
              <div className="border border-neutral-200 rounded-3xl p-5 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-[#FF385C]" />
                  <div>
                    <div className="font-extrabold text-neutral-900 text-sm">Guest favorite</div>
                    <div className="text-xs text-neutral-500">
                      One of the most loved student listings on Student-Nest based on ratings, reviews, and reliability.
                    </div>
                  </div>
                </div>
                <div className="text-center pl-4 border-l border-neutral-200">
                  <div className="text-lg font-black">{listing.rating.toFixed(2)}</div>
                  <div className="text-[10px] text-neutral-400">★ ★ ★ ★ ★</div>
                </div>
              </div>
            )}

            {/* Key Features List */}
            <div className="space-y-5 pb-6 border-b border-neutral-200">
              <div className="flex items-start gap-4">
                <Laptop className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-neutral-900">Dedicated student workspace</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    A private study desk with ergonomic chair and redundant high-speed internet.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Key className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-neutral-900">Self check-in with keypad</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Check yourself in with the smart lock any time after 3:00 PM.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-neutral-900">Flexible academic leases</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Free cancellation up to 30 days before semester starts.
                  </div>
                </div>
              </div>
            </div>

            {/* Room Partner / Split Rent Card */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Looking for a Room Partner?</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Split rent (~₹{Math.round(listing.pricePerMonth / 2).toLocaleString('en-IN')}/mo each) with a verified student in {listing.location.city}.
                  </p>
                </div>
              </div>
              <Link
                href="/roommates"
                className="shrink-0 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <span>Find Matches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Sleeping Arrangements */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Where you’ll sleep</h3>
              <div className="border border-neutral-200 rounded-2xl p-5 w-52 bg-white">
                <Bed className="w-6 h-6 text-neutral-700 mb-3" />
                <div className="font-semibold text-sm text-neutral-900">Bedroom Area</div>
                <div className="text-xs text-neutral-500 mt-0.5">1 Queen memory foam bed</div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">About this place</h3>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            {/* WHAT THIS PLACE OFFERS */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.icon] || Check;
                  return (
                    <div key={amenity.id} className="flex items-center gap-3 text-sm text-neutral-800">
                      <Icon className="w-5 h-5 text-neutral-700 stroke-[1.8]" />
                      <span>{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WHERE YOU'LL BE INTERACTIVE MAP SECTION */}
            <div className="pb-8 border-b border-neutral-200">
              <StudentNestSingleLocationMap
                lat={listing.location?.lat || 42.3736}
                lng={listing.location?.lng || -71.1189}
                title={listing.title}
                address={listing.address}
                neighborhood={listing.location?.neighborhood}
                city={listing.city || listing.location?.city}
                distanceToCampus={listing.location?.distanceToCampus}
              />
            </div>

            {/* REVIEWS SECTION */}
            <div className="pt-2">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
                  <Star className="w-5 h-5 fill-neutral-900 stroke-none" />
                  <span>{reviewStats.rating.toFixed(2)}</span>
                  <span>•</span>
                  <span>{reviewStats.count} reviews</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 ml-2 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      openAuthModal('login');
                      return;
                    }
                    setIsReviewModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-2xs"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Write a Scholar Review
                </button>
              </div>

              {/* 6 Category Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                {Object.entries(listing.ratingsBreakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-neutral-700 font-medium">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full"
                          style={{ width: `${(val / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-neutral-900 w-6 text-right">
                        {val.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {liveReviews.map((rev) => (
                  <div key={rev.id} className="space-y-3 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <Image
                            src={rev.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={rev.authorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                            <span>{rev.authorName}</span>
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              <GraduationCap className="w-2.5 h-2.5" /> Verified Stay
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-900">{rev.rating || 5}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {(rev.cleanliness || rev.wifiStudy || rev.safetyHost) && (
                      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 text-[10px] text-neutral-500 flex-wrap">
                        {rev.cleanliness && (
                          <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                            Cleanliness: <strong className="text-neutral-800">{rev.cleanliness}/5</strong>
                          </span>
                        )}
                        {rev.wifiStudy && (
                          <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                            Wi-Fi & Desk: <strong className="text-neutral-800">{rev.wifiStudy}/5</strong>
                          </span>
                        )}
                        {rev.safetyHost && (
                          <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                            Host & Safety: <strong className="text-neutral-800">{rev.safetyHost}/5</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Host Section */}
            <div className="pt-6 border-t border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Hosted by {listing.host.name}
              </h3>
              <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    <Image
                      src={listing.host.avatar}
                      alt={listing.host.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-base text-neutral-900">{listing.host.name}</div>
                    <div className="text-xs text-neutral-500">
                      Hosting scholars for {listing.host.yearsHosting} years • Response rate: {listing.host.responseRate}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {listing.host.bio}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() =>
                      openChat(undefined, {
                        id: listing.id,
                        title: listing.title,
                        price: listing.pricePerMonth,
                        hostName: listing.host.name,
                        hostAvatar: listing.host.avatar,
                        hostId: listing.host.id,
                      })
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-100 font-bold text-xs text-neutral-800 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-[#FF385C]" />
                    <span>Contact {listing.host.name}</span>
                  </button>

                  <button
                    onClick={() => setIsTourModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-300 hover:border-purple-600 bg-purple-50 hover:bg-purple-100 font-bold text-xs text-purple-900 transition-colors shadow-xs ml-3"
                  >
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Schedule Tour (Google Meet)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (STICKY BOOKING CALCULATOR) */}
          <div className="lg:col-span-5">
            <StudentNestBookingSidebar listing={listing} />
          </div>
        </div>
      </main>

      {/* FULL SCREEN PHOTO GALLERY LIGHTBOX */}
      <StudentNestPhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={images}
        title={listing.title}
      />

      {/* REVIEW SUBMISSION MODAL */}
      {isReviewModalOpen && (
        <ReviewSubmissionModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          booking={{
            id: `bk_scholar_${listing.id}`,
            listingId: listing.id,
            title: listing.title,
          }}
          onReviewSubmitted={() => {
            reloadReviews();
          }}
        />
      )}

      {/* SCHEDULE TOUR MODAL */}
      {isTourModalOpen && (
        <ScheduleTourModal
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
          listing={{
            id: listing.id,
            title: listing.title,
            address: listing.address || listing.location?.neighborhood || 'Campus Suite',
            city: listing.city || listing.location?.city || 'Pune',
            hostName: listing.host.name,
            hostAvatar: listing.host.avatar,
          }}
        />
      )}
    </div>
  );
}
