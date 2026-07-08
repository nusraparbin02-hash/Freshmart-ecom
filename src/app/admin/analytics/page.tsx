'use client';

import React from 'react';
import { AnalyticsDashboard } from '../../../components/admin/AnalyticsDashboard';
import { LayoutDashboard, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-[#16A34A] text-white p-2 rounded-xl">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-none text-gray-900">Fresh Mart Analytics</h1>
            <span className="text-[10px] text-gray-500 font-semibold">Financial Performance & Tickets</span>
          </div>
        </div>

        {/* Back navigation */}
        <Link
          href="/admin"
          className="flex items-center space-x-1.5 border border-gray-200 hover:border-gray-300 hover:text-gray-900 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Operations Hub</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900">Financial Reports Console</h2>
          <p className="text-xs text-gray-500 mt-1">
            Aggregated gross store revenue charts synced in real-time with completed order queue archives.
          </p>
        </div>

        {/* Recharts Analytics Panel */}
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
