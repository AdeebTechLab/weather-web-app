'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CloudSun,
  Loader2,
  MapPin,
  X,
} from 'lucide-react';
import WeatherHeader from './WeatherHeader';
import RecentSearches from './RecentSearches';
import CurrentWeatherPanel from './CurrentWeatherPanel';
import ForecastGrid from './ForecastGrid';
import {
  RECENT_SEARCHES_KEY,
  UNIT_PREFERENCE_KEY,
  addRecentSearch,
  determineWeatherTheme,
  groupForecastByLocalDate,
  type CurrentWeatherData,
  type DailyForecastSummary,
  type ForecastResponseData,
  type TemperatureUnit,
  type WeatherTheme,
} from '@/lib/weather-utils';

const EXPLORE_CITIES = ['Tokyo', 'London', 'New York', 'Reykjavik'];

export default function WeatherDashboard() {
  const [currentWeather, setCurrentWeather] =
    useState<CurrentWeatherData | null>(null);
  const [forecastDays, setForecastDays] = useState<DailyForecastSummary[]>([]);
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  }, []);

  const saveRecentCity = useCallback((cityName: string) => {
    setRecentSearches((prev) => {
      const updated = addRecentSearch(prev, cityName);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }
      return updated;
    });
  }, []);

  const fetchWeather = useCallback(
    async (
      query: { city?: string; lat?: number; lon?: number },
      options: { saveHistory?: boolean } = { saveHistory: true }
    ) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const reqId = ++requestSeqRef.current;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const searchParams = new URLSearchParams();
        if (query.city) {
          searchParams.set('city', query.city);
        } else if (
          typeof query.lat === 'number' &&
          typeof query.lon === 'number'
        ) {
          searchParams.set('lat', String(query.lat));
          searchParams.set('lon', String(query.lon));
        }

        const res = await fetch(`/api/weather?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        const payload = await res.json().catch(() => ({}));

        if (reqId !== requestSeqRef.current) return;

        if (!res.ok) {
          const msg =
            payload.error ||
            (res.status === 404
              ? 'City not found. Please check the spelling.'
              : 'Unable to fetch weather data. Please try again.');
          setErrorMessage(msg);
          showToast(msg);
          return;
        }

        const current: CurrentWeatherData = payload.current;
        const forecast: ForecastResponseData = payload.forecast;
        const daily = groupForecastByLocalDate(
          forecast.list,
          current.timezone,
          current.dt
        );

        setCurrentWeather(current);
        setForecastDays(daily);
        setErrorMessage(null);

        if (options.saveHistory !== false && current.name) {
          saveRecentCity(current.name);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (reqId !== requestSeqRef.current) return;
        const msg =
          typeof navigator !== 'undefined' && !navigator.onLine
            ? 'You appear to be offline. Please check your internet connection.'
            : 'Network error while fetching live weather. Please try again.';
        setErrorMessage(msg);
        showToast(msg);
      } finally {
        if (reqId === requestSeqRef.current) {
          setIsLoading(false);
        }
      }
    },
    [saveRecentCity, showToast]
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedUnit = localStorage.getItem(UNIT_PREFERENCE_KEY);
        if (savedUnit === 'C' || savedUnit === 'F') {
          setUnit(savedUnit);
        }
        const rawHistory = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (rawHistory) {
          const parsed = JSON.parse(rawHistory);
          if (Array.isArray(parsed)) {
            const validCities = parsed
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
              .slice(0, 5);
            setRecentSearches(validCities);
            if (validCities.length > 0) {
              fetchWeather({ city: validCities[0] }, { saveHistory: false });
            }
          }
        }
      } catch {
        // Ignore malformed localStorage
      }
    });

    return () => {
      cancelled = true;
      if (abortRef.current) abortRef.current.abort();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [fetchWeather]);

  const handleToggleUnit = useCallback((nextUnit: TemperatureUnit) => {
    setUnit(nextUnit);
    try {
      localStorage.setItem(UNIT_PREFERENCE_KEY, nextUnit);
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleUseLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setErrorMessage(msg);
      showToast(msg);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(
          {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          { saveHistory: true }
        );
      },
      (geoError) => {
        setIsLoading(false);
        let msg = 'Unable to access your current location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg =
            'Location permission was denied. Please enable location access or search for a city manually.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable right now.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setErrorMessage(msg);
        showToast(msg);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchWeather, showToast]);

  const theme: WeatherTheme = currentWeather
    ? determineWeatherTheme(
        currentWeather.weather[0]?.main || 'Clear',
        currentWeather.dt,
        currentWeather.sys.sunrise,
        currentWeather.sys.sunset,
        currentWeather.weather[0]?.icon
      )
    : 'default';

  const isLightTheme = theme === 'snow';
  const titleText = isLightTheme ? 'text-slate-900' : 'text-white';
  const subText = isLightTheme ? 'text-slate-700' : 'text-white/80';

  return (
    <div className={`weather-bg theme-${theme} flex flex-col`} data-theme={theme}>
      <WeatherHeader
        onSearch={(city) => fetchWeather({ city })}
        onUseLocation={handleUseLocation}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        isLoading={isLoading}
        isLightTheme={isLightTheme}
      />

      <RecentSearches
        searches={recentSearches}
        activeCity={currentWeather?.name}
        onSelectCity={(city) => fetchWeather({ city })}
        onClearHistory={handleClearHistory}
        isLightTheme={isLightTheme}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-5">
        {/* Inline Error Banner */}
        {errorMessage ? (
          <div
            role="alert"
            className={`rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 border ${
              isLightTheme
                ? 'bg-red-50/90 border-red-300 text-red-900'
                : 'bg-red-950/60 border-red-400/35 text-red-50 backdrop-blur-md'
            }`}
            data-testid="error-banner"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" aria-hidden="true" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="p-1 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {/* Loading State */}
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="glass-panel rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center gap-4 text-center"
            data-testid="loading-indicator"
          >
            <Loader2
              className={`w-10 h-10 animate-spin ${titleText}`}
              aria-hidden="true"
            />
            <p className={`font-display text-lg font-semibold ${titleText}`}>
              Fetching live weather...
            </p>
            <p className={`text-sm ${subText}`}>
              Retrieving real-time conditions and 5-day forecast
            </p>
          </div>
        ) : null}

        {/* Weather Dashboard Content */}
        {!isLoading && currentWeather ? (
          <div className="space-y-6">
            <CurrentWeatherPanel
              weather={currentWeather}
              unit={unit}
              isLightTheme={isLightTheme}
            />
            <ForecastGrid
              days={forecastDays}
              unit={unit}
              isLightTheme={isLightTheme}
            />
          </div>
        ) : null}

        {/* Friendly Empty State */}
        {!isLoading && !currentWeather ? (
          <section
            aria-label="Welcome"
            className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto mt-4 sm:mt-8 space-y-6"
            data-testid="empty-state"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto">
              <CloudSun className="w-9 h-9 text-amber-300" aria-hidden="true" />
            </div>
            <div className="space-y-2.5 max-w-xl mx-auto">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Live Global Weather, Wherever You Look
              </h1>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Search any city worldwide or use your current location to view
                real-time temperatures, atmospheric metrics, and a 5-day forecast.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleUseLocation}
                className="h-11 px-5 rounded-xl bg-white text-slate-900 hover:bg-white/90 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>Use My Location</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-2.5">
              <p className="text-xs font-medium text-white/65">
                Or explore live weather in major cities
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {EXPLORE_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => fetchWeather({ city })}
                    className="h-9 px-4 rounded-full bg-white/12 hover:bg-white/22 border border-white/20 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center sm:text-left">
        <p className={`text-xs ${isLightTheme ? 'text-slate-700/80' : 'text-white/60'}`}>
          WeatherNow · Live meteorological telemetry &amp; 5-day forecast
        </p>
      </footer>

      {/* Toast Notification for Errors */}
      {toastMessage ? (
        <div
          role="status"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-slate-900/95 text-white border border-white/15 shadow-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-md"
          data-testid="error-toast"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-medium flex-1">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Close notification"
            className="p-1 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
