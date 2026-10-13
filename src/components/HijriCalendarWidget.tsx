import React from 'react';
import { Calendar, Moon, BookOpen, Sparkles } from 'lucide-react';
import { HijriDateInfo } from '../types';

interface HijriCalendarWidgetProps {
  hijri: HijriDateInfo;
  cardBgClass: string;
}

export const HijriCalendarWidget: React.FC<HijriCalendarWidgetProps> = ({
  hijri,
  cardBgClass,
}) => {
  const gregorianToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dayOfWeek = new Date().getDay(); // 0 is Sunday, 5 is Friday, 1 is Monday, 4 is Thursday

  const getSunnahReminder = () => {
    if (dayOfWeek === 5) {
      return {
        title: "Blessed Friday (Jumu'ah)",
        text: "Recite Surah Al-Kahf, perform ghusl, arrive early for Friday prayer, and send abundant Salawat upon Prophet Muhammad ﷺ.",
      };
    }
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      return {
        title: "Sunnah Fasting Day",
        text: "The Prophet ﷺ used to eagerly observe voluntary fasting on Mondays and Thursdays, noting deeds are presented to Allah.",
      };
    }
    return {
      title: "Daily Sunnah & Dhikr",
      text: "Remember Allah morning and evening. 'Keep your tongue moist with the remembrance of Allah.' (Sunan al-Tirmidhi)",
    };
  };

  const sunnah = getSunnahReminder();

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Moon className="w-3.5 h-3.5" />
            <span>Islamic Lunar Date</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Hijri Calendar</h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
          Year {hijri.year} {hijri.designation}
        </div>
      </div>

      {/* Hijri Callout */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/5 my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {hijri.day} {hijri.monthEn} {hijri.year} {hijri.designation}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Gregorian: {gregorianToday}
          </div>
        </div>

        <div className="text-2xl font-serif text-amber-300/90 sm:text-right">
          {hijri.day} {hijri.monthAr} {hijri.year} هـ
        </div>
      </div>

      {/* Sunnah Reflection Box */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1.5">
          <BookOpen className="w-4 h-4" />
          <span>{sunnah.title}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {sunnah.text}
        </p>
      </div>
    </div>
  );
};
