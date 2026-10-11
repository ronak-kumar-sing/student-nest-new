'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  GraduationCap,
  Check,
  ShieldCheck,
  MessageCircle,
  Heart,
  ExternalLink,
  Bed,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    title: string;
    roomType: string;
    rentShare: number;
    currency?: string;
    deposit?: number;
    address: string;
    neighborhood: string;
    city: string;
    distanceToCampus: string;
    images: string[];
    amenities: string[];
    furnishing?: string;
    availableFrom: string;
    listingId?: string;
    coordinates?: { lat: number; lng: number };
  };
  student: {
    id?: string;
    name: string;
    college: string;
    avatar: string;
    compatibilityPercent?: number;
    bio?: string;
  };
  onConnect?: () => void;
  isConnectSent?: boolean;
}

export default function StudentRoomModal({
  isOpen,
  onClose,
  room,
  student,
  onConnect,
  isConnectSent = false,
}: Props) {
  const { openChat } = useChat();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const images =
    room.images && room.images.length > 0
      ? room.images
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

  const currencySymbol = room.currency || (room.rentShare > 4000 ? '₹' : '$');
  const formattedRent = `${currencySymbol}${room.rentShare.toLocaleString()}`;

  // Mini-map initialization
  useEffect(() => {
    if (!isOpen || !room.coordinates) return;

    let isMounted = true;
    const { lat, lng } = room.coordinates;

    const timer = setTimeout(() => {
      import('leaflet').then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        const customHtml = `
          <div style="background-color: #7c3aed; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); border: 2px solid white; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 4px;">
            <span>🛏️</span>
            <span>${formattedRent}/mo</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'studentnest-price-marker',
          html: customHtml,
          iconSize: [90, 28],
          iconAnchor: [45, 14],
        });

        L.marker([lat, lng], { icon }).addTo(map);

        L.circle([lat, lng], {
          radius: 350,
          color: '#7c3aed',
          weight: 1.5,
          opacity: 0.6,
          fillColor: '#7c3aed',
          fillOpacity: 0.1,
          dashArray: '3, 6',
        }).addTo(map);

        mapInstanceRef.current = map;
      });
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, room.coordinates, formattedRent]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden flex flex-col">
        {/* HEADER BAR */}
        <DialogHeader className="px-6 py-4 border-b border-neutral-100 flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Badge variant="violet" className="gap-1 px-3 py-1 font-bold">
              <Bed className="w-3.5 h-3.5" /> Student Room Available
            </Badge>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs font-semibold text-neutral-600">{room.roomType}</span>
          </div>
        </DialogHeader>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* PHOTO HERO */}
          <div className="space-y-3">
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-neutral-100 shadow-inner group">
              <Image
                src={images[activePhotoIdx]}
                alt={room.title}
                fill
                className="object-cover transition-transform duration-300"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md border-0"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-800" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setActivePhotoIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md border-0"
                  >
                    <ChevronRight className="w-5 h-5 text-neutral-800" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                {activePhotoIdx + 1} / {images.length} Photos
              </div>
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activePhotoIdx === i
                        ? 'border-violet-600 scale-105 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TITLE & PRICE */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
                {room.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>
                  {room.address}, {room.neighborhood}, {room.city}
                </span>
              </DialogDescription>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg w-fit mt-2 border border-violet-100">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{room.distanceToCampus}</span>
              </div>
            </div>

            <div className="text-right sm:self-center bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">{formattedRent}</div>
              <div className="text-xs text-neutral-500">per month (your share)</div>
              {room.deposit && (
                <div className="text-[11px] text-neutral-400 mt-1">
                  Deposit: {currencySymbol}{room.deposit.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* SPECS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Room Type
              </span>
              <span className="text-xs font-bold text-neutral-900">{room.roomType}</span>
            </div>
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Furnishing
              </span>
              <span className="text-xs font-bold text-neutral-900">{room.furnishing || 'Furnished'}</span>
            </div>
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Move-In
              </span>
              <span className="text-xs font-bold text-neutral-900">{room.availableFrom}</span>
            </div>
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Bills &amp; WiFi
              </span>
              <span className="text-xs font-bold text-emerald-700">WiFi &amp; Maint. Included</span>
            </div>
          </div>

          {/* ROOMMATE HOST CARD */}
          <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-neutral-50 p-4 rounded-2xl border border-violet-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="w-14 h-14 rounded-2xl border-2 border-white shadow-xs">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback>{student.name[0]?.toUpperCase() || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-neutral-900">{student.name}</h4>
                  <Badge variant="emerald" className="gap-1 text-[10px] py-0 px-2 font-bold">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified Peer
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">{student.college}</p>
                {student.bio && (
                  <p className="text-xs text-neutral-500 italic mt-1 max-w-md line-clamp-1">
                    &ldquo;{student.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {student.compatibilityPercent && (
              <div className="text-center px-3.5 py-1.5 bg-white rounded-xl border border-violet-200 shadow-2xs">
                <span className="text-lg font-black text-violet-700">{student.compatibilityPercent}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Match Score
                </span>
              </div>
            )}
          </div>

          {/* AMENITIES */}
          <div>
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5">
              Included Amenities &amp; Perks
            </h4>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* MINI LOCATION MAP */}
          {room.coordinates && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Location &amp; Campus Neighborhood
                </h4>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${room.coordinates.lat},${room.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-violet-700 hover:underline flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 border-t border-neutral-100 bg-white sticky bottom-0 z-10 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => {
              openChat(undefined, undefined, {
                partnerId: student.id || `stud_${student.name}`,
                partnerName: student.name,
                partnerRole: 'student',
                partnerAvatar: student.avatar,
                initialMessage: `Hi ${student.name}! I saw the available room (${room.title}) you posted on StudentNest. I'm interested in viewing or teaming up!`,
              });
              onClose();
            }}
            className="flex-1 rounded-xl text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4 text-violet-600" />
            <span>Direct Chat with {student.name.split(' ')[0]}</span>
          </Button>

          {onConnect && (
            <Button
              variant={isConnectSent ? 'secondary' : 'violet'}
              onClick={onConnect}
              disabled={isConnectSent}
              className={`flex-1 rounded-xl text-xs font-bold ${
                isConnectSent ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : ''
              }`}
            >
              {isConnectSent ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Room Request Sent!</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Request Room &amp; Connect</span>
                </>
              )}
            </Button>
          )}

          {room.listingId && (
            <Link href={`/rooms/${room.listingId}`}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                View Full Listing →
              </Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
