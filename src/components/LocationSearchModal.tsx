import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Navigation, Star, Check, Loader2 } from 'lucide-react';
import { Location } from '../types';
import { searchLocations, POPULAR_LOCATIONS } from '../services/weatherService';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLocation: Location;
  savedLocations: Location[];
  onSelectLocation: (loc: Location) => void;
  onToggleSaveLocation: (loc: Location) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  activeLocation,
  savedLocations,
  onSelectLocation,
  onToggleSaveLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
      setErrorMsg(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await searchLocations(query);
        setResults(res);
        if (res.length === 0) {
          setErrorMsg('No matching cities found. Try checking the spelling.');
        }
      } catch {
        setErrorMsg('Search error. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocoding or fallback to coordinates name
          const revRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(2)},${longitude.toFixed(2)}&count=1`
          ).catch(() => null);

          let name = 'Current Location';
          let country = '';
          if (revRes && revRes.ok) {
            const data = await revRes.json().catch(() => null);
            if (data?.results?.[0]) {
              name = data.results[0].name;
              country = data.results[0].country || '';
            }
          }

          const detectedLoc: Location = {
            id: `geo-${Date.now()}`,
            name: name !== 'Current Location' ? name : `Local (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
            country: country || 'Detected',
            latitude,
            longitude,
            isCustom: true,
          };

          onSelectLocation(detectedLoc);
          setGeoLoading(false);
          onClose();
        } catch {
          const fallbackLoc: Location = {
            id: `geo-${Date.now()}`,
            name: `My Coordinates`,
            country: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
            latitude,
            longitude,
          };
          onSelectLocation(fallbackLoc);
          setGeoLoading(false);
          onClose();
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location access was denied. Please select or search for your city above.');
        } else {
          setErrorMsg('Unable to retrieve your current location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, town or region worldwide..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors shrink-0"
          >
            Esc
          </button>
        </div>

        {/* GPS Location Button */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handleGetCurrentLocation}
            disabled={geoLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
          >
            {geoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Locating your coordinates...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Use Current GPS Location</span>
              </>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Search Results ({results.length})
              </div>
              <div className="space-y-1">
                {results.map((loc) => {
                  const isSaved = savedLocations.some((s) => s.id === loc.id || (Math.abs(s.latitude - loc.latitude) < 0.05 && Math.abs(s.longitude - loc.longitude) < 0.05));
                  const isCurrentActive = activeLocation.id === loc.id || (Math.abs(activeLocation.latitude - loc.latitude) < 0.05 && Math.abs(activeLocation.longitude - loc.longitude) < 0.05);

                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        isCurrentActive
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium text-sm text-white">{loc.name}</span>
                          <span className="text-xs text-slate-400 ml-2">
                            {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrentActive && <Check className="w-4 h-4 text-amber-400" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveLocation(loc);
                          }}
                          className="p-1 hover:text-amber-400 text-slate-400 transition-colors"
                          title={isSaved ? 'Remove from saved' : 'Save location'}
                        >
                          <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Locations */}
          {savedLocations.length > 0 && results.length === 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Saved Favorites ({savedLocations.length})</span>
              </div>
              <div className="space-y-1">
                {savedLocations.map((loc) => {
                  const isCurrentActive = activeLocation.name === loc.name;
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        isCurrentActive
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium text-sm text-white">{loc.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{loc.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrentActive && <Check className="w-4 h-4 text-amber-400" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveLocation(loc);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove bookmark"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Cities */}
          {results.length === 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Popular Cities & Holy Sanctuaries
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isCurrentActive = activeLocation.name === loc.name;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-colors truncate ${
                        isCurrentActive
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-medium text-white truncate">{loc.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{loc.country}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
