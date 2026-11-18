'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import WeatherIcon from './WeatherIcon';
import {
  convertTemperature,
  type DailyForecastSummary,
  type TemperatureUnit,
} from '@/lib/weather-utils';

interface ForecastGridProps {
  days: DailyForecastSummary[];
  unit: TemperatureUnit;
  isLightTheme: boolean;
}

export default function ForecastGrid({
  days,
  unit,
  isLightTheme,
}: ForecastGridProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  if (days.length === 0) return null;

  const titleText = isLightTheme ? 'text-slate-900' : 'text-white';
  const subText = isLightTheme ? 'text-slate-700' : 'text-white/80';
  const mutedText = isLightTheme ? 'text-slate-600' : 'text-white/65';
  const selectedRing = isLightTheme
    ? 'ring-2 ring-slate-900/60 bg-white/85'
    : 'ring-2 ring-white/60 bg-white/20';

  return (
    <section aria-label="5-Day Weather Forecast" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={`font-display text-xl sm:text-2xl font-bold tracking-tight ${titleText}`}>
          5-Day Forecast
        </h2>
        <span className={`text-xs sm:text-sm font-medium ${mutedText}`}>
          Daily highs &amp; lows
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
              <div className="min-w-[84px]">
                <p className={`font-display text-base font-semibold ${titleText}`}>
                  {day.dayName}
                </p>
                <p className={`text-xs font-medium ${mutedText}`}>
                  {day.dateLabel}
                </p>
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
    </section>
  );
}
