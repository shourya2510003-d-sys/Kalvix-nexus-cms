import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import HomeClient from './HomeClient';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';
import WhatsAppWidget from './WhatsAppWidget';
import AppPopup from './AppPopup';

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
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <HomeClient {...props} />
              </main>
              <Footer />
            </div>
            <ChatbotWidget />
            <WhatsAppWidget />
            <AppPopup />
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
