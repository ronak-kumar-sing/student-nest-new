'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing } from '@/types/listing';

interface WishlistContextType {
  wishlist: Listing[];
  wishlistCount: number;
  isSaved: (listingId: string) => boolean;
  toggleWishlist: (listing: Listing) => void;
  removeFromWishlist: (listingId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'studentnest_saved_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Listing[]>([]);

  // Load persisted wishlist on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading wishlist from storage:', e);
    }
  }, []);

  const saveToStorage = useCallback((items: Listing[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, []);

  const isSaved = useCallback(
    (listingId: string) => {
      return wishlist.some((item) => String(item.id) === String(listingId));
    },
    [wishlist],
  );

  const toggleWishlist = useCallback(
    (listing: Listing) => {
      setWishlist((prev) => {
        const exists = prev.some((item) => String(item.id) === String(listing.id));
        let next: Listing[];
        if (exists) {
          next = prev.filter((item) => String(item.id) !== String(listing.id));
        } else {
          next = [listing, ...prev];
        }
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage],
  );

  const removeFromWishlist = useCallback(
    (listingId: string) => {
      setWishlist((prev) => {
        const next = prev.filter((item) => String(item.id) !== String(listingId));
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage],
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent
    }
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isSaved,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
