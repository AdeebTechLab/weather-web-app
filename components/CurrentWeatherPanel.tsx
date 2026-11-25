'use client';

import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import WeatherIcon from './WeatherIcon';
import {
  convertTemperature,
  formatCityLocalDateTime,
  formatSunTime,
  getCountryName,
  getDaylightProgress,
  type CurrentWeatherData,
  type TemperatureUnit,
} from '@/lib/weather-utils';

interface CurrentWeatherPanelProps {
  weather: CurrentWeatherData;
  unit: TemperatureUnit;
  isLightTheme: boolean;
}

export default function CurrentWeatherPanel({
  weather,
  unit,
  isLightTheme,
}: CurrentWeatherPanelProps) {
  const condition = weather.weather?.[0] || {
    id: 800,
    main: 'Clear',
    description: 'clear sky',
    icon: '01d',
  };

  const displayTemp = convertTemperature(weather.main.temp, unit);
  const displayFeelsLike = convertTemperature(weather.main.feels_like, unit);
  const localDateTime = formatCityLocalDateTime(weather.dt, weather.timezone);
  const sunriseTime = weather.sys?.sunrise
    ? formatSunTime(weather.sys.sunrise, weather.timezone)
    : '—';
  const sunsetTime = weather.sys?.sunset
    ? formatSunTime(weather.sys.sunset, weather.timezone)
    : '—';
  const visibilityKm =
    typeof weather.visibility === 'number'
      ? `${(weather.visibility / 1000).toFixed(1)} km`
      : '—';
  const windSpeedText =
    typeof weather.wind?.speed === 'number'
      ? `${weather.wind.speed.toFixed(1)} m/s`
      : '—';

  const titleText = isLightTheme ? 'text-slate-900' : 'text-white';
  const subText = isLightTheme ? 'text-slate-700' : 'text-white/80';
  const mutedText = isLightTheme ? 'text-slate-600' : 'text-white/70';

  const metrics = [
    {
      label: 'Humidity',
      value: `${weather.main.humidity}%`,
      icon: Droplets,
    },
    {
      label: 'Wind Speed',
      value: windSpeedText,
      icon: Wind,
    },
    {
      label: 'Pressure',
      value: `${weather.main.pressure} hPa`,
      icon: Gauge,
    },
    {
      label: 'Visibility',
      value: visibilityKm,
      icon: Eye,
    },
    {
      label: 'Sunrise',
      value: sunriseTime,
      icon: Sunrise,
    },
    {
      label: 'Sunset',
      value: sunsetTime,
      icon: Sunset,
    },
  ];

  const countryName = getCountryName(weather.sys.country);
  const daylightProgress = getDaylightProgress(
    weather.dt,
    weather.sys.sunrise,
    weather.sys.sunset
  );

  return (
    <motion.section
      key={`${weather.name}-${weather.dt}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Current weather conditions"
      className="space-y-4"
    >
      {/* Main Weather Dashboard Hero */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Location & Local Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <MapPin className={`w-5 h-5 shrink-0 ${subText}`} aria-hidden="true" />
              <h1
                className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${titleText}`}
                data-testid="current-city-name"
              >
                {weather.name}
                {countryName ? (
                  <span className={`font-medium ${subText}`}>
                    , {countryName}
                  </span>
                ) : null}
              </h1>
            </div>

            <p className={`text-sm sm:text-base font-medium font-mono tabular-nums ${subText}`}>
              {localDateTime}
            </p>

            <div className="pt-1 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <motion.span
                key={`${displayTemp}-${unit}`}
                initial={{ opacity: 0.5, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`font-display text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none ${titleText}`}
                data-testid="current-temperature"
              >
                {displayTemp}°{unit}
              </motion.span>
              <div className="space-y-0.5">
                <p
                  className={`text-sm sm:text-base font-medium tabular-nums ${subText}`}
                  data-testid="feels-like-temperature"
                >
                  Feels like {displayFeelsLike}°{unit}
                </p>
                <p className={`text-sm capitalize font-medium ${mutedText}`}>
                  {condition.main} · {condition.description}
                </p>
              </div>
            </div>

            {/* Daylight Progress Bar */}
            {daylightProgress !== null && (
              <div className="pt-3 max-w-sm space-y-1.5">
                <div className={`flex items-center justify-between text-[11px] font-medium ${mutedText}`}>
                  <span>Sunrise {sunriseTime}</span>
                  <span>Daylight {daylightProgress}%</span>
                  <span>Sunset {sunsetTime}</span>
                </div>
                <div
                  className={`relative h-1.5 rounded-full overflow-hidden ${
                    isLightTheme ? 'bg-slate-900/15' : 'bg-white/15'
                  }`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${daylightProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${
                      isLightTheme
                        ? 'bg-gradient-to-r from-amber-500 to-sky-600'
                        : 'bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Large Official Weather Icon & Condition */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
            <div
              className={`weather-icon-float rounded-full p-2 ${
                isLightTheme
                  ? 'bg-sky-900/10 border border-sky-900/10'
                  : 'bg-white/12 border border-white/15 shadow-inner'
              }`}
            >
              <WeatherIcon
                iconCode={condition.icon}
                alt={condition.description}
                size={112}
                className="w-20 h-20 sm:w-28 sm:h-28"
              />
            </div>
            <div className="text-left md:text-right">
              <p className={`font-display text-xl sm:text-2xl font-semibold ${titleText}`}>
                {condition.main}
              </p>
              <p className={`text-sm capitalize ${mutedText}`}>
                {condition.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Weather Information Glass Cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4"
        aria-label="Atmospheric details"
      >
        {metrics.map(({ label, value, icon: Icon }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: idx * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-medium ${mutedText}`}>{label}</span>
              <Icon className={`w-4 h-4 shrink-0 ${subText}`} aria-hidden="true" />
            </div>
            <p
              className={`font-mono text-lg sm:text-xl font-semibold tabular-nums ${titleText}`}
            >
              {value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
