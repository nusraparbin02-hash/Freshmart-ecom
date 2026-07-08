import React from 'react';

// Skeletons mimicking 3 KPI summary cards and a large Area chart
export function DashboardAnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* 3 KPI Summary Cards Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between h-24">
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-gray-100 rounded w-1/2" />
              <div className="h-6 bg-gray-100 rounded w-3/4" />
            </div>
            <div className="bg-gray-150 h-10 w-10 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Main Chart Area Shimmer */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[400px] flex flex-col justify-between">
        {/* Selector Header shimmer */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-100 rounded w-1/3" />
            <div className="h-3.5 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="h-8 bg-gray-100 rounded-xl w-48" />
        </div>

        {/* Pulsing bars/area chart backdrop outline */}
        <div className="flex-1 flex items-end justify-between gap-4 py-8 h-full">
          <div className="h-[20%] bg-gray-100 rounded-t-lg flex-1" />
          <div className="h-[35%] bg-gray-100 rounded-t-lg flex-1 animate-pulse delay-75" />
          <div className="h-[50%] bg-gray-100 rounded-t-lg flex-1 animate-pulse delay-100" />
          <div className="h-[40%] bg-gray-100 rounded-t-lg flex-1 animate-pulse delay-150" />
          <div className="h-[65%] bg-gray-100 rounded-t-lg flex-1 animate-pulse delay-200" />
          <div className="h-[80%] bg-gray-100 rounded-t-lg flex-1 animate-pulse delay-300" />
          <div className="h-[55%] bg-gray-100 rounded-t-lg flex-1 animate-pulse" />
        </div>

        {/* Labels shimmer */}
        <div className="flex justify-between border-t border-gray-100 pt-4 text-[10px]">
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-8" />
        </div>
      </div>
    </div>
  );
}

// Skeletons mimicking storefront category selectors and card grid layout
export function StorefrontGridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Category tabs container shimmer */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-full w-16 shrink-0" />
          ))}
        </div>
        <div className="h-8 bg-gray-100 rounded-xl w-full md:w-60" />
      </div>

      {/* Grid items list cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between h-[360px]">
            <div className="space-y-3">
              {/* Category pill shimmer */}
              <div className="h-4 bg-gray-100 rounded-full w-16" />
              {/* Title shimmer */}
              <div className="h-5 bg-gray-100 rounded w-3/4" />
              {/* Description shimmer lines */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>

            {/* Price and button shimmer */}
            <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-100 rounded w-1/4" />
                <div className="h-5 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-9 bg-gray-100 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
