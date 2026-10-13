import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2,
  RefreshCw,
  MapPin,
  Sliders,
  Calendar,
  Compass,
  CloudSun,
  AlertCircle,
} from 'lucide-react';
import {
  Location,
  UserSettings,
  WeatherData,
  PrayerSchedule,
  QiblaData,
  WidgetId,
} from './types';
import { fetchWeatherData } from './services/weatherService';
import {
  fetchPrayerSchedule,
  computeNextPrayer,
  playSereneChime,
} from './services/prayerService';
import { calculateQibla } from './services/qiblaService';
import {
  loadUserSettings,
  saveUserSettings,
  DEFAULT_USER_SETTINGS,
  getThemeClasses,
} from './services/dashboardConfig';

import { TopNav } from './components/TopNav';
import { LocationSearchModal } from './components/LocationSearchModal';
import { CustomizationDrawer } from './components/CustomizationDrawer';
import { MonthlyTimetableModal } from './components/MonthlyTimetableModal';

import { NextPrayerBanner } from './components/NextPrayerBanner';
import { WeatherHeroWidget } from './components/WeatherHeroWidget';
import { PrayerTimesWidget } from './components/PrayerTimesWidget';
import { QiblaCompassWidget } from './components/QiblaCompassWidget';
import { HourlyForecastWidget } from './components/HourlyForecastWidget';
import { DailyForecastWidget } from './components/DailyForecastWidget';
import { WeatherMetricsWidget } from './components/WeatherMetricsWidget';
import { AirQualityWidget } from './components/AirQualityWidget';
import { DigitalTasbeehWidget } from './components/DigitalTasbeehWidget';
import { HijriCalendarWidget } from './components/HijriCalendarWidget';
import { ClothingAndPrayerAdviceWidget } from './components/ClothingAndPrayerAdviceWidget';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerSchedule | null>(null);
  const [qibla, setQibla] = useState<QiblaData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState<boolean>(false);

  const prevNextPrayerNameRef = useRef<string>('');

  // Persist settings whenever changed
  const updateSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    saveUserSettings(newSettings);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_USER_SETTINGS);
    saveUserSettings(DEFAULT_USER_SETTINGS);
  }, []);

  // Fetch all core data for the current active location and settings
  const loadData = useCallback(async (loc: Location, currentSettings: UserSettings, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [weatherData, prayerData] = await Promise.all([
        fetchWeatherData(loc.latitude, loc.longitude),
        fetchPrayerSchedule(
          loc.latitude,
          loc.longitude,
          currentSettings.prayerMethod,
          currentSettings.asrSchool,
          currentSettings.timeFormat
        ),
      ]);

      const qiblaData = calculateQibla(loc.latitude, loc.longitude);

      setWeather(weatherData);
      setPrayerSchedule(prayerData);
      setQibla(qiblaData);
      prevNextPrayerNameRef.current = prayerData.nextPrayer.name;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load weather and prayer data.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load when location or calculation options change
  useEffect(() => {
    loadData(settings.activeLocation, settings);
  }, [
    settings.activeLocation,
    settings.prayerMethod,
    settings.asrSchool,
    settings.timeFormat,
    loadData,
  ]);

  // Live 1-second interval to tick next prayer countdown & handle adhan chime
  useEffect(() => {
    if (!prayerSchedule) return;

    const timer = setInterval(() => {
      const now = new Date();
      // Recalculate next prayer
      const next = computeNextPrayer(
        {
          fajr: prayerSchedule.items.find((i) => i.name === 'Fajr')?.rawTime || '05:00',
          sunrise: prayerSchedule.items.find((i) => i.name === 'Sunrise')?.rawTime || '06:15',
          dhuhr: prayerSchedule.items.find((i) => i.name === 'Dhuhr')?.rawTime || '12:30',
          asr: prayerSchedule.items.find((i) => i.name === 'Asr')?.rawTime || '15:45',
          maghrib: prayerSchedule.items.find((i) => i.name === 'Maghrib')?.rawTime || '18:15',
          isha: prayerSchedule.items.find((i) => i.name === 'Isha')?.rawTime || '19:45',
        },
        now
      );

      // Check if prayer just changed
      if (prevNextPrayerNameRef.current && prevNextPrayerNameRef.current !== next.name) {
        if (settings.adhanChimeEnabled) {
          playSereneChime();
        }
      }
      prevNextPrayerNameRef.current = next.name;

      setPrayerSchedule((prev) => (prev ? { ...prev, nextPrayer: next } : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerSchedule, settings.adhanChimeEnabled]);

  // Location selection handler
  const handleSelectLocation = (loc: Location) => {
    const updated: UserSettings = {
      ...settings,
      activeLocation: loc,
    };
    updateSettings(updated);
  };

  const handleToggleSaveLocation = (loc: Location) => {
    const exists = settings.savedLocations.some(
      (s) => s.id === loc.id || (Math.abs(s.latitude - loc.latitude) < 0.05 && Math.abs(s.longitude - loc.longitude) < 0.05)
    );

    let updatedSaved: Location[];
    if (exists) {
      updatedSaved = settings.savedLocations.filter(
        (s) => !(s.id === loc.id || (Math.abs(s.latitude - loc.latitude) < 0.05 && Math.abs(s.longitude - loc.longitude) < 0.05))
      );
    } else {
      updatedSaved = [...settings.savedLocations, loc];
    }

    updateSettings({ ...settings, savedLocations: updatedSaved });
  };

  const themeClasses = getThemeClasses(settings.theme);

  // Render individual widget based on id
  const renderWidget = (id: WidgetId) => {
    if (!weather || !prayerSchedule || !qibla) return null;

    switch (id) {
      case 'next_prayer':
        return (
          <NextPrayerBanner
            nextPrayer={prayerSchedule.nextPrayer}
            hijri={prayerSchedule.hijri}
            adhanChimeEnabled={settings.adhanChimeEnabled}
            onToggleChime={() =>
              updateSettings({
                ...settings,
                adhanChimeEnabled: !settings.adhanChimeEnabled,
              })
            }
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'current_weather':
        return (
          <WeatherHeroWidget
            current={weather.current}
            hourly={weather.hourly}
            location={settings.activeLocation}
            tempUnit={settings.tempUnit}
            windUnit={settings.windUnit}
            timeFormat={settings.timeFormat}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'prayer_times':
        return (
          <PrayerTimesWidget
            schedule={prayerSchedule}
            onOpenMonthlyModal={() => setIsMonthlyModalOpen(true)}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'qibla_compass':
        return (
          <QiblaCompassWidget
            qibla={qibla}
            location={settings.activeLocation}
            vibrationFeedback={settings.vibrationFeedback}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'hourly_forecast':
        return (
          <HourlyForecastWidget
            hourly={weather.hourly}
            tempUnit={settings.tempUnit}
            windUnit={settings.windUnit}
            timeFormat={settings.timeFormat}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'weather_metrics':
        return (
          <WeatherMetricsWidget
            current={weather.current}
            todayDaily={weather.daily[0]}
            windUnit={settings.windUnit}
            timeFormat={settings.timeFormat}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'daily_forecast':
        return (
          <DailyForecastWidget
            daily={weather.daily}
            tempUnit={settings.tempUnit}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'air_quality':
        return (
          <AirQualityWidget
            airQuality={weather.airQuality}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'tasbeeh_counter':
        return (
          <DigitalTasbeehWidget
            vibrationFeedback={settings.vibrationFeedback}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'hijri_calendar':
        return (
          <HijriCalendarWidget
            hijri={prayerSchedule.hijri}
            cardBgClass={themeClasses.cardBg}
          />
        );

      case 'clothing_advice':
        return (
          <ClothingAndPrayerAdviceWidget
            current={weather.current}
            nextPrayer={prayerSchedule.nextPrayer}
            cardBgClass={themeClasses.cardBg}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300`}>
      {/* Top Bar Contract Navigation */}
      <TopNav
        activeLocation={settings.activeLocation}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        themeNavClass={themeClasses.navBg}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Sub-header Location Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium text-white text-sm">
              {settings.activeLocation.name}
            </span>
            <span>·</span>
            <span>{settings.activeLocation.country}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              {settings.activeLocation.latitude.toFixed(2)}°N, {settings.activeLocation.longitude.toFixed(2)}°E
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(settings.activeLocation, settings, true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Refresh weather and calculations"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Change City</span>
            </button>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Personalize</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(settings.activeLocation, settings)}
              className="px-3 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-xs font-medium text-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-medium">Gathering meteorological data & calculating astronomical times...</p>
          </div>
        )}

        {/* Dynamic Customizable Widgets Grid */}
        {!loading && weather && prayerSchedule && qibla && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {settings.widgets
              .filter((w) => w.enabled)
              .sort((a, b) => a.order - b.order)
              .map((w) => {
                const isFullSpan = w.colSpan === 'full';
                return (
                  <div
                    key={w.id}
                    className={`transition-all duration-300 ${
                      isFullSpan ? 'col-span-1 lg:col-span-2' : 'col-span-1'
                    }`}
                  >
                    {renderWidget(w.id)}
                  </div>
                );
              })}
          </div>
        )}
      </main>

      {/* Clean Footer adhering to Anti-Slop Discipline */}
      <footer className="border-t border-white/5 py-6 px-4 lg:px-8 mt-12 bg-black/20 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">Barakah Weather</span>
            <span>·</span>
            <span>Powered by Open-Meteo & Astronomical Algorithms</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsMonthlyModalOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              Monthly Prayer Timetable
            </button>
            <span>·</span>
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              Dashboard Customizer
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        activeLocation={settings.activeLocation}
        savedLocations={settings.savedLocations}
        onSelectLocation={handleSelectLocation}
        onToggleSaveLocation={handleToggleSaveLocation}
      />

      <CustomizationDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />

      <MonthlyTimetableModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        location={settings.activeLocation}
        prayerMethod={settings.prayerMethod}
        asrSchool={settings.asrSchool}
        timeFormat={settings.timeFormat}
      />
    </div>
  );
}
