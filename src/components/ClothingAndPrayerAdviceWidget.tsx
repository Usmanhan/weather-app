import React from 'react';
import { Shirt, Umbrella, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { CurrentWeather, NextPrayerInfo } from '../types';

interface ClothingAndPrayerAdviceWidgetProps {
  current: CurrentWeather;
  nextPrayer: NextPrayerInfo;
  cardBgClass: string;
}

export const ClothingAndPrayerAdviceWidget: React.FC<ClothingAndPrayerAdviceWidgetProps> = ({
  current,
  nextPrayer,
  cardBgClass,
}) => {
  // Determine clothing recommendation
  const getClothingAdvice = () => {
    if (current.temperature < 5) {
      return {
        label: 'Heavy Thermal Winter Wear',
        detail: 'Heavy coat, scarf, and insulated footwear needed, especially during early Fajr and late Isha.',
      };
    }
    if (current.temperature < 15) {
      return {
        label: 'Medium Layers & Jacket',
        detail: 'A sweater, windbreaker, or light coat is ideal for the brisk temperature.',
      };
    }
    if (current.temperature < 25) {
      return {
        label: 'Breathable Cotton Attire',
        detail: 'Comfortable light shirts or modest cotton thobes. Ideal ambient temperature for walking.',
      };
    }
    return {
      label: 'Lightweight & UV Protected',
      detail: 'Loose, light-colored clothing and stay hydrated. Seek shade during midday Dhuhr sun.',
    };
  };

  // Determine outdoor prayer suitability
  const getOutdoorSuitability = () => {
    if (current.precipitation > 0) {
      return {
        status: 'Indoor Prayer Recommended',
        reason: 'Active rain detected. Head indoors or into the mosque prayer hall.',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      };
    }
    if (current.windSpeed > 35) {
      return {
        status: 'Windy Conditions',
        reason: 'Strong gusts may disturb prayer mats outdoors. Indoor prayer advised.',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      };
    }
    if (current.temperature > 38) {
      return {
        status: 'Extreme Heat',
        reason: 'High ambient temperature. Pray in air-conditioned or shaded areas.',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      };
    }
    return {
      status: 'Ideal for Outdoor Prayer',
      reason: 'Calm winds and comfortable atmosphere suitable for praying on terrace or courtyard.',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
  };

  const clothing = getClothingAdvice();
  const outdoor = getOutdoorSuitability();
  const needsUmbrella = current.precipitation > 0 || current.relativeHumidity > 85;

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Environmental Advice</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Weather & Prayer Lifestyle Guidance</h3>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${outdoor.badgeColor}`}>
          {outdoor.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
        {/* 1. Clothing */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
            <Shirt className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Clothing Recommendation</div>
            <div className="text-sm font-semibold text-white mt-0.5">{clothing.label}</div>
            <p className="text-xs text-slate-400 mt-1">{clothing.detail}</p>
          </div>
        </div>

        {/* 2. Mosque Walk & Umbrella */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 shrink-0">
            <Umbrella className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Jama'ah Walk & Umbrella</div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {needsUmbrella ? 'Bring Umbrella' : 'Clear Walk to Mosque'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {needsUmbrella
                ? `Carry an umbrella for your walk to the mosque for ${nextPrayer.name}.`
                : `Pleasant walking conditions expected for ${nextPrayer.name} prayer.`}
            </p>
          </div>
        </div>

        {/* 3. Outdoor Prayer Suitability */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Courtyard & Outdoor Space</div>
            <div className="text-sm font-semibold text-white mt-0.5">{outdoor.status}</div>
            <p className="text-xs text-slate-400 mt-1">{outdoor.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
