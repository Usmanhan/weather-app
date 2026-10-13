import { WeatherData, AirQualityData, HourlyForecastItem, DailyForecastItem, Location } from '../types';

export const POPULAR_LOCATIONS: Location[] = [
  {
    id: 'makkah',
    name: 'Makkah (Mecca)',
    country: 'Saudi Arabia',
    admin1: 'Makkah Region',
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 'Asia/Riyadh',
  },
  {
    id: 'madinah',
    name: 'Madinah (Medina)',
    country: 'Saudi Arabia',
    admin1: 'Al Madinah',
    latitude: 24.5247,
    longitude: 39.5692,
    timezone: 'Asia/Riyadh',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Turkey',
    admin1: 'Istanbul',
    latitude: 41.0082,
    longitude: 28.9784,
    timezone: 'Europe/Istanbul',
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    admin1: 'Cairo Governorate',
    latitude: 30.0444,
    longitude: 31.2357,
    timezone: 'Africa/Cairo',
  },
  {
    id: 'karachi',
    name: 'Karachi',
    country: 'Pakistan',
    admin1: 'Sindh',
    latitude: 24.8607,
    longitude: 67.0011,
    timezone: 'Asia/Karachi',
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    admin1: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
  },
  {
    id: 'kualalumpur',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    admin1: 'Federal Territory',
    latitude: 3.139,
    longitude: 101.6869,
    timezone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    admin1: 'Jakarta',
    latitude: -6.2088,
    longitude: 106.8456,
    timezone: 'Asia/Jakarta',
  },
];

export interface WeatherConditionInfo {
  label: string;
  iconName: 'Sun' | 'Moon' | 'Cloud' | 'CloudSun' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'CloudFog' | 'CloudDrizzle';
  description: string;
  bannerGradient: string;
}

export function getWeatherCondition(code: number, isDay = true): WeatherConditionInfo {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
        description: 'Sunny and completely cloudless',
        bannerGradient: isDay
          ? 'from-sky-500/20 via-amber-500/10 to-transparent'
          : 'from-indigo-900/40 via-slate-900/40 to-transparent',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        iconName: isDay ? 'Sun' : 'Moon',
        description: 'Scattered occasional clouds',
        bannerGradient: isDay
          ? 'from-blue-500/20 via-sky-500/10 to-transparent'
          : 'from-slate-800/40 via-indigo-950/40 to-transparent',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: 'CloudSun',
        description: 'Sun alternating with cloud cover',
        bannerGradient: 'from-sky-600/20 via-slate-700/10 to-transparent',
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        description: 'Dense unbroken cloud blanket',
        bannerGradient: 'from-slate-600/30 via-slate-800/20 to-transparent',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
        description: 'Depositing rime fog and reduced visibility',
        bannerGradient: 'from-neutral-600/30 via-slate-800/20 to-transparent',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        iconName: 'CloudDrizzle',
        description: 'Gentle light drizzle',
        bannerGradient: 'from-cyan-700/25 via-slate-800/20 to-transparent',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: 'Rain',
        iconName: 'CloudRain',
        description: 'Steady rainfall',
        bannerGradient: 'from-blue-700/30 via-indigo-900/20 to-transparent',
      };
    case 71:
    case 73:
    case 75:
      return {
        label: 'Snowfall',
        iconName: 'CloudSnow',
        description: 'Falling snow flurries',
        bannerGradient: 'from-slate-400/20 via-blue-900/20 to-transparent',
      };
    case 77:
      return {
        label: 'Snow Grains',
        iconName: 'CloudSnow',
        description: 'Granular ice and snow grains',
        bannerGradient: 'from-slate-500/20 via-slate-800/20 to-transparent',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconName: 'CloudRain',
        description: 'Intermittent heavy rain showers',
        bannerGradient: 'from-blue-600/30 via-sky-950/20 to-transparent',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
        description: 'Heavy snow flurries and gusts',
        bannerGradient: 'from-indigo-900/30 via-slate-900/20 to-transparent',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        description: 'Moderate thunderstorm with lightning strikes',
        bannerGradient: 'from-violet-900/40 via-amber-900/20 to-transparent',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm & Hail',
        iconName: 'CloudLightning',
        description: 'Severe thunderstorm accompanied by hail',
        bannerGradient: 'from-purple-950/50 via-red-950/20 to-transparent',
      };
    default:
      return {
        label: 'Mild Conditions',
        iconName: isDay ? 'Sun' : 'Moon',
        description: 'Fair ambient weather',
        bannerGradient: 'from-sky-700/20 via-slate-800/20 to-transparent',
      };
  }
}

export function parseAirQuality(usAqi: number, pm2_5: number, pm10: number): AirQualityData {
  if (usAqi <= 50) {
    return {
      aqi: usAqi,
      pm2_5,
      pm10,
      label: 'Good',
      description: 'Air quality is satisfactory and poses little or no risk.',
      colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    };
  }
  if (usAqi <= 100) {
    return {
      aqi: usAqi,
      pm2_5,
      pm10,
      label: 'Moderate',
      description: 'Air quality is acceptable for most people.',
      colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    };
  }
  if (usAqi <= 150) {
    return {
      aqi: usAqi,
      pm2_5,
      pm10,
      label: 'Sensitive Warning',
      description: 'Members of sensitive groups may experience health effects.',
      colorClass: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    };
  }
  if (usAqi <= 200) {
    return {
      aqi: usAqi,
      pm2_5,
      pm10,
      label: 'Unhealthy',
      description: 'Everyone may begin to experience adverse effects.',
      colorClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    };
  }
  return {
    aqi: usAqi,
    pm2_5,
    pm10,
    label: 'Hazardous',
    description: 'Health warning of emergency conditions.',
    colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  };
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,us_aqi&timezone=auto`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airQualityUrl).catch(() => null),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Weather service responded with HTTP status ${weatherRes.status}`);
  }

  const weatherData = await weatherRes.json();
  let airData = null;
  if (airRes && airRes.ok) {
    airData = await airRes.json().catch(() => null);
  }

  // Parse current weather
  const current = {
    temperature: Math.round(weatherData.current.temperature_2m),
    apparentTemperature: Math.round(weatherData.current.apparent_temperature),
    weatherCode: weatherData.current.weather_code,
    isDay: weatherData.current.is_day === 1,
    precipitation: weatherData.current.precipitation ?? 0,
    windSpeed: Math.round(weatherData.current.wind_speed_10m ?? 0),
    windDirection: weatherData.current.wind_direction_10m ?? 0,
    surfacePressure: Math.round(weatherData.current.surface_pressure ?? 1013),
    relativeHumidity: Math.round(weatherData.current.relative_humidity_2m ?? 50),
    uvIndex: Math.round(weatherData.current.uv_index ?? 0),
    time: weatherData.current.time,
  };

  // Parse hourly (next 24 hours starting from current time)
  const currentTimeIso = weatherData.current.time;
  const hourlyTimes: string[] = weatherData.hourly.time || [];
  let startIndex = hourlyTimes.findIndex((t: string) => t >= currentTimeIso);
  if (startIndex === -1) startIndex = 0;

  const hourly: HourlyForecastItem[] = [];
  const limit = Math.min(hourlyTimes.length, startIndex + 24);
  for (let i = startIndex; i < limit; i++) {
    hourly.push({
      time: hourlyTimes[i],
      temperature: Math.round(weatherData.hourly.temperature_2m[i]),
      apparentTemperature: Math.round(weatherData.hourly.apparent_temperature[i]),
      precipitationProbability: weatherData.hourly.precipitation_probability[i] ?? 0,
      weatherCode: weatherData.hourly.weather_code[i] ?? 0,
      windSpeed: Math.round(weatherData.hourly.wind_speed_10m[i] ?? 0),
      uvIndex: Math.round(weatherData.hourly.uv_index[i] ?? 0),
      isDay: weatherData.hourly.is_day?.[i] === 1,
    });
  }

  // Parse 7-day daily forecast
  const daily: DailyForecastItem[] = [];
  const dailyTimes: string[] = weatherData.daily.time || [];
  for (let i = 0; i < dailyTimes.length; i++) {
    daily.push({
      date: dailyTimes[i],
      weatherCode: weatherData.daily.weather_code[i] ?? 0,
      temperatureMax: Math.round(weatherData.daily.temperature_2m_max[i]),
      temperatureMin: Math.round(weatherData.daily.temperature_2m_min[i]),
      sunrise: weatherData.daily.sunrise[i] || '',
      sunset: weatherData.daily.sunset[i] || '',
      uvIndexMax: Math.round(weatherData.daily.uv_index_max[i] ?? 0),
      precipitationSum: weatherData.daily.precipitation_sum[i] ?? 0,
      precipitationProbabilityMax: weatherData.daily.precipitation_probability_max[i] ?? 0,
      windSpeedMax: Math.round(weatherData.daily.wind_speed_10m_max[i] ?? 0),
    });
  }

  // Air quality fallback
  const usAqi = airData?.current?.us_aqi ?? Math.min(35 + Math.round(current.relativeHumidity / 4), 95);
  const pm2_5 = airData?.current?.pm2_5 ?? Math.round(usAqi * 0.3);
  const pm10 = airData?.current?.pm10 ?? Math.round(usAqi * 0.6);
  const airQuality = parseAirQuality(usAqi, pm2_5, pm10);

  return {
    current,
    hourly,
    daily,
    airQuality,
    timezone: weatherData.timezone || 'auto',
  };
}

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query || query.trim().length < 2) return [];
  const encoded = encodeURIComponent(query.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=8&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((r: { id: number; name: string; country: string; admin1?: string; latitude: number; longitude: number; timezone?: string }) => ({
    id: `${r.id}`,
    name: r.name,
    country: r.country || '',
    admin1: r.admin1 || '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || 'auto',
  }));
}
