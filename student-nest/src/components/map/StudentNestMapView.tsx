'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  X,
  MapPin,
  Layers,
  GraduationCap,
  Maximize2,
  Navigation,
  ExternalLink,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { CAMPUS_LANDMARKS, CampusLandmark } from '@/data/campusLandmarks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  listings: Listing[];
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  highlightedListingId?: string;
  onSelectListing?: (listing: Listing) => void;
  className?: string;
}

type MapLayerType = 'voyager' | 'osm' | 'satellite';

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

export default function StudentNestMapView({
  listings,
  initialCenter,
  initialZoom = 13,
  highlightedListingId,
  onSelectListing,
  className = '',
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const campusLayerRef = useRef<any>(null);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('voyager');
  const [showCampuses, setShowCampuses] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Sync selected listing if highlightedListingId changes
  useEffect(() => {
    if (highlightedListingId) {
      const match = listings.find((l) => l.id === highlightedListingId);
      if (match) setSelectedListing(match);
    }
  }, [highlightedListingId, listings]);

  // Determine initial coordinates based on listings
  const getCenterCoords = () => {
    if (initialCenter) return [initialCenter.lat, initialCenter.lng];
    if (listings.length > 0 && listings[0].location?.lat && listings[0].location?.lng) {
      const valid = listings.filter((l) => l.location?.lat && l.location?.lng);
      if (valid.length > 0) {
        const avgLat = valid.reduce((acc, cur) => acc + cur.location.lat, 0) / valid.length;
        const avgLng = valid.reduce((acc, cur) => acc + cur.location.lng, 0) / valid.length;
        return [avgLat, avgLng];
      }
    }
    // Default fallback to Cambridge / Boston
    return [42.3736, -71.1189];
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Check if map instance is already initialized
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const center = getCenterCoords();
      const map = L.map(mapContainerRef.current, {
        center: [center[0], center[1]],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Custom Zoom Control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Tile Layer
      const initialLayerConfig = TILE_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(initialLayerConfig.url, {
        attribution: initialLayerConfig.attribution,
        maxZoom: initialLayerConfig.maxZoom,
        subdomains: 'abcd',
      }).addTo(map);

      // Create LayerGroups for markers and campuses
      const markersLayer = L.layerGroup().addTo(map);
      const campusLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;
      campusLayerRef.current = campusLayer;

      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    import('leaflet').then((L) => {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const cfg = TILE_LAYERS[activeLayer];
      const newLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        maxZoom: cfg.maxZoom,
        subdomains: 'abcd',
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    });
  }, [activeLayer, mapLoaded]);

  // Update Listing Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mapLoaded) return;

    import('leaflet').then((L) => {
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();

      const validListings = listings.filter((l) => l.location?.lat && l.location?.lng);
      if (validListings.length === 0) return;

      const bounds = L.latLngBounds([]);

      validListings.forEach((listing) => {
        const isSelected = selectedListing?.id === listing.id;
        const lat = listing.location.lat;
        const lng = listing.location.lng;

        bounds.extend([lat, lng]);

        // Currency format
        const formattedPrice =
          listing.pricePerMonth > 4000
            ? `₹${listing.pricePerMonth.toLocaleString('en-IN')}`
            : `$${listing.pricePerMonth.toLocaleString()}`;

        const pillHtml = `
          <div class="studentnest-marker-pill ${isSelected ? 'selected' : ''}" id="marker-${listing.id}">
            ${formattedPrice}
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'studentnest-price-marker',
          html: pillHtml,
          iconSize: [80, 36],
          iconAnchor: [40, 18],
        });

        const marker = L.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 100,
        });

        marker.on('click', () => {
          setSelectedListing(listing);
          if (onSelectListing) onSelectListing(listing);
          mapInstanceRef.current?.flyTo([lat, lng], 15, { duration: 0.8 });
        });

        markersLayer.addLayer(marker);
      });

      // If no listing is specifically selected, auto-fit to show all
      if (!selectedListing && validListings.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    });
  }, [listings, selectedListing, mapLoaded]);

  // Update Campus Landmark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !campusLayerRef.current || !mapLoaded) return;

    import('leaflet').then((L) => {
      const campusLayer = campusLayerRef.current;
      campusLayer.clearLayers();

      if (!showCampuses) return;

      // Filter campuses that match the cities of current listings or active viewport
      const listingCities = new Set(listings.map((l) => l.location?.city?.toLowerCase()).filter(Boolean));

      CAMPUS_LANDMARKS.forEach((campus) => {
        const cityMatch =
          listingCities.size === 0 ||
          listingCities.has(campus.city.toLowerCase()) ||
          listingCities.has('cambridge') ||
          listingCities.has('boston') ||
          listingCities.has('pune') ||
          listingCities.has('delhi');

        if (!cityMatch) return;

        const campusHtml = `
          <div class="studentnest-campus-pill" title="${campus.name}">
            <span>🎓</span>
            <span>${campus.shortName}</span>
          </div>
        `;

        const campusIcon = L.divIcon({
          className: 'studentnest-price-marker',
          html: campusHtml,
          iconSize: [110, 30],
          iconAnchor: [55, 15],
        });

        const marker = L.marker([campus.lat, campus.lng], {
          icon: campusIcon,
          zIndexOffset: 50,
        });

        marker.bindPopup(`
          <div style="padding: 10px 14px; font-family: inherit;">
            <div style="font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em;">University Campus</div>
            <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 2px;">${campus.name}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Prime student housing district • High transit access</div>
          </div>
        `);

        campusLayer.addLayer(marker);
      });
    });
  }, [showCampuses, listings, mapLoaded]);

  // Center map on user location
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.2 });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not access your location. Please check your browser permissions.');
      },
      { timeout: 8000 }
    );
  };

  // Reset View to all listings
  const handleResetBounds = () => {
    if (!mapInstanceRef.current || listings.length === 0) return;
    import('leaflet').then((L) => {
      const valid = listings.filter((l) => l.location?.lat && l.location?.lng);
      if (valid.length === 0) return;
      const bounds = L.latLngBounds(valid.map((l) => [l.location.lat, l.location.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      setSelectedListing(null);
    });
  };

  // Google Maps transit query link
  const getGoogleMapsUrl = (lat: number, lng: number, title?: string) => {
    const q = title ? `${title}, ${lat},${lng}` : `${lat},${lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  };

  return (
    <div
      className={`relative w-full h-[calc(100vh-160px)] min-h-[580px] bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-300 shadow-md ${className}`}
    >
      {/* MAP CANVAS CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* TOP FLOATING CONTROLS TOOLBAR */}
      <TooltipProvider>
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)]">
          {/* Layer Switcher */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-neutral-200/80 flex items-center gap-1 text-xs">
            <Button
              variant={activeLayer === 'voyager' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveLayer('voyager')}
              className={`h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-all ${
                activeLayer === 'voyager'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Clean Map</span>
            </Button>
            <Button
              variant={activeLayer === 'osm' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveLayer('osm')}
              className={`h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-all ${
                activeLayer === 'osm'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>🌍</span>
              <span className="hidden sm:inline">OSM</span>
            </Button>
            <Button
              variant={activeLayer === 'satellite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveLayer('satellite')}
              className={`h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-all ${
                activeLayer === 'satellite'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>🛰️</span>
              <span className="hidden sm:inline">Satellite</span>
            </Button>
          </div>

          {/* Campus Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCampuses ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCampuses(!showCampuses)}
                className={`h-9 px-3 rounded-2xl text-xs font-bold gap-1.5 shadow-md transition-all ${
                  showCampuses
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                    : 'bg-white/95 backdrop-blur-md text-neutral-700 border-neutral-200/80 hover:bg-white hover:text-neutral-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Campuses</span>
                <span className="text-[10px] opacity-80">({CAMPUS_LANDMARKS.length})</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle university campus markers</p>
            </TooltipContent>
          </Tooltip>

          {/* Fit Bounds Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetBounds}
                className="w-9 h-9 rounded-2xl bg-white/95 backdrop-blur-md text-neutral-700 hover:text-neutral-900 hover:bg-white shadow-md border-neutral-200/80 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Fit all listings in view</p>
            </TooltipContent>
          </Tooltip>

          {/* Locate Me */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="w-9 h-9 rounded-2xl bg-white/95 backdrop-blur-md text-neutral-700 hover:text-neutral-900 hover:bg-white shadow-md border-neutral-200/80 transition-all"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-blue-600' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Center on my location</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* STAYS COUNT BADGE */}
      <div className="absolute top-4 right-14 z-20 hidden md:block">
        <Badge
          variant="secondary"
          className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-neutral-200/80 shadow-md text-xs font-bold text-neutral-800 gap-2 hover:bg-white"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{listings.length} Stays Pinpointed</span>
        </Badge>
      </div>

      {/* SELECTED LISTING FLOATING PREVIEW CARD */}
      {selectedListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
          <Card className="bg-white rounded-3xl shadow-2xl border border-neutral-200/90 p-3.5 relative flex gap-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Close Button */}
            <Button
              variant="default"
              size="icon"
              onClick={() => setSelectedListing(null)}
              className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-neutral-900 hover:bg-black text-white shadow-md z-10"
              aria-label="Close preview"
            >
              <X className="w-3.5 h-3.5" />
            </Button>

            {/* Thumbnail */}
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-neutral-100">
              <Image
                src={selectedListing.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}
                alt={selectedListing.title}
                fill
                className="object-cover"
              />
              {selectedListing.guestFavorite && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[9px] font-bold text-neutral-900 shadow-2xs border-0"
                >
                  Guest favorite
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1 font-bold text-neutral-900">
                    <Star className="w-3 h-3 fill-neutral-900 stroke-none" />
                    <span>{selectedListing.rating ? selectedListing.rating.toFixed(2) : '5.00'}</span>
                    <span className="text-neutral-400 font-normal">({selectedListing.reviewCount || 12})</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold text-neutral-500 bg-neutral-50 border-neutral-200 px-2 py-0.5 rounded-md">
                    {selectedListing.location.city}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-neutral-900 line-clamp-1 mt-1">
                  {selectedListing.title}
                </h4>

                <p className="text-xs text-neutral-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#FF385C] shrink-0" />
                  <span>{selectedListing.location.distanceToCampus || selectedListing.location.neighborhood}</span>
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 mt-2">
                <div>
                  <span className="text-sm font-extrabold text-neutral-900">
                    {selectedListing.pricePerMonth > 4000
                      ? `₹${selectedListing.pricePerMonth.toLocaleString('en-IN')}`
                      : `$${selectedListing.pricePerMonth.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-neutral-500"> / mo</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getGoogleMapsUrl(
                      selectedListing.location.lat,
                      selectedListing.location.lng,
                      selectedListing.title
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open exact location and directions in Google Maps"
                    className="p-2 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Button
                    asChild
                    size="sm"
                    className="h-8 px-3.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold shadow-xs gap-1"
                  >
                    <Link href={`/rooms/${selectedListing.id}`}>
                      <span>View Stay</span>
                      <span>→</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
