import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Clock, Calendar } from 'lucide-react';
import { NextPrayerInfo, HijriDateInfo } from '../types';
import { playSereneChime } from '../services/prayerService';

interface NextPrayerBannerProps {
  nextPrayer: NextPrayerInfo;
  hijri: HijriDateInfo;
  adhanChimeEnabled: boolean;
  onToggleChime: () => void;
  cardBgClass: string;
}

export const NextPrayerBanner: React.FC<NextPrayerBannerProps> = ({
  nextPrayer,
  hijri,
  adhanChimeEnabled,
  onToggleChime,
  cardBgClass,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleTestChime = () => {
    setIsPlayingTest(true);
    playSereneChime();
    setTimeout(() => setIsPlayingTest(false), 2000);
  };

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all ${cardBgClass}`}>
      {/* Decorative ambient background glow */}
      <div className="absolute -right-16 -top-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side: Next prayer details & Hijri date */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Obligatory Prayer</span>
            <span className="text-slate-500">·</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{hijri.formatted}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {nextPrayer.name}
            </h2>
            <span className="text-xl sm:text-2xl font-serif text-amber-300/80">
              {nextPrayer.arabicName}
            </span>
            <span className="text-sm font-semibold text-slate-300">
              at {nextPrayer.timeString}
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-md">
            Prepare for ablution and prayer. Keep your heart attached to the remembrance of Allah.
          </p>
        </div>

        {/* Right side: Countdown timer & Adhan audio controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-black/30 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Time Remaining
              </div>
              <div className="text-2xl font-mono font-bold text-amber-300 tabular-nums tracking-wide">
                {nextPrayer.timeRemainingFormatted}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleChime}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                adhanChimeEnabled
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={adhanChimeEnabled ? 'Adhan chime enabled' : 'Adhan chime muted'}
            >
              {adhanChimeEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs hidden sm:inline">Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="text-xs hidden sm:inline">Muted</span>
                </>
              )}
            </button>

            <button
              onClick={handleTestChime}
              disabled={isPlayingTest}
              className="px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors whitespace-nowrap"
            >
              {isPlayingTest ? 'Playing...' : 'Test Sound'}
            </button>
          </div>
        </div>
      </div>

      {/* Elapsed window progress bar */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Current Prayer Interval</span>
          <span className="font-mono tabular-nums text-slate-300">{nextPrayer.progressPercent}% elapsed</span>
        </div>
        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 rounded-full transition-all duration-1000"
            style={{ width: `${nextPrayer.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
