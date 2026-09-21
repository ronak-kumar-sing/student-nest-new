export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'essentials' | 'features' | 'safety' | 'location';
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  rating: number;
  comment: string;
  stayDuration?: string;
}

export interface Host {
  id?: string;
  name: string;
  avatar: string;
  isSuperhost: boolean;
  yearsHosting: number;
  responseRate: string;
  responseTime: string;
  verified: boolean;
  bio: string;
}

export interface Listing {
  id: string;
  title: string;
  type: string; // e.g. "Entire student suite", "Private studio near campus"
  location: {
    city: string;
    neighborhood: string;
    distanceToCampus: string;
    lat: number;
    lng: number;
  };
  pricePerMonth: number;
  pricePerNight?: number;
  securityDeposit?: number;
  address?: string;
  city?: string;
  rating: number;
  reviewCount: number;
  guestFavorite: boolean;
  images: string[];
  category: string; // e.g. "Trending", "Near Campus", "Luxury", "Budget", "Studios", "Pet Friendly"
  beds: number;
  baths: number;
  maxGuests: number;
  description: string;
  host: Host;
  amenities: Amenity[];
  ratingsBreakdown: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    checkIn: number;
    value: number;
  };
  reviews: Review[];
  availableDates: string;
}

export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  bedrooms?: number;
  amenities?: string[];
}
