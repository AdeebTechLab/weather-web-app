'use client';

import React from 'react';
import { History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecentSearchesProps {
  searches: string[];
  activeCity?: string;
  onSelectCity: (city: string) => void;
  onClearHistory: () => void;
  isLightTheme: boolean;
}

export default function RecentSearches({
  searches,
  activeCity,
  onSelectCity,
  onClearHistory,
  isLightTheme,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  const labelClass = isLightTheme ? 'text-slate-700' : 'text-white/75';
  const chipBase = isLightTheme
    ? 'bg-white/65 hover:bg-white text-slate-900 border-slate-900/15'
    : 'bg-white/12 hover:bg-white/22 text-white border-white/20';
  const chipActive = isLightTheme
    ? 'bg-slate-900 text-white border-slate-900'
    : 'bg-white text-slate-900 border-white';
  const clearBtn = isLightTheme
    ? 'text-slate-600 hover:text-slate-900'
    : 'text-white/65 hover:text-white';

  return (
    <nav
      aria-label="Recent searches"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium mr-1 ${labelClass}`}>
          <History className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Recent:</span>
        </span>

        <AnimatePresence initial={false}>
          {searches.map((city) => {
            const isActive =
              activeCity && activeCity.toLowerCase() === city.toLowerCase();
            return (
              <motion.button
                key={city}
                layout
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                type="button"
                onClick={() => onSelectCity(city)}
                aria-label={`Load weather for ${city}`}
                className={`h-8 px-3.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive ? chipActive : chipBase
                }`}
              >
                {city}
              </motion.button>
            );
          })}
        </AnimatePresence>

        <button
          type="button"
          onClick={onClearHistory}
          aria-label="Clear recent searches"
          className={`h-8 px-2.5 inline-flex items-center gap-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${clearBtn}`}
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Clear</span>
        </button>
      </div>
    </nav>
  );
}
