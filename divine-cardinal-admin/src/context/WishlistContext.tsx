'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: string; // product id
  name: string;
  slug: string;
  image?: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  removeItem: (id: string) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (isOpen: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Load from local storage initially
  useEffect(() => {
    const localWishlist = localStorage.getItem('kalvix_wishlist');
    if (localWishlist) {
      try {
        setWishlist(JSON.parse(localWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist from local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kalvix_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      setIsWishlistOpen(true);
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount, toggleWishlist, isInWishlist, clearWishlist, removeItem, isWishlistOpen, setIsWishlistOpen }}>
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
