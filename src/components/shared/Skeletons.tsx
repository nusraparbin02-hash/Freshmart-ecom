import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse flex flex-col justify-between h-[360px]">
      <div>
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
      </div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-[320px] bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-12" />
          <div className="h-8 bg-gray-200 rounded w-12" />
          <div className="h-8 bg-gray-200 rounded w-12" />
        </div>
      </div>
      <div className="flex-1 flex items-end space-x-3 h-48">
        <div className="h-[25%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[45%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[30%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[65%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[50%] bg-gray-200 rounded-t flex-1" />
        <div className="h-[80%] bg-gray-200 rounded-t flex-1" />
      </div>
      <div className="flex justify-between mt-4">
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-8" />
      </div>
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white animate-pulse mb-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-48" />
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}
