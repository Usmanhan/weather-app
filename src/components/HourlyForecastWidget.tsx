import React, { useState } from 'react';
import { CloudSun, Droplets, Wind, Clock } from 'lucide-react';
import { HourlyForecastItem } from '../types';
import { getWeatherCondition } from '../services/weatherService';

interface HourlyForecastWidgetProps {
  hourly: HourlyForecastItem[];
  tempUnit: 'celsius' | 'fahrenheit';
  windUnit: 'kmh' | 'mph' | 'ms';
  timeFormat: '12h' | '24h';
  cardBgClass: string;
}

export const HourlyForecastWidget: React.FC<HourlyForecastWidgetProps> = ({
  hourly,
  tempUnit,
  windUnit,
  timeFormat,
  cardBgClass,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Take next 24 hours
  const items = hourly.slice(0, 24);

  const formatTemp = (c: number) => {
    if (tempUnit === 'fahrenheit') return `${Math.round((c * 9) / 5 + 32)}°`;
    return `${Math.round(c)}°`;
  };

  const formatWind = (kmh: number) => {
    if (windUnit === 'mph') return `${Math.round(kmh * 0.621371)} mph`;
    if (windUnit === 'ms') return `${(kmh / 3.6).toFixed(1)} m/s`;
    return `${kmh} km/h`;
  };

  const formatHour = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(11, 16);
    if (timeFormat === '24h') {
      return `${d.getHours().toString().padStart(2, '0')}:00`;
    }
    const h = d.getHours();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${period}`;
  };

  // Compute SVG polyline coordinates for temperature curve
  const temps = items.map((i) => i.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const svgWidth = 800;
  const svgHeight = 120;
  const paddingX = 20;
  const paddingY = 25;

  const points = items.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, items.length - 1)) * (svgWidth - 2 * paddingX);
    const normalizedY = (item.temperature - minTemp) / tempRange;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - 2 * paddingY);
    return { x, y, temp: item.temperature, item };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Smooth bezier curve control points
    const prev = points[idx - 1];
    const cx1 = prev.x + (curr.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (curr.x - prev.x) / 2;
    const cy2 = curr.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  const activeItem = hoveredIdx !== null ? items[hoveredIdx] : items[0];
  const activeCondition = activeItem ? getWeatherCondition(activeItem.weatherCode, activeItem.isDay) : null;

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Hour-By-Hour Timeline</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">24-Hour Forecast Curve</h3>
        </div>

        {/* Selected Hour Snapshot */}
        {activeItem && activeCondition && (
          <div className="text-right text-xs">
            <div className="font-semibold text-white">
              {formatHour(activeItem.time)}: <span className="text-amber-300 font-mono">{formatTemp(activeItem.temperature)}</span>
            </div>
            <div className="text-slate-400 flex items-center justify-end gap-2 text-[11px]">
              <span>{activeCondition.label}</span>
              <span>·</span>
              <span className="text-sky-300 flex items-center gap-0.5">
                <Droplets className="w-3 h-3" />
                {activeItem.precipitationProbability}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Temperature Curve Graph */}
      <div className="w-full overflow-hidden my-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-32 overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#tempGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? 5 : 2.5}
                fill={hoveredIdx === idx ? '#fbbf24' : '#f59e0b'}
                className="transition-all"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Interactive Horizontal Hour Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
        {items.map((item, idx) => {
          const isSelected = hoveredIdx === idx;
          const condition = getWeatherCondition(item.weatherCode, item.isDay);

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              className={`flex flex-col items-center justify-between p-2 rounded-xl min-w-[62px] text-center cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-sm'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <span className="text-[11px] font-mono text-slate-400">
                {formatHour(item.time)}
              </span>
              <span className="text-xs font-bold text-white font-mono tabular-nums my-1">
                {formatTemp(item.temperature)}
              </span>
              <div className="h-6 flex items-center justify-center">
                {item.precipitationProbability > 0 ? (
                  <span className="text-[10px] text-sky-400 font-medium">
                    {item.precipitationProbability}%
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
