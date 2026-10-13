import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  ArrowUp,
  ArrowDown,
  Droplets,
  Wind,
} from 'lucide-react';
import { CurrentWeather, HourlyForecastItem, Location } from '../types';
import { getWeatherCondition } from '../services/weatherService';

interface WeatherHeroWidgetProps {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  location: Location;
  tempUnit: 'celsius' | 'fahrenheit';
  windUnit: 'kmh' | 'mph' | 'ms';
  timeFormat: '12h' | '24h';
  cardBgClass: string;
}

export const WeatherHeroWidget: React.FC<WeatherHeroWidgetProps> = ({
  current,
  hourly,
  location,
  tempUnit,
  windUnit,
  timeFormat,
  cardBgClass,
}) => {
  const condition = getWeatherCondition(current.weatherCode, current.isDay);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const formatWind = (kmh: number) => {
    if (windUnit === 'mph') return `${Math.round(kmh * 0.621371)} mph`;
    if (windUnit === 'ms') return `${(kmh / 3.6).toFixed(1)} m/s`;
    return `${kmh} km/h`;
  };

  const formatHourTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(11, 16);
    if (timeFormat === '24h') {
      return `${d.getHours().toString().padStart(2, '0')}:00`;
    }
    const h = d.getHours();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${period}`;
  };

  const renderWeatherIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'Moon':
        return <Moon className={`${className} text-sky-200`} />;
      case 'CloudSun':
        return <CloudSun className={`${className} text-amber-300`} />;
      case 'CloudRain':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'CloudSnow':
        return <CloudSnow className={`${className} text-slate-200`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${className} text-violet-400`} />;
      case 'CloudFog':
        return <CloudFog className={`${className} text-neutral-400`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${className} text-cyan-400`} />;
      default:
        return <Cloud className={`${className} text-slate-400`} />;
    }
  };

  // Next 8 hours
  const previewHours = hourly.slice(0, 8);

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all ${cardBgClass}`}>
      {/* Ambient background gradient reflecting weather condition */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${condition.bannerGradient} opacity-60 pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Header row: City name and current condition pill */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Local Atmospheric Overview</div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{location.name}</h3>
            <div className="text-xs text-slate-400">
              {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
            {renderWeatherIcon(condition.iconName, 'w-4 h-4')}
            <span>{condition.label}</span>
          </div>
        </div>

        {/* Big Temperature Hero & Quick stats */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 my-4">
          <div className="flex items-baseline gap-3">
            <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tighter tabular-nums font-mono">
              {formatTemp(current.temperature)}
            </span>
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-300">
                Feels like {formatTemp(current.apparentTemperature)}
              </div>
              <div className="text-xs text-slate-400">
                {condition.description}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 bg-black/20 px-3.5 py-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>{current.relativeHumidity}% Humidity</span>
            </div>
            <div className="text-slate-600">·</div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatWind(current.windSpeed)}</span>
            </div>
          </div>
        </div>

        {/* Mini 8-Hour Scroller */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Upcoming Hours
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {previewHours.map((h, idx) => {
              const hCondition = getWeatherCondition(h.weatherCode, h.isDay);
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-between p-2.5 min-w-[72px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center transition-colors"
                >
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatHourTime(h.time)}
                  </span>
                  <div className="my-1.5">
                    {renderWeatherIcon(hCondition.iconName, 'w-4 h-4')}
                  </div>
                  <span className="text-sm font-semibold text-white font-mono tabular-nums">
                    {formatTemp(h.temperature)}
                  </span>
                  {h.precipitationProbability > 0 && (
                    <span className="text-[10px] text-sky-400 font-medium">
                      {h.precipitationProbability}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
