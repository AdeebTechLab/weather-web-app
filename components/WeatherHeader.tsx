'use client';

import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import { CloudSun, Search, MapPin, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { TemperatureUnit } from '@/lib/weather-utils';

interface WeatherHeaderProps {
  onSearch: (city: string) => void;
  onUseLocation: () => void;
  unit: TemperatureUnit;
  onToggleUnit: (unit: TemperatureUnit) => void;
  isLoading: boolean;
  isLightTheme: boolean;
}

export default function WeatherHeader({
  onSearch,
  onUseLocation,
  unit,
  onToggleUnit,
  isLoading,
  isLightTheme,
}: WeatherHeaderProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  const surfaceText = isLightTheme ? 'text-slate-900' : 'text-white';
  const mutedText = isLightTheme ? 'text-slate-600' : 'text-white/75';
  const inputBg = isLightTheme
    ? 'bg-white/80 text-slate-900 placeholder:text-slate-500 border-slate-900/15 focus:border-sky-600'
    : 'bg-white/12 text-white placeholder:text-white/60 border-white/20 focus:border-white/50';
  const toggleWrap = isLightTheme
    ? 'bg-slate-900/10 border-slate-900/15'
    : 'bg-white/10 border-white/20';
  const toggleActive = isLightTheme
    ? 'bg-slate-900 text-white shadow-sm'
    : 'bg-white text-slate-900 shadow-sm';
  const toggleInactive = isLightTheme
    ? 'text-slate-700 hover:text-slate-950'
    : 'text-white/80 hover:text-white';
  const locationBtn = isLightTheme
    ? 'bg-white/75 hover:bg-white text-slate-900 border-slate-900/15'
    : 'bg-white/12 hover:bg-white/22 text-white border-white/20';
  const searchBtn = isLightTheme
    ? 'bg-slate-900 hover:bg-slate-800 text-white'
    : 'bg-white text-slate-900 hover:bg-white/90';

  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand Logo + Name */}
          <div className="flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isLightTheme ? 'bg-sky-600 text-white' : 'bg-white/15 text-amber-300'
                }`}
              >
                <CloudSun className="w-5 h-5" aria-hidden="true" />
              </div>
              <span
                className={`font-display text-xl font-bold tracking-tight whitespace-nowrap shrink-0 ${surfaceText}`}
              >
                WeatherNow
              </span>
            </div>

            {/* Mobile unit switch beside logo on small screens */}
            <div
              className={`flex lg:hidden items-center p-1 rounded-xl border ${toggleWrap}`}
              role="group"
              aria-label="Temperature unit"
            >
              <button
                type="button"
                onClick={() => onToggleUnit('C')}
                aria-pressed={unit === 'C'}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  unit === 'C' ? toggleActive : toggleInactive
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => onToggleUnit('F')}
                aria-pressed={unit === 'F'}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  unit === 'F' ? toggleActive : toggleInactive
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 flex-1 max-w-xl w-full"
            role="search"
            aria-label="City weather search"
          >
            <div className="relative flex-1 min-w-0">
              <label htmlFor="city-search-input" className="sr-only">
                City name
              </label>
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${mutedText}`}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="city-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any city worldwide..."
                autoComplete="off"
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm font-medium outline-none transition-colors ${inputBg}`}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer ${mutedText} hover:opacity-100`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : (
                <kbd
                  className={`hidden sm:inline-flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono rounded border pointer-events-none opacity-65 ${
                    isLightTheme
                      ? 'border-slate-900/20 text-slate-700 bg-slate-900/5'
                      : 'border-white/25 text-white bg-white/10'
                  }`}
                >
                  /
                </kbd>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`h-11 px-4 sm:px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${searchBtn}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : null}
              <span>Search</span>
            </button>
          </form>

          {/* Controls: Unit Toggle (desktop) + Use My Location */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`hidden lg:flex items-center p-1 rounded-xl border ${toggleWrap}`}
              role="group"
              aria-label="Temperature unit"
            >
              {(['C', 'F'] as const).map((u) => {
                const active = unit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => onToggleUnit(u)}
                    aria-pressed={active}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active ? (isLightTheme ? 'text-white' : 'text-slate-900') : toggleInactive
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktop-unit-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className={`absolute inset-0 rounded-lg ${toggleActive}`}
                      />
                    )}
                    <span className="relative z-10">°{u}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onUseLocation}
              disabled={isLoading}
              className={`h-11 px-4 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer w-full sm:w-auto disabled:opacity-55 ${locationBtn}`}
            >
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Use My Location</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
