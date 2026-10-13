import React from 'react';
import { CalendarDays, Droplets, Sun, Moon, Cloud, CloudSun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import { DailyForecastItem } from '../types';
import { getWeatherCondition } from '../services/weatherService';

interface DailyForecastWidgetProps {
  daily: DailyForecastItem[];
  tempUnit: 'celsius' | 'fahrenheit';
  cardBgClass: string;
}

export const DailyForecastWidget: React.FC<DailyForecastWidgetProps> = ({
  daily,
  tempUnit,
  cardBgClass,
}) => {
  const formatTemp = (c: number) => {
    if (tempUnit === 'fahrenheit') return `${Math.round((c * 9) / 5 + 32)}°`;
    return `${Math.round(c)}°`;
  };

  const formatDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-sky-200" />;
      case 'CloudSun':
        return <CloudSun className="w-4 h-4 text-amber-300" />;
      case 'CloudRain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'CloudSnow':
        return <CloudSnow className="w-4 h-4 text-slate-200" />;
      case 'CloudLightning':
        return <CloudLightning className="w-4 h-4 text-violet-400" />;
      case 'CloudFog':
        return <CloudFog className="w-4 h-4 text-neutral-400" />;
      case 'CloudDrizzle':
        return <CloudDrizzle className="w-4 h-4 text-cyan-400" />;
      default:
        return <Cloud className="w-4 h-4 text-slate-400" />;
    }
  };

  // Find global min and max for range bar proportion
  const allMins = daily.map((d) => d.temperatureMin);
  const allMaxs = daily.map((d) => d.temperatureMax);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const globalSpan = Math.max(1, globalMax - globalMin);

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>7-Day Outlook</span>
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight mb-4">Extended Forecast</h3>

      <div className="space-y-3">
        {daily.slice(0, 7).map((item, idx) => {
          const condition = getWeatherCondition(item.weatherCode, true);
          const leftPercent = ((item.temperatureMin - globalMin) / globalSpan) * 100;
          const barWidth = ((item.temperatureMax - item.temperatureMin) / globalSpan) * 100;

          return (
            <div
              key={item.date}
              className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {/* Day label */}
              <div className="w-20 font-medium text-white truncate">
                {formatDayName(item.date, idx)}
              </div>

              {/* Condition icon & Rain prob */}
              <div className="flex items-center gap-2 w-28">
                {renderWeatherIcon(condition.iconName)}
                <span className="text-slate-300 truncate text-[11px]">{condition.label}</span>
              </div>

              {/* Rain % */}
              <div className="w-12 text-right">
                {item.precipitationProbabilityMax > 15 ? (
                  <span className="text-sky-400 flex items-center justify-end gap-0.5 font-medium">
                    <Droplets className="w-3 h-3" />
                    {item.precipitationProbabilityMax}%
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono text-[10px]">—</span>
                )}
              </div>

              {/* Low temp */}
              <span className="w-8 text-right font-mono text-slate-400 tabular-nums">
                {formatTemp(item.temperatureMin)}
              </span>

              {/* Visual Temperature Bar */}
              <div className="flex-1 max-w-[120px] h-2 bg-white/10 rounded-full relative overflow-hidden hidden sm:block">
                <div
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 rounded-full"
                  style={{
                    left: `${Math.max(0, leftPercent)}%`,
                    width: `${Math.max(10, barWidth)}%`,
                  }}
                />
              </div>

              {/* High temp */}
              <span className="w-8 text-right font-mono font-bold text-white tabular-nums">
                {formatTemp(item.temperatureMax)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
