import React from 'react';
import { Calendar, Moon, Sun, Sunrise, Sunset, Clock, Sparkles } from 'lucide-react';
import { PrayerSchedule } from '../types';

interface PrayerTimesWidgetProps {
  schedule: PrayerSchedule;
  onOpenMonthlyModal: () => void;
  cardBgClass: string;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  schedule,
  onOpenMonthlyModal,
  cardBgClass,
}) => {
  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'Fajr':
        return <Sunrise className="w-4 h-4 text-amber-300" />;
      case 'Sunrise':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Dhuhr':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'Asr':
        return <Sun className="w-4 h-4 text-orange-400" />;
      case 'Maghrib':
        return <Sunset className="w-4 h-4 text-rose-400" />;
      case 'Isha':
        return <Moon className="w-4 h-4 text-indigo-300" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div id="nimaz" className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Moon className="w-3.5 h-3.5" />
            <span>Daily Nimaz Timetable</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Prayer Schedules</h3>
          <p className="text-xs text-slate-400">
            {schedule.methodName} · {schedule.schoolName}
          </p>
        </div>

        <button
          onClick={onOpenMonthlyModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors whitespace-nowrap"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Full Month Table</span>
        </button>
      </div>

      {/* Grid of Main 6 Times */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
        {schedule.items.map((item) => {
          return (
            <div
              key={item.name}
              className={`p-3 rounded-xl border transition-all relative overflow-hidden ${
                item.isNext
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {item.isNext && (
                <div className="absolute top-1 right-2 text-[10px] font-semibold tracking-wider text-amber-400 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>NEXT</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                {getPrayerIcon(item.name)}
                <span className="text-xs font-medium text-white">{item.name}</span>
                <span className="text-xs font-serif text-slate-400 ml-auto">
                  {item.arabicName}
                </span>
              </div>
              <div className="text-lg font-mono font-bold text-white tabular-nums">
                {item.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Spiritual Timings Bar */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Voluntary & Night Calculations
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[10px]">Imsak (Suhoor ends)</div>
            <div className="font-mono font-semibold text-slate-200 tabular-nums">
              {schedule.imsak}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[10px]">Duha / Ishraq</div>
            <div className="font-mono font-semibold text-slate-200 tabular-nums">
              {schedule.duha}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[10px]">Islamic Midnight</div>
            <div className="font-mono font-semibold text-slate-200 tabular-nums">
              {schedule.midnight}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-black/20 border border-white/5">
            <div className="text-amber-400/90 text-[10px]">Tahajjud (Last 1/3)</div>
            <div className="font-mono font-semibold text-amber-300 tabular-nums">
              {schedule.lastThird}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
