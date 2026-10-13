import { Location, UserSettings, WidgetConfig } from '../types';
import { POPULAR_LOCATIONS } from './weatherService';

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'next_prayer',
    title: 'Next Prayer Countdown',
    description: 'Real-time countdown to the upcoming Nimaz with elapsed progress bar',
    enabled: true,
    order: 0,
    colSpan: 'full',
  },
  {
    id: 'current_weather',
    title: 'Current Weather',
    description: 'Real-time temperature, condition, feels like, and high/low ranges',
    enabled: true,
    order: 1,
    colSpan: 'half',
  },
  {
    id: 'prayer_times',
    title: 'Daily Nimaz Timetable',
    description: 'Complete daily prayer times with Tahajjud and current prayer highlight',
    enabled: true,
    order: 2,
    colSpan: 'half',
  },
  {
    id: 'qibla_compass',
    title: 'Qibla Finder Compass',
    description: 'Precision Kaaba direction compass with sensor tracking and distance',
    enabled: true,
    order: 3,
    colSpan: 'half',
  },
  {
    id: 'hourly_forecast',
    title: '24-Hour Forecast Curve',
    description: 'Hour-by-hour temperature progression and precipitation probability',
    enabled: true,
    order: 4,
    colSpan: 'half',
  },
  {
    id: 'weather_metrics',
    title: 'Atmospheric Highlights',
    description: 'UV Index, Wind Direction, Humidity, Atmospheric Pressure, and Visibility',
    enabled: true,
    order: 5,
    colSpan: 'full',
  },
  {
    id: 'daily_forecast',
    title: '7-Day Extended Forecast',
    description: 'Upcoming weekly weather outlook with temperature ranges and rain chances',
    enabled: true,
    order: 6,
    colSpan: 'half',
  },
  {
    id: 'air_quality',
    title: 'Air Quality & Pollutants',
    description: 'US AQI rating, PM2.5, PM10 particulate levels and outdoor guidance',
    enabled: true,
    order: 7,
    colSpan: 'half',
  },
  {
    id: 'tasbeeh_counter',
    title: 'Digital Tasbeeh & Dhikr',
    description: 'Interactive beads counter with target goals, vibration, and history',
    enabled: true,
    order: 8,
    colSpan: 'half',
  },
  {
    id: 'hijri_calendar',
    title: 'Islamic Hijri Date & Sunnah',
    description: 'Hijri calendar view with daily Dhikr and spiritual insights',
    enabled: true,
    order: 9,
    colSpan: 'half',
  },
  {
    id: 'clothing_advice',
    title: 'Weather & Prayer Advice',
    description: 'Smart recommendations for prayer walks, clothing layers, and outdoor suitability',
    enabled: true,
    order: 10,
    colSpan: 'full',
  },
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'celestial',
  tempUnit: 'celsius',
  windUnit: 'kmh',
  timeFormat: '12h',
  prayerMethod: 3, // Muslim World League
  asrSchool: 'standard',
  adhanChimeEnabled: true,
  vibrationFeedback: true,
  widgets: DEFAULT_WIDGETS,
  savedLocations: POPULAR_LOCATIONS.slice(0, 4),
  activeLocation: POPULAR_LOCATIONS[0], // Makkah default or auto-geo
};

const STORAGE_KEY = 'barakah_weather_settings_v1';

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure any newly added widgets or fields are merged smoothly
      const mergedWidgets = DEFAULT_WIDGETS.map((dw) => {
        const found = parsed.widgets?.find((w: WidgetConfig) => w.id === dw.id);
        return found ? { ...dw, ...found } : dw;
      }).sort((a, b) => a.order - b.order);

      return {
        ...DEFAULT_USER_SETTINGS,
        ...parsed,
        widgets: mergedWidgets,
      };
    }
  } catch {
    // Return default on error
  }
  return DEFAULT_USER_SETTINGS;
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage quota or private browsing handling
  }
}

export function getThemeClasses(theme: UserSettings['theme']) {
  switch (theme) {
    case 'emerald':
      return {
        bg: 'bg-gradient-to-br from-[#061811] via-[#092218] to-[#040e0a]',
        cardBg: 'bg-[#0b2b1f]/70 border-emerald-800/40 hover:border-emerald-700/50 shadow-emerald-950/20',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        highlight: 'border-emerald-500/50 bg-emerald-500/10',
        navBg: 'bg-[#061811]/90 border-emerald-900/50',
      };
    case 'dune':
      return {
        bg: 'bg-gradient-to-br from-[#18120e] via-[#221813] to-[#120c09]',
        cardBg: 'bg-[#291e18]/70 border-amber-900/40 hover:border-amber-700/50 shadow-amber-950/20',
        accentText: 'text-amber-400',
        accentBg: 'bg-amber-600 hover:bg-amber-500 text-white',
        highlight: 'border-amber-500/50 bg-amber-500/10',
        navBg: 'bg-[#18120e]/90 border-amber-900/50',
      };
    case 'nordic':
      return {
        bg: 'bg-gradient-to-br from-[#0c1626] via-[#101c30] to-[#080f1a]',
        cardBg: 'bg-[#14233c]/70 border-sky-900/40 hover:border-sky-700/50 shadow-sky-950/20',
        accentText: 'text-sky-400',
        accentBg: 'bg-sky-600 hover:bg-sky-500 text-white',
        highlight: 'border-sky-500/50 bg-sky-500/10',
        navBg: 'bg-[#0c1626]/90 border-sky-900/50',
      };
    case 'obsidian':
      return {
        bg: 'bg-black',
        cardBg: 'bg-[#0d0d0f]/90 border-neutral-800 hover:border-neutral-700 shadow-black',
        accentText: 'text-amber-300',
        accentBg: 'bg-amber-500 hover:bg-amber-400 text-black font-semibold',
        highlight: 'border-amber-400/40 bg-amber-400/10',
        navBg: 'bg-black/90 border-neutral-800',
      };
    case 'clean':
      return {
        bg: 'bg-gradient-to-br from-slate-100 via-neutral-100 to-slate-200 text-slate-900',
        cardBg: 'bg-white/80 border-slate-300/80 hover:border-slate-400 shadow-slate-200/50 text-slate-800',
        accentText: 'text-emerald-700',
        accentBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        highlight: 'border-emerald-600/40 bg-emerald-50 text-emerald-900',
        navBg: 'bg-white/90 border-slate-200 text-slate-900',
      };
    case 'celestial':
    default:
      return {
        bg: 'bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#070b12]',
        cardBg: 'bg-[#111827]/75 border-slate-800/80 hover:border-slate-700/80 shadow-slate-950/40',
        accentText: 'text-amber-400',
        accentBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium',
        highlight: 'border-amber-500/40 bg-amber-500/10',
        navBg: 'bg-[#0b0f19]/90 border-slate-800/80',
      };
  }
}
