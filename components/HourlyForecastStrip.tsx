'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Clock, Wind } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  convertTemperature,
  formatHourLabel,
  type ForecastEntry,
  type TemperatureUnit,
} from '@/lib/weather-utils';

interface HourlyForecastStripProps {
  entries: ForecastEntry[];
  timezoneOffset: number;
  unit: TemperatureUnit;
  isLightTheme: boolean;
}

export default function HourlyForecastStrip({
  entries,
  timezoneOffset,
  unit,
  isLightTheme,
}: HourlyForecastStripProps) {
  const upcoming = entries.slice(0, 8);
  if (upcoming.length === 0) return null;

  const titleText = isLightTheme ? 'text-slate-900' : 'text-white';
  const mutedText = isLightTheme ? 'text-slate-600' : 'text-white/65';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      aria-label="24-Hour Forecast"
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          className={`font-display text-lg sm:text-xl font-bold tracking-tight inline-flex items-center gap-2 ${titleText}`}
        >
          <Clock className="w-4 h-4 opacity-80" aria-hidden="true" />
          <span>Next 24 Hours</span>
        </h2>
        <span className={`text-xs font-medium ${mutedText}`}>3-hour intervals</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 thin-scrollbar snap-x snap-mandatory">
        {upcoming.map((entry, idx) => {
          const temp = convertTemperature(entry.main.temp, unit);
          const condition = entry.weather[0] || {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          };
          const timeLabel =
            idx === 0 ? 'Soon' : formatHourLabel(entry.dt, timezoneOffset);

          return (
            <motion.div
              key={entry.dt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass-card rounded-2xl px-4 py-3.5 min-w-[104px] sm:min-w-[114px] flex flex-col items-center gap-2 snap-start shrink-0"
            >
              <span className={`text-xs font-semibold ${mutedText}`}>
                {timeLabel}
              </span>
              <WeatherIcon
                iconCode={condition.icon}
                alt={condition.description}
                size={44}
                className="w-11 h-11"
              />
              <span
                className={`font-mono text-lg font-bold tabular-nums ${titleText}`}
              >
                {temp}°{unit}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${mutedText}`}
              >
                <Wind className="w-3 h-3" aria-hidden="true" />
                {entry.wind.speed.toFixed(1)} m/s
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
