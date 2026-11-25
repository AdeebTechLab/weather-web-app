'use client';

import React from 'react';

export default function WeatherSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Fetching live weather"
      className="space-y-6"
      data-testid="loading-indicator"
    >
      {/* Hero Skeleton */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3.5 flex-1">
            <div className="h-9 w-56 sm:w-72 rounded-xl skeleton-shimmer" />
            <div className="h-4 w-48 rounded-lg skeleton-shimmer" />
            <div className="pt-2 flex items-baseline gap-4">
              <div className="h-16 w-32 rounded-2xl skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-36 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          </div>
          <div className="flex md:flex-col items-center md:items-end gap-3">
            <div className="w-24 h-24 rounded-full skeleton-shimmer" />
            <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* 6 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-4 sm:p-5 h-24 flex flex-col justify-between"
          >
            <div className="h-3.5 w-16 rounded skeleton-shimmer" />
            <div className="h-6 w-20 rounded-lg skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* 5-Day Forecast Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-4 sm:p-5 h-40 flex flex-col justify-between"
          >
            <div className="h-4 w-20 rounded skeleton-shimmer" />
            <div className="h-12 w-12 rounded-full mx-auto skeleton-shimmer" />
            <div className="h-5 w-full rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
