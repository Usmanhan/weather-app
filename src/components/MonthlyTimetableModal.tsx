import React, { useState, useEffect } from 'react';
import { X, Calendar, Printer, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Location } from '../types';
import { fetchMonthlyCalendar, formatPrayerTime } from '../services/prayerService';

interface MonthlyTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  prayerMethod: number;
  asrSchool: 'standard' | 'hanafi';
  timeFormat: '12h' | '24h';
}

interface CalendarDayItem {
  date: {
    readable: string;
    gregorian: { day: string; month: { en: string }; weekday: { en: string } };
    hijri: { day: string; month: { en: string }; year: string };
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

export const MonthlyTimetableModal: React.FC<MonthlyTimetableModalProps> = ({
  isOpen,
  onClose,
  location,
  prayerMethod,
  asrSchool,
  timeFormat,
}) => {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [days, setDays] = useState<CalendarDayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetchMonthlyCalendar(location.latitude, location.longitude, year, month, prayerMethod, asrSchool)
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setDays(data);
          } else {
            setDays([]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDays([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, location, year, month, prayerMethod, asrSchool]);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Monthly Prayer Timetable</h2>
              <p className="text-xs text-slate-400">
                {location.name}, {location.country} · {monthNames[month - 1]} {year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-white px-2">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="ml-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print Timetable"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timetable Table Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span>Fetching astronomical calendar calculations...</span>
            </div>
          ) : days.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Unable to load calendar for this period. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-3">Day / Date</th>
                    <th className="py-3 px-2">Hijri</th>
                    <th className="py-3 px-2 text-right">Fajr</th>
                    <th className="py-3 px-2 text-right">Sunrise</th>
                    <th className="py-3 px-2 text-right">Dhuhr</th>
                    <th className="py-3 px-2 text-right">Asr</th>
                    <th className="py-3 px-2 text-right">Maghrib</th>
                    <th className="py-3 px-2 text-right">Isha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono tabular-nums">
                  {days.map((d, idx) => {
                    const isToday =
                      currentDate.getDate().toString() === d.date.gregorian.day &&
                      currentDate.getMonth() + 1 === month &&
                      currentDate.getFullYear() === year;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isToday ? 'bg-amber-500/10 text-amber-200 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-sans">
                          <span className="font-medium text-white">{d.date.gregorian.day}</span>{' '}
                          <span className="text-slate-400 text-[11px]">{d.date.gregorian.weekday.en.slice(0, 3)}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-400 font-sans text-[11px]">
                          {d.date.hijri.day} {d.date.hijri.month.en.slice(0, 4)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {formatPrayerTime(d.timings.Fajr, timeFormat)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-400">
                          {formatPrayerTime(d.timings.Sunrise, timeFormat)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {formatPrayerTime(d.timings.Dhuhr, timeFormat)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {formatPrayerTime(d.timings.Asr, timeFormat)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-rose-300">
                          {formatPrayerTime(d.timings.Maghrib, timeFormat)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-indigo-300">
                          {formatPrayerTime(d.timings.Isha, timeFormat)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
