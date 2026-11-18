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
  const condition = weather.weather[0] || {
    id: 800,
    main: 'Clear',
    description: 'clear sky',
    icon: '01d',
  };

  const displayTemp = convertTemperature(weather.main.temp, unit);
  const displayFeelsLike = convertTemperature(weather.main.feels_like, unit);
  const localDateTime = formatCityLocalDateTime(weather.dt, weather.timezone);
  const sunriseTime = weather.sys.sunrise
    ? formatSunTime(weather.sys.sunrise, weather.timezone)
    : '—';
  const sunsetTime = weather.sys.sunset
    ? formatSunTime(weather.sys.sunset, weather.timezone)
    : '—';
  const visibilityKm =
    typeof weather.visibility === 'number'
      ? `${(weather.visibility / 1000).toFixed(1)} km`
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
      value: `${weather.wind.speed.toFixed(1)} m/s`,
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
              <span
                className={`font-display text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none ${titleText}`}
                data-testid="current-temperature"
              >
                {displayTemp}°{unit}
              </span>
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
        {metrics.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
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
          </div>
        ))}
      </div>
    </motion.section>
  );
}
