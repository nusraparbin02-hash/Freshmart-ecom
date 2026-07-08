'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CatalogDesk } from '../components/storefront/CatalogDesk';
import { CartDrawer } from '../components/storefront/CartDrawer';
import { ShoppingCart, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { cart } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] font-sans antialiased">
      {/* Dynamic Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-[#16A34A] text-white p-2 rounded-xl">
            <span className="font-black text-sm tracking-tight">FM</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-none text-gray-900">Fresh Mart</h1>
            <span className="text-[10px] text-gray-500 font-semibold">Hyperlocal Grocery Platform</span>
          </div>
        </div>

        {/* Top Actions Desk */}
        <div className="flex items-center space-x-3">
          {/* Quick Admin route link */}
          <Link
            href="/admin"
            className="flex items-center space-x-1 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm bg-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Store Operations Hub</span>
          </Link>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span className="font-bold text-xs hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-white text-[#16A34A] font-extrabold text-[10px] h-4.5 w-4.5 rounded-full flex items-center justify-center animate-bounce ml-0.5">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Banner Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Fresh Groceries, Delivered Fast</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Browse organic fruits, fresh dairy products, artisanal sourdough bakery, meats, and pantry essentials. 
              Schedule your pickup or delivery slot directly at checkout.
            </p>
          </div>
        </div>

        {/* Catalog Search & Grid component */}
        <CatalogDesk />
      </main>

      {/* Slide-out Cart Drawer overlay component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          setIsCheckingOut(false);
        }}
        isCheckingOut={isCheckingOut}
        setIsCheckingOut={setIsCheckingOut}
      />
    </div>
  );
}
