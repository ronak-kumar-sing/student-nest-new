'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, GraduationCap, Compass, Layers } from 'lucide-react';
import { CAMPUS_LANDMARKS } from '@/data/campusLandmarks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Props {
  lat: number;
  lng: number;
  title: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  distanceToCampus?: string;
}

export default function StudentNestSingleLocationMap({
  lat,
  lng,
  title,
  address,
  neighborhood,
  city,
  distanceToCampus,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'voyager' | 'satellite'>('voyager');

  // Find closest campus from landmarks database
  const getNearestCampus = () => {
    let closest: any = null;
    let minDistance = Infinity;

    CAMPUS_LANDMARKS.forEach((campus) => {
      // Rough Euclidean distance
      const d = Math.sqrt(Math.pow(campus.lat - lat, 2) + Math.pow(campus.lng - lng, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = campus;
      }
    });

    // Roughly 0.01 deg is ~1.1km
    const kmDistance = (minDistance * 111).toFixed(1);
    return { campus: closest, km: kmDistance };
  };

  const nearest = getNearestCampus();

  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Tile layer
      const tileUrl =
        activeLayer === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Listing Pin with pulsating radar
      const pinHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: rgba(255, 56, 92, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #FF385C; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(255,56,92,0.4); border: 2.5px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        className: 'studentnest-price-marker',
        html: pinHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([lat, lng], { icon: pinIcon }).addTo(map);

      // Radius circle showing walking zone (~500m)
      L.circle([lat, lng], {
        radius: 400,
        color: '#FF385C',
        weight: 1.5,
        opacity: 0.5,
        fillColor: '#FF385C',
        fillOpacity: 0.06,
        dashArray: '4, 6',
      }).addTo(map);

      // Campus Marker if within 5km
      if (nearest.campus && Number(nearest.km) < 5) {
        const campusHtml = `
          <div class="studentnest-campus-pill">
            <span>🎓</span>
            <span>${nearest.campus.shortName}</span>
          </div>
        `;
        const campusIcon = L.divIcon({
          className: 'studentnest-price-marker',
          html: campusHtml,
          iconSize: [110, 30],
          iconAnchor: [55, 15],
        });
        L.marker([nearest.campus.lat, nearest.campus.lng], { icon: campusIcon }).addTo(map);
      }

      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, activeLayer]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">Where you&apos;ll be</h3>
          <p className="text-sm text-neutral-500 mt-0.5">
            {address || neighborhood || 'Campus District'}, {city || 'College Town'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Layer Toggle */}
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <Button
              variant={activeLayer === 'voyager' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveLayer('voyager')}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-all ${
                activeLayer === 'voyager'
                  ? 'bg-white text-neutral-900 shadow-2xs hover:bg-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              Street
            </Button>
            <Button
              variant={activeLayer === 'satellite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveLayer('satellite')}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-all ${
                activeLayer === 'satellite'
                  ? 'bg-white text-neutral-900 shadow-2xs hover:bg-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              Satellite
            </Button>
          </div>

          {/* Open In Google Maps Button */}
          <Button
            asChild
            size="sm"
            className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-xs gap-1.5"
          >
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </Button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[360px] rounded-3xl overflow-hidden border border-neutral-200 shadow-inner">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Nearby Campus Distance Pill */}
        {nearest.campus && Number(nearest.km) < 8 && (
          <div className="absolute bottom-4 left-4 z-10">
            <Badge
              variant="secondary"
              className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-neutral-200 shadow-md flex items-center gap-2 text-xs font-normal hover:bg-white"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-neutral-900">{nearest.campus.shortName}</span>
                <span className="text-neutral-500 ml-1">({nearest.km} km away)</span>
              </div>
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-neutral-600">
        <Card className="bg-neutral-50 p-3 rounded-2xl border-neutral-100 flex flex-row items-center gap-2.5 shadow-none">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
            🎓
          </div>
          <div>
            <div className="font-bold text-neutral-900">Campus Proximity</div>
            <div className="text-neutral-500">{distanceToCampus || 'Walking distance'}</div>
          </div>
        </Card>

        <Card className="bg-neutral-50 p-3 rounded-2xl border-neutral-100 flex flex-row items-center gap-2.5 shadow-none">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
            🚶
          </div>
          <div>
            <div className="font-bold text-neutral-900">Walkable Area</div>
            <div className="text-neutral-500">Supermarket, Cafes & Library nearby</div>
          </div>
        </Card>

        <Card className="bg-neutral-50 p-3 rounded-2xl border-neutral-100 flex flex-row items-center gap-2.5 shadow-none">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
            🚇
          </div>
          <div>
            <div className="font-bold text-neutral-900">Transit Access</div>
            <div className="text-neutral-500">Direct subway / bus connectivity</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
