import React, { useState } from 'react';
import {
  X,
  Sliders,
  Palette,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Volume2,
  Clock,
  Compass,
  Check,
  Smartphone,
  Layers,
} from 'lucide-react';
import { AppTheme, UserSettings, WidgetConfig } from '../types';
import { PRAYER_METHODS } from '../services/prayerService';
import { DEFAULT_WIDGETS } from '../services/dashboardConfig';

interface CustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetSettings: () => void;
}

export const CustomizationDrawer: React.FC<CustomizationDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'theme' | 'units' | 'prayer'>('widgets');

  if (!isOpen) return null;

  const handleToggleWidget = (id: string) => {
    const updated = settings.widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    onUpdateSettings({ ...settings, widgets: updated });
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const newWidgets = [...settings.widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newWidgets.length) return;

    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;

    // Reassign order
    const ordered = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    onUpdateSettings({ ...settings, widgets: ordered });
  };

  const handleToggleColSpan = (id: string) => {
    const updated = settings.widgets.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          colSpan: w.colSpan === 'full' ? ('half' as const) : ('full' as const),
        };
      }
      return w;
    });
    onUpdateSettings({ ...settings, widgets: updated });
  };

  const themes: { id: AppTheme; name: string; previewClass: string }[] = [
    {
      id: 'celestial',
      name: 'Celestial Midnight',
      previewClass: 'from-[#0b0f19] to-[#0f172a] border-slate-700',
    },
    {
      id: 'emerald',
      name: 'Serene Emerald',
      previewClass: 'from-[#061811] to-[#0b2b1f] border-emerald-700',
    },
    {
      id: 'dune',
      name: 'Desert Dune',
      previewClass: 'from-[#18120e] to-[#291e18] border-amber-800',
    },
    {
      id: 'nordic',
      name: 'Nordic Frost',
      previewClass: 'from-[#0c1626] to-[#14233c] border-sky-800',
    },
    {
      id: 'obsidian',
      name: 'OLED Obsidian',
      previewClass: 'from-black to-neutral-900 border-neutral-700',
    },
    {
      id: 'clean',
      name: 'Porcelain Clean',
      previewClass: 'from-slate-100 to-white border-slate-300 text-slate-900',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Customize Your Dashboard</h2>
              <p className="text-xs text-slate-400">Personalize widgets, appearance, and calculation rules</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'widgets'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Widgets</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'theme'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Themes</span>
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'units'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Units</span>
          </button>
          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'prayer'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Nimaz</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: Widgets & Layout */}
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Toggle visibility and reorder cards:</span>
                <button
                  onClick={() => onUpdateSettings({ ...settings, widgets: DEFAULT_WIDGETS })}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Order</span>
                </button>
              </div>

              <div className="space-y-2">
                {settings.widgets.map((w, index) => (
                  <div
                    key={w.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      w.enabled
                        ? 'bg-slate-800/80 border-slate-700 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleWidget(w.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          w.enabled
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title={w.enabled ? 'Hide widget' : 'Show widget'}
                      >
                        {w.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <div className="truncate">
                        <div className="text-sm font-medium truncate">{w.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{w.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleToggleColSpan(w.id)}
                        className="px-2 py-1 text-[10px] font-mono uppercase bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors"
                        title="Toggle full vs half column width"
                      >
                        {w.colSpan === 'full' ? 'Full' : 'Half'}
                      </button>

                      <button
                        disabled={index === 0}
                        onClick={() => handleMoveWidget(index, 'up')}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === settings.widgets.length - 1}
                        onClick={() => handleMoveWidget(index, 'down')}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Themes */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Choose an aesthetic background and color scheme:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => {
                  const isCurrent = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ ...settings, theme: t.id })}
                      className={`p-3.5 rounded-xl border text-left bg-gradient-to-br transition-all flex flex-col justify-between h-24 ${
                        t.previewClass
                      } ${
                        isCurrent
                          ? 'ring-2 ring-amber-400 border-amber-400'
                          : 'hover:border-slate-500'
                      }`}
                    >
                      <span className="text-xs font-semibold">{t.name}</span>
                      {isCurrent && (
                        <span className="self-end p-1 rounded-full bg-amber-400 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Units */}
          {activeTab === 'units' && (
            <div className="space-y-6">
              {/* Temperature Unit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Temperature Unit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, tempUnit: 'celsius' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.tempUnit === 'celsius'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, tempUnit: 'fahrenheit' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.tempUnit === 'fahrenheit'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>

              {/* Wind Speed Unit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Wind Speed Unit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, windUnit: 'kmh' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.windUnit === 'kmh'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    km/h
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, windUnit: 'mph' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.windUnit === 'mph'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    mph
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, windUnit: 'ms' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.windUnit === 'ms'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    m/s
                  </button>
                </div>
              </div>

              {/* Time Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Time Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, timeFormat: '12h' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.timeFormat === '12h'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    12-Hour (AM/PM)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, timeFormat: '24h' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.timeFormat === '24h'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    24-Hour (00:00 - 23:59)
                  </button>
                </div>
              </div>

              {/* Vibration Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">Haptic Vibration</div>
                  <div className="text-[11px] text-slate-400">Vibrate on Qibla alignment and Tasbeeh targets</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, vibrationFeedback: !settings.vibrationFeedback })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.vibrationFeedback ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.vibrationFeedback ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Prayer & Jurisprudence */}
          {activeTab === 'prayer' && (
            <div className="space-y-6">
              {/* Calculation Method */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Calculation Method
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {PRAYER_METHODS.map((method) => {
                    const isSelected = settings.prayerMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => onUpdateSettings({ ...settings, prayerMethod: method.id })}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                            : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-medium text-white">{method.name}</div>
                          <div className="text-[11px] text-slate-400">{method.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Asr Juristic School */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Asr Juristic Calculation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, asrSchool: 'standard' })}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      settings.asrSchool === 'standard'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-medium text-white">Standard / Shafi'i</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Shafi'i, Maliki, Hanbali (Shadow 1x)</div>
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, asrSchool: 'hanafi' })}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      settings.asrSchool === 'hanafi'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-medium text-white">Hanafi School</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Later Asr timing (Shadow 2x)</div>
                  </button>
                </div>
              </div>

              {/* Adhan Audio Chime */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">Adhan Prayer Chime</div>
                  <div className="text-[11px] text-slate-400">Play harmonic reminder sound when prayer starts</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, adhanChimeEnabled: !settings.adhanChimeEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.adhanChimeEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.adhanChimeEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={onResetSettings}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-md shadow-amber-400/20"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
