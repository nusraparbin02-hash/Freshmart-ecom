'use client';

import React from 'react';
import { InventoryIntake } from '../../components/admin/InventoryIntake';
import { ProductRegistry } from '../../components/admin/ProductRegistry';
import { LiveOrders } from '../../components/admin/LiveOrders';
import { LayoutDashboard, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-800 text-white p-2 rounded-xl">
            <LayoutDashboard className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-none text-gray-900">Fresh Mart Admin Desk</h1>
            <span className="text-[10px] text-gray-500 font-semibold">Store-Floor Control & Operations</span>
          </div>
        </div>

        {/* Navigation back to storefront */}
        <Link
          href="/"
          className="flex items-center space-x-1.5 border border-gray-200 hover:border-gray-300 hover:text-[#16A34A] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Storefront</span>
        </Link>
      </header>

      {/* Main Administrative dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Banner Alert */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Back-Of-House Grocery Operations</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              Process hardware barcode scans in bulk, edit active catalog pricing/stock tables inline, 
              and update packing pipeline queues to archive completed slots.
            </p>
          </div>
          
          <Link
            href="/admin/analytics"
            className="flex items-center space-x-1 bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Launch Financial Analytics</span>
          </Link>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Column A (Intake & Registry) - takes 2 cols on wide screens */}
          <div className="xl:col-span-2 space-y-6">
            <InventoryIntake />
            <ProductRegistry />
          </div>

          {/* Column B (Queue Monitor) - takes 1 col on wide screens */}
          <div className="xl:col-span-1">
            <LiveOrders />
          </div>
        </div>
      </main>
    </div>
  );
}
