import React from 'react';
import {
  Sun,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Navigation2,
  Compass,
} from 'lucide-react';
import { CurrentWeather, DailyForecastItem } from '../types';
import { getCardinalDirection } from '../services/qiblaService';

interface WeatherMetricsWidgetProps {
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
  windUnit: 'kmh' | 'mph' | 'ms';
  timeFormat: '12h' | '24h';
  cardBgClass: string;
}

export const WeatherMetricsWidget: React.FC<WeatherMetricsWidgetProps> = ({
  current,
  todayDaily,
  windUnit,
  timeFormat,
  cardBgClass,
}) => {
  const formatWind = (kmh: number) => {
    if (windUnit === 'mph') return `${Math.round(kmh * 0.621371)} mph`;
    if (windUnit === 'ms') return `${(kmh / 3.6).toFixed(1)} m/s`;
    return `${kmh} km/h`;
  };

  const getUvCategory = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400', desc: 'No protection required' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-yellow-400', desc: 'Take shade during midday' };
    if (uv <= 7) return { text: 'High', color: 'text-amber-400', desc: 'Wear hat and sunscreen' };
    if (uv <= 10) return { text: 'Very High', color: 'text-rose-400', desc: 'Seek shade, SPF 30+' };
    return { text: 'Extreme', color: 'text-purple-400', desc: 'Avoid outdoor sun exposure' };
  };

  const formatSunTime = (iso: string) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(11, 16);
    if (timeFormat === '24h') {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m} ${period}`;
  };

  const uvInfo = getUvCategory(current.uvIndex);
  const windCardinal = getCardinalDirection(current.windDirection);

  // Approximate dew point using Magnus formula
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * current.temperature) / (b + current.temperature)) + Math.log(current.relativeHumidity / 100);
  const dewPoint = Math.round((b * alpha) / (a - alpha));

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
        <Gauge className="w-3.5 h-3.5" />
        <span>Meteorological Indicators</span>
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight mb-4">Atmospheric Highlights</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. UV Index */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {current.uvIndex}
          </div>
          <div className={`text-xs font-medium ${uvInfo.color} mt-1`}>
            {uvInfo.text}
          </div>
        </div>

        {/* 2. Wind Direction & Speed */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Wind</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white tabular-nums">
            {formatWind(current.windSpeed)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
            <Navigation2
              className="w-3.5 h-3.5 text-amber-400 shrink-0"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
            <span className="font-mono">{current.windDirection}° {windCardinal}</span>
          </div>
        </div>

        {/* 3. Humidity */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {current.relativeHumidity}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Dew point {dewPoint}°
          </div>
        </div>

        {/* 4. Pressure */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pressure</span>
            <Compass className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white tabular-nums">
            {current.surfacePressure}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            hPa · Normal
          </div>
        </div>

        {/* 5. Sunrise & Sunset */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Sunrise</span>
            <Sunrise className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-sm font-mono font-bold text-white tabular-nums">
            {todayDaily ? formatSunTime(todayDaily.sunrise) : '05:42 AM'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <Sunset className="w-3 h-3 text-rose-400" />
            <span className="font-mono">{todayDaily ? formatSunTime(todayDaily.sunset) : '06:18 PM'}</span>
          </div>
        </div>

        {/* 6. Precipitation / Moisture */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Precipitation</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {current.precipitation} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {current.precipitation > 0 ? 'Active rain' : 'Dry conditions'}
          </div>
        </div>
      </div>
    </div>
  );
};
