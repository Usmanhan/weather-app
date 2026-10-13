import React from 'react';
import { Wind, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AirQualityData } from '../types';

interface AirQualityWidgetProps {
  airQuality: AirQualityData;
  cardBgClass: string;
}

export const AirQualityWidget: React.FC<AirQualityWidgetProps> = ({
  airQuality,
  cardBgClass,
}) => {
  const getProgressWidth = (aqi: number) => {
    return Math.min(100, Math.max(5, (aqi / 200) * 100));
  };

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span>Environmental Health</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Air Quality Index</h3>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${airQuality.colorClass}`}>
          {airQuality.label}
        </div>
      </div>

      {/* Main AQI Score & Gauge */}
      <div className="flex items-baseline gap-4 my-4">
        <span className="text-5xl font-extrabold text-white font-mono tabular-nums">
          {airQuality.aqi}
        </span>
        <div className="space-y-1">
          <div className="text-xs text-slate-300 font-medium">
            US AQI Metric
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            {airQuality.description}
          </p>
        </div>
      </div>

      {/* Visual Bar Gauge */}
      <div className="space-y-1.5 my-3">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all duration-700"
            style={{ width: `${getProgressWidth(airQuality.aqi)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0 Good</span>
          <span>50 Moderate</span>
          <span>100 Unhealthy</span>
          <span>150+ Alert</span>
        </div>
      </div>

      {/* Particulate breakdown */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-slate-400 text-[11px] mb-1">PM2.5 Fine Particles</div>
          <div className="text-base font-mono font-bold text-white tabular-nums">
            {airQuality.pm2_5} <span className="text-xs font-normal text-slate-400">μg/m³</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-slate-400 text-[11px] mb-1">PM10 Coarse Dust</div>
          <div className="text-base font-mono font-bold text-white tabular-nums">
            {airQuality.pm10} <span className="text-xs font-normal text-slate-400">μg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
};
