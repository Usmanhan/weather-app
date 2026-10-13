import React from 'react';
import { Compass, MapPin, Sliders, Moon, CloudSun, Calendar } from 'lucide-react';
import { Location } from '../types';

interface TopNavProps {
  activeLocation: Location;
  onOpenSearch: () => void;
  onOpenCustomizer: () => void;
  themeNavClass: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeLocation,
  onOpenSearch,
  onOpenCustomizer,
  themeNavClass,
}) => {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 lg:px-8 py-3.5 transition-colors ${themeNavClass}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark & Location switch */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-amber-500/20">
              <Moon className="w-4 h-4 fill-slate-950" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
              Barakah Weather
            </span>
          </a>

          {/* Quick location picker button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-slate-200 hover:text-white transition-colors truncate max-w-[160px] sm:max-w-[220px]"
            title="Change Location"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{activeLocation.name}</span>
          </button>
        </div>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#weather"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <CloudSun className="w-4 h-4" />
            Weather
          </a>
          <a
            href="#nimaz"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            Nimaz Timings
          </a>
          <a
            href="#qibla"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            Qibla Finder
          </a>
          <a
            href="#dhikr"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Moon className="w-4 h-4" />
            Dhikr & Sunnah
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-400/20 whitespace-nowrap shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Dashboard</span>
          </button>
        </div>
      </div>
    </header>
  );
};
