'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Droplets, Wind, X } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  convertTemperature,
  formatHourLabel,
  getLocalDateKey,
  type DailyForecastSummary,
  type ForecastEntry,
  type TemperatureUnit,
} from '@/lib/weather-utils';

interface ForecastGridProps {
  days: DailyForecastSummary[];
  forecastEntries?: ForecastEntry[];
  timezoneOffset?: number;
  unit: TemperatureUnit;
  isLightTheme: boolean;
}

export default function ForecastGrid({
  days,
  forecastEntries = [],
  timezoneOffset = 0,
  unit,
  isLightTheme,
}: ForecastGridProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const selectedDay = useMemo(
    () => days.find((d) => d.dateKey === selectedDateKey) || null,
    [days, selectedDateKey]
  );

  const selectedDayEntries = useMemo(() => {
    if (!selectedDateKey || forecastEntries.length === 0) return [];
    return forecastEntries.filter(
      (entry) => getLocalDateKey(entry.dt, timezoneOffset) === selectedDateKey
    );
  }, [selectedDateKey, forecastEntries, timezoneOffset]);

  if (days.length === 0) return null;

  const titleText = isLightTheme ? 'text-slate-900' : 'text-white';
  const subText = isLightTheme ? 'text-slate-700' : 'text-white/80';
  const mutedText = isLightTheme ? 'text-slate-600' : 'text-white/65';
  const selectedRing = isLightTheme
    ? 'ring-2 ring-slate-900/60 bg-white/85'
    : 'ring-2 ring-white/70 bg-white/20';

  return (
    <section aria-label="5-Day Weather Forecast" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={`font-display text-xl sm:text-2xl font-bold tracking-tight ${titleText}`}>
          5-Day Forecast
        </h2>
        <span className={`text-xs sm:text-sm font-medium ${mutedText}`}>
          Click a day for 3-hour details
        </span>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4"
        data-testid="forecast-grid"
      >
        {days.map((day, idx) => {
          const maxTemp = convertTemperature(day.tempMaxC, unit);
          const minTemp = convertTemperature(day.tempMinC, unit);
          const isSelected = selectedDateKey === day.dateKey;

          return (
            <motion.button
              key={day.dateKey}
              type="button"
              onClick={() =>
                setSelectedDateKey((prev) =>
                  prev === day.dateKey ? null : day.dateKey
                )
              }
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                duration: 0.28,
                delay: idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              aria-pressed={isSelected}
              className={`glass-card rounded-2xl p-4 sm:p-5 text-left flex sm:flex-col items-center sm:items-stretch justify-between gap-3 cursor-pointer ${
                isSelected ? selectedRing : ''
              }`}
              data-testid="forecast-card"
            >
              {/* Day & Date */}
              <div className="min-w-[84px] flex items-center justify-between">
                <div>
                  <p className={`font-display text-base font-semibold ${titleText}`}>
                    {day.dayName}
                  </p>
                  <p className={`text-xs font-medium ${mutedText}`}>
                    {day.dateLabel}
                  </p>
                </div>
                <ChevronDown
                  className={`hidden sm:block w-4 h-4 transition-transform duration-200 ${mutedText} ${
                    isSelected ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </div>

              {/* Icon & Condition */}
              <div className="flex items-center sm:flex-col sm:items-center gap-2 sm:py-1">
                <WeatherIcon
                  iconCode={day.icon}
                  alt={day.description}
                  size={64}
                  className="w-12 h-12 sm:w-16 sm:h-16"
                />
                <div className="sm:text-center">
                  <p className={`text-sm font-semibold ${titleText}`}>
                    {day.condition}
                  </p>
                  <p className={`text-xs capitalize hidden sm:block ${mutedText}`}>
                    {day.description}
                  </p>
                </div>
              </div>

              {/* High / Low Temperatures */}
              <div className="flex items-center justify-end sm:justify-between gap-3 pt-0 sm:pt-2 sm:border-t sm:border-current/10">
                <div className="text-right sm:text-left">
                  <span className={`block text-[11px] font-medium ${mutedText}`}>
                    High
                  </span>
                  <span
                    className={`font-mono text-base sm:text-lg font-bold tabular-nums ${titleText}`}
                    data-testid="forecast-high"
                  >
                    {maxTemp}°{unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`block text-[11px] font-medium ${mutedText}`}>
                    Low
                  </span>
                  <span
                    className={`font-mono text-base sm:text-lg font-medium tabular-nums ${subText}`}
                    data-testid="forecast-low"
                  >
                    {minTemp}°{unit}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Expandable 3-Hour Day Breakdown */}
      <AnimatePresence>
        {selectedDay && selectedDayEntries.length > 0 && (
          <motion.div
            key={selectedDay.dateKey}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className={`font-display text-base font-bold ${titleText}`}>
                    {selectedDay.dayName}, {selectedDay.dateLabel} — 3-Hour Breakdown
                  </h3>
                  <p className={`text-xs capitalize ${mutedText}`}>
                    {selectedDay.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(null)}
                  aria-label="Close day breakdown"
                  className={`p-1.5 rounded-lg hover:bg-white/10 cursor-pointer ${mutedText}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 thin-scrollbar">
                {selectedDayEntries.map((entry) => {
                  const cond = entry.weather[0] || {
                    main: 'Clear',
                    description: 'clear sky',
                    icon: '01d',
                  };
                  return (
                    <div
                      key={entry.dt}
                      className="glass-card rounded-xl px-3.5 py-3 min-w-[110px] flex flex-col items-center gap-1.5 shrink-0"
                    >
                      <span className={`text-xs font-semibold ${mutedText}`}>
                        {formatHourLabel(entry.dt, timezoneOffset)}
                      </span>
                      <WeatherIcon
                        iconCode={cond.icon}
                        alt={cond.description}
                        size={40}
                        className="w-10 h-10"
                      />
                      <span className={`font-mono text-base font-bold tabular-nums ${titleText}`}>
                        {convertTemperature(entry.main.temp, unit)}°{unit}
                      </span>
                      <div className={`flex items-center gap-2 text-[11px] ${mutedText}`}>
                        <span className="inline-flex items-center gap-0.5">
                          <Droplets className="w-3 h-3" aria-hidden="true" />
                          {entry.main.humidity}%
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Wind className="w-3 h-3" aria-hidden="true" />
                          {entry.wind.speed.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
