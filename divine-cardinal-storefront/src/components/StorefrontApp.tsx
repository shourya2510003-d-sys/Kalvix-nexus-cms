import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import HomeClient from './HomeClient';

interface StorefrontAppProps {
  banners: any[];
  bestSellers: any[];
  initialLayout?: any[];
}

export default function StorefrontApp(props: StorefrontAppProps) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <HomeClient {...props} />
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
