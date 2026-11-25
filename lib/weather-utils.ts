export type TemperatureUnit = 'C' | 'F';

export type WeatherTheme =
  | 'default'
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'night';

export interface WeatherConditionItem {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeatherData {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  dt: number;
  timezone: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg?: number;
  };
  clouds?: {
    all: number;
  };
  weather: WeatherConditionItem[];
}

export interface ForecastEntry {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherConditionItem[];
  wind: {
    speed: number;
  };
  dt_txt?: string;
}

export interface ForecastResponseData {
  city: {
    name: string;
    country: string;
    timezone: number;
  };
  list: ForecastEntry[];
}

export interface DailyForecastSummary {
  dateKey: string;
  dayName: string;
  dateLabel: string;
  tempMaxC: number;
  tempMinC: number;
  condition: string;
  description: string;
  icon: string;
  entryCount: number;
}

export const RECENT_SEARCHES_KEY = 'weathernow_recent_searches';
export const UNIT_PREFERENCE_KEY = 'weathernow_temp_unit';
export const MAX_RECENT_SEARCHES = 5;

/**
 * Converts a Celsius temperature to the requested unit.
 * Formula: F = (C * 9 / 5) + 32
 */
export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (!Number.isFinite(celsius)) return 0;
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Formats a city's local date and time using the API timezone offset (seconds from UTC).
 */
export function formatCityLocalDateTime(dtSeconds: number, timezoneOffsetSeconds: number): string {
  const localMs = (dtSeconds + timezoneOffsetSeconds) * 1000;
  const date = new Date(localMs);

  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);

  const monthDayYear = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);

  return `${weekday}, ${monthDayYear} · ${time}`;
}

/**
 * Formats a UNIX timestamp (sunrise/sunset) in the city's local timezone.
 */
export function formatSunTime(unixSeconds: number, timezoneOffsetSeconds: number): string {
  const localMs = (unixSeconds + timezoneOffsetSeconds) * 1000;
  const date = new Date(localMs);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Formats a UNIX timestamp into a compact local hour label (e.g., "3 PM").
 */
export function formatHourLabel(unixSeconds: number, timezoneOffsetSeconds: number): string {
  const localMs = (unixSeconds + timezoneOffsetSeconds) * 1000;
  const date = new Date(localMs);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Computes percentage of daylight elapsed (0 to 100), or null if outside daytime.
 */
export function getDaylightProgress(
  dtSeconds: number,
  sunriseSeconds: number,
  sunsetSeconds: number
): number | null {
  if (sunriseSeconds <= 0 || sunsetSeconds <= sunriseSeconds) return null;
  if (dtSeconds < sunriseSeconds || dtSeconds > sunsetSeconds) return null;
  const progress = ((dtSeconds - sunriseSeconds) / (sunsetSeconds - sunriseSeconds)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/**
 * Computes a YYYY-MM-DD local calendar key for a given UNIX timestamp and timezone offset.
 */
export function getLocalDateKey(dtSeconds: number, timezoneOffsetSeconds: number): string {
  const localDate = new Date((dtSeconds + timezoneOffsetSeconds) * 1000);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Groups 3-hour OpenWeatherMap forecast entries by local calendar date
 * and computes each day's genuine high and low temperatures.
 */
export function groupForecastByLocalDate(
  entries: ForecastEntry[],
  timezoneOffsetSeconds: number,
  currentDtSeconds?: number
): DailyForecastSummary[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const todayKey = currentDtSeconds
    ? getLocalDateKey(currentDtSeconds, timezoneOffsetSeconds)
    : null;

  const grouped = new Map<string, ForecastEntry[]>();

  for (const entry of entries) {
    const dateKey = getLocalDateKey(entry.dt, timezoneOffsetSeconds);
    const list = grouped.get(dateKey);
    if (list) {
      list.push(entry);
    } else {
      grouped.set(dateKey, [entry]);
    }
  }

  const sortedKeys = Array.from(grouped.keys()).sort();

  // Prefer the upcoming 5 forecast days if at least 5 future/other days exist;
  // otherwise include all available days up to 5.
  const futureKeys = todayKey
    ? sortedKeys.filter((k) => k > todayKey)
    : sortedKeys;

  const targetKeys =
    futureKeys.length >= 5 ? futureKeys.slice(0, 5) : sortedKeys.slice(0, 5);

  return targetKeys.map((dateKey) => {
    const dayEntries = grouped.get(dateKey) || [];
    let maxTemp = -Infinity;
    let minTemp = Infinity;

    for (const item of dayEntries) {
      const hi = item.main.temp_max ?? item.main.temp;
      const lo = item.main.temp_min ?? item.main.temp;
      if (hi > maxTemp) maxTemp = hi;
      if (lo < minTemp) minTemp = lo;
    }

    // Pick entry closest to 12:00 local time for representative midday icon/condition
    let representative = dayEntries[0];
    let bestHourDiff = Infinity;
    for (const item of dayEntries) {
      const localHour = new Date((item.dt + timezoneOffsetSeconds) * 1000).getUTCHours();
      const diff = Math.abs(localHour - 12);
      if (diff < bestHourDiff) {
        bestHourDiff = diff;
        representative = item;
      }
    }

    const repDate = new Date((representative.dt + timezoneOffsetSeconds) * 1000);
    const dayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(repDate);
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(repDate);

    const weatherInfo = representative.weather[0] || {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    };

    // Ensure forecast day icons reflect daytime icon variant for readability
    const normalizedIcon = weatherInfo.icon.endsWith('n')
      ? `${weatherInfo.icon.slice(0, -1)}d`
      : weatherInfo.icon;

    return {
      dateKey,
      dayName,
      dateLabel,
      tempMaxC: maxTemp,
      tempMinC: minTemp,
      condition: weatherInfo.main,
      description: weatherInfo.description,
      icon: normalizedIcon,
      entryCount: dayEntries.length,
    };
  });
}

/**
 * Determines the dynamic atmospheric theme from real weather conditions
 * and local day/night status (using sunrise and sunset UNIX timestamps).
 */
export function determineWeatherTheme(
  conditionMain: string,
  dtSeconds: number,
  sunriseSeconds: number,
  sunsetSeconds: number,
  iconCode?: string
): WeatherTheme {
  const normalized = (conditionMain || '').toLowerCase();

  // Severe / precipitation conditions keep their atmospheric palette even at dusk/night,
  // while clear/cloudy skies transition to the nocturnal night palette after sunset.
  const isNightBySun =
    sunriseSeconds > 0 && sunsetSeconds > 0
      ? dtSeconds < sunriseSeconds || dtSeconds >= sunsetSeconds
      : iconCode?.endsWith('n') ?? false;

  if (normalized.includes('thunder')) return 'thunderstorm';
  if (normalized.includes('snow') || normalized.includes('sleet')) return 'snow';
  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return isNightBySun ? 'rain' : 'rain';
  }
  if (isNightBySun) return 'night';
  if (
    normalized.includes('cloud') ||
    normalized.includes('mist') ||
    normalized.includes('fog') ||
    normalized.includes('haze') ||
    normalized.includes('smoke') ||
    normalized.includes('dust')
  ) {
    return 'clouds';
  }
  if (normalized.includes('clear')) return 'clear';
  return 'clouds';
}

/**
 * Updates recent search history: prevents case-insensitive duplicates,
 * keeps the latest search first, and caps at 5 cities.
 */
export function addRecentSearch(existing: string[], cityName: string): string[] {
  const trimmed = cityName.trim();
  if (!trimmed) return existing.slice(0, MAX_RECENT_SEARCHES);

  const filtered = existing.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  );
  return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
}

/**
 * Builds the official OpenWeatherMap weather icon URL.
 */
export function getWeatherIconUrl(iconCode: string): string {
  const safeIcon = /^[0-9]{2}[dn]$/.test(iconCode) ? iconCode : '01d';
  return `https://openweathermap.org/img/wn/${safeIcon}@2x.png`;
}

/**
 * Converts a 2-letter ISO region code (e.g. "JP") into a readable English country name (e.g. "Japan").
 */
export function getCountryName(countryCode?: string): string {
  if (!countryCode) return '';
  const trimmed = countryCode.trim();
  if (!trimmed) return '';
  if (trimmed.length === 2) {
    try {
      const display = new Intl.DisplayNames(['en'], { type: 'region' });
      return display.of(trimmed.toUpperCase()) || trimmed;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

/**
 * Maps WMO Weather Interpretation Codes (from live Open-Meteo telemetry)
 * to genuine OpenWeatherMap condition IDs, labels, and official icon codes.
 */
export function mapWmoToOwm(wmoCode: number, isDay: boolean): WeatherConditionItem {
  const suffix = isDay ? 'd' : 'n';

  if (wmoCode === 0) {
    return { id: 800, main: 'Clear', description: 'clear sky', icon: `01${suffix}` };
  }
  if (wmoCode === 1) {
    return { id: 801, main: 'Clear', description: 'mainly clear', icon: `01${suffix}` };
  }
  if (wmoCode === 2) {
    return { id: 802, main: 'Clouds', description: 'scattered clouds', icon: `02${suffix}` };
  }
  if (wmoCode === 3) {
    return { id: 804, main: 'Clouds', description: 'overcast clouds', icon: `04${suffix}` };
  }
  if (wmoCode === 45 || wmoCode === 48) {
    return { id: 741, main: 'Mist', description: 'fog and mist', icon: `50${suffix}` };
  }
  if (wmoCode >= 51 && wmoCode <= 57) {
    return { id: 300, main: 'Drizzle', description: 'light drizzle', icon: `09${suffix}` };
  }
  if (wmoCode >= 61 && wmoCode <= 67) {
    const desc = wmoCode >= 65 ? 'heavy rain' : wmoCode === 63 ? 'moderate rain' : 'light rain';
    return { id: 500, main: 'Rain', description: desc, icon: `10${suffix}` };
  }
  if (wmoCode >= 71 && wmoCode <= 77) {
    const desc = wmoCode >= 75 ? 'heavy snow' : 'snowfall';
    return { id: 601, main: 'Snow', description: desc, icon: `13${suffix}` };
  }
  if (wmoCode >= 80 && wmoCode <= 82) {
    return { id: 521, main: 'Rain', description: 'rain showers', icon: `09${suffix}` };
  }
  if (wmoCode === 85 || wmoCode === 86) {
    return { id: 621, main: 'Snow', description: 'snow showers', icon: `13${suffix}` };
  }
  if (wmoCode >= 95 && wmoCode <= 99) {
    return { id: 200, main: 'Thunderstorm', description: 'thunderstorm', icon: `11${suffix}` };
  }

  return { id: 802, main: 'Clouds', description: 'partly cloudy', icon: `03${suffix}` };
}
