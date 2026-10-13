export interface Location {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isCustom?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  relativeHumidity: number;
  uvIndex: number;
  time: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface AirQualityData {
  aqi: number;
  pm2_5: number;
  pm10: number;
  label: string;
  description: string;
  colorClass: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  timezone: string;
}

export interface PrayerTimeItem {
  name: string;
  arabicName: string;
  time: string; // "05:12" (24h) or "5:12 AM"
  rawTime: string; // "05:12" (24h baseline for calculation)
  isNext?: boolean;
  isCurrent?: boolean;
}

export interface NextPrayerInfo {
  name: string;
  arabicName: string;
  timeString: string;
  secondsRemaining: number;
  timeRemainingFormatted: string;
  progressPercent: number; // 0 to 100 of current prayer window
}

export interface HijriDateInfo {
  day: string;
  monthEn: string;
  monthAr: string;
  year: string;
  designation: string;
  formatted: string;
}

export interface PrayerSchedule {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
  lastThird: string;
  duha: string;
  items: PrayerTimeItem[];
  nextPrayer: NextPrayerInfo;
  hijri: HijriDateInfo;
  methodName: string;
  schoolName: string;
}

export interface QiblaData {
  bearingDeg: number;
  distanceKm: number;
  distanceMiles: number;
  sunAzimuthDeg: number;
}

export type WidgetId =
  | 'current_weather'
  | 'next_prayer'
  | 'hourly_forecast'
  | 'daily_forecast'
  | 'prayer_times'
  | 'qibla_compass'
  | 'weather_metrics'
  | 'air_quality'
  | 'tasbeeh_counter'
  | 'hijri_calendar'
  | 'clothing_advice';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  colSpan: 'full' | 'half' | 'third';
}

export type AppTheme =
  | 'celestial'
  | 'emerald'
  | 'dune'
  | 'nordic'
  | 'obsidian'
  | 'clean';

export interface UserSettings {
  theme: AppTheme;
  tempUnit: 'celsius' | 'fahrenheit';
  windUnit: 'kmh' | 'mph' | 'ms';
  timeFormat: '12h' | '24h';
  prayerMethod: number;
  asrSchool: 'standard' | 'hanafi';
  adhanChimeEnabled: boolean;
  vibrationFeedback: boolean;
  widgets: WidgetConfig[];
  savedLocations: Location[];
  activeLocation: Location;
}
