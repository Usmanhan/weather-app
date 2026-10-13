import React, { useState } from 'react';
import { RotateCcw, Sparkles, Check, Heart } from 'lucide-react';

interface TasbeehPreset {
  id: string;
  name: string;
  arabic: string;
  translation: string;
  target: number;
}

const DHIKR_PRESETS: TasbeehPreset[] = [
  {
    id: 'subhanallah',
    name: 'SubhanAllah',
    arabic: 'سُبْحَانَ اللَّهِ',
    translation: 'Glory be to Allah',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    name: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    translation: 'All praise is for Allah',
    target: 33,
  },
  {
    id: 'allahuakbar',
    name: 'Allahu Akbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    target: 34,
  },
  {
    id: 'astaghfirullah',
    name: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    translation: 'I seek forgiveness from Allah',
    target: 100,
  },
  {
    id: 'tahlil',
    name: 'La ilaha illallah',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    translation: 'There is no deity except Allah',
    target: 100,
  },
];

interface DigitalTasbeehWidgetProps {
  vibrationFeedback: boolean;
  cardBgClass: string;
}

export const DigitalTasbeehWidget: React.FC<DigitalTasbeehWidgetProps> = ({
  vibrationFeedback,
  cardBgClass,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<TasbeehPreset>(DHIKR_PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [cycles, setCycles] = useState<number>(0);

  const handleIncrement = () => {
    const nextCount = count + 1;
    if (nextCount >= selectedPreset.target) {
      setCount(0);
      setCycles((prev) => prev + 1);

      if (vibrationFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 60]);
        } catch {
          // ignore
        }
      }
    } else {
      setCount(nextCount);
      if (vibrationFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate(20);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    setCycles(0);
  };

  const progressPercent = Math.min(100, (count / selectedPreset.target) * 100);

  return (
    <div id="dhikr" className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Heart className="w-3.5 h-3.5" />
            <span>Digital Remembrance</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Tasbeeh Counter</h3>
        </div>

        <button
          onClick={handleReset}
          className="p-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
          title="Reset Counter"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset selector tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
        {DHIKR_PRESETS.map((p) => {
          const isActive = selectedPreset.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPreset(p);
                setCount(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Central Arabic Dhikr Display & Big Touch Button */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="text-center mb-4">
          <div className="text-2xl sm:text-3xl font-serif text-amber-300 font-bold tracking-wide">
            {selectedPreset.arabic}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            "{selectedPreset.translation}"
          </div>
        </div>

        {/* Big Interactive Tap Circle */}
        <button
          onClick={handleIncrement}
          className="relative w-44 h-44 rounded-full bg-gradient-to-b from-white/10 to-black/30 border-2 border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform cursor-pointer group"
        >
          {/* Circular progress SVG */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="4"
            />
            <circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="502.65"
              strokeDashoffset={502.65 - (502.65 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          </svg>

          <span className="text-5xl font-extrabold text-white font-mono tabular-nums tracking-tighter">
            {count}
          </span>
          <span className="text-[11px] text-amber-400 font-medium uppercase tracking-wider mt-1">
            of {selectedPreset.target}
          </span>
        </button>

        <div className="flex items-center gap-4 text-xs text-slate-400 mt-4">
          <div>
            Completed Cycles: <strong className="text-white font-mono">{cycles}</strong>
          </div>
          <div>·</div>
          <div>
            Total Dhikr: <strong className="text-amber-300 font-mono">{cycles * selectedPreset.target + count}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
