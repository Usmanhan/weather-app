import React, { useState, useEffect, useRef } from 'react';
import { Compass, Navigation, Sun, CheckCircle2, RotateCw } from 'lucide-react';
import { QiblaData, Location } from '../types';
import { getCardinalDirection } from '../services/qiblaService';
import { playSereneChime } from '../services/prayerService';

interface QiblaCompassWidgetProps {
  qibla: QiblaData;
  location: Location;
  vibrationFeedback: boolean;
  cardBgClass: string;
}

export const QiblaCompassWidget: React.FC<QiblaCompassWidgetProps> = ({
  qibla,
  location,
  vibrationFeedback,
  cardBgClass,
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [sensorPermissionNeeded, setSensorPermissionNeeded] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const alignedNotifiedRef = useRef<boolean>(false);

  // Effective compass heading
  const currentHeading = isManualMode ? manualHeading : deviceHeading;

  // Relative angle to Qibla: how many degrees to turn
  // If user heads in currentHeading, Qibla needle is at (qibla.bearingDeg - currentHeading)
  const relativeAngle = ((qibla.bearingDeg - currentHeading) % 360 + 360) % 360;
  const isAligned = relativeAngle < 3.5 || relativeAngle > 356.5;

  useEffect(() => {
    if (isAligned && !alignedNotifiedRef.current) {
      alignedNotifiedRef.current = true;
      if (vibrationFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {
          // ignore
        }
      }
    } else if (!isAligned) {
      alignedNotifiedRef.current = false;
    }
  }, [isAligned, vibrationFeedback]);

  // Set up device orientation sensor listener
  useEffect(() => {
    // Check if permission is needed on iOS 13+
    const OrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof OrientationEvent !== 'undefined' && typeof OrientationEvent.requestPermission === 'function') {
      setSensorPermissionNeeded(true);
    } else {
      startListening();
    }

    function handleOrientation(e: DeviceOrientationEvent) {
      let heading = 0;
      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        // iOS provides direct compass heading
        heading = webkitHeading;
      } else if (e.alpha !== null && !isNaN(e.alpha)) {
        // Android provides alpha (0 to 360)
        heading = (360 - e.alpha) % 360;
      }

      setDeviceHeading(Math.round(heading));
      setHasSensor(true);
    }

    function startListening() {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const requestSensorPermission = async () => {
    const OrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof OrientationEvent?.requestPermission === 'function') {
      try {
        const response = await OrientationEvent.requestPermission();
        if (response === 'granted') {
          setSensorPermissionNeeded(false);
          setHasSensor(true);
          window.addEventListener(
            'deviceorientation',
            (e: DeviceOrientationEvent) => {
              const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
              if (typeof webkitHeading === 'number') {
                setDeviceHeading(Math.round(webkitHeading));
              }
            },
            true
          );
        }
      } catch {
        // Permission dismissed
      }
    }
  };

  const cardinal = getCardinalDirection(qibla.bearingDeg);

  return (
    <div id="qibla" className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Sacred Direction</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Qibla Finder</h3>
          <p className="text-xs text-slate-400">
            From {location.name} to the Holy Kaaba in Makkah al-Mukarramah
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-mono font-bold text-amber-300 tabular-nums">
            {qibla.bearingDeg}° {cardinal}
          </div>
          <div className="text-[11px] text-slate-400">
            {qibla.distanceKm.toLocaleString()} km ({qibla.distanceMiles.toLocaleString()} mi)
          </div>
        </div>
      </div>

      {/* Sensor Permission Notice for iOS if applicable */}
      {sensorPermissionNeeded && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-amber-300">
            Allow compass sensor access for live orientation tracking:
          </span>
          <button
            onClick={requestSensorPermission}
            className="px-3 py-1 text-xs font-medium bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shrink-0"
          >
            Enable Sensor
          </button>
        </div>
      )}

      {/* Interactive Compass Dial */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none">
          {/* Alignment status halo */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isAligned
                ? 'bg-amber-400/20 blur-xl scale-105'
                : 'bg-transparent'
            }`}
          />

          {/* Compass Outer Bezel */}
          <svg className="w-full h-full" viewBox="0 0 280 280">
            {/* Outer Ring */}
            <circle
              cx="140"
              cy="140"
              r="132"
              fill="rgba(15, 23, 42, 0.6)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2"
            />
            <circle
              cx="140"
              cy="140"
              r="124"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />

            {/* Rotating dial group based on user device heading */}
            <g
              transform={`rotate(${-currentHeading}, 140, 140)`}
              className="transition-transform duration-150 ease-out"
            >
              {/* Degree Ticks */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                const isMajor = angle % 30 === 0;
                const r1 = 124;
                const r2 = isMajor ? 112 : 118;
                const rad = (angle * Math.PI) / 180;
                const x1 = 140 + r1 * Math.sin(rad);
                const y1 = 140 - r1 * Math.cos(rad);
                const x2 = 140 + r2 * Math.sin(rad);
                const y2 = 140 - r2 * Math.cos(rad);

                return (
                  <line
                    key={angle}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMajor ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={isMajor ? 1.5 : 1}
                  />
                );
              })}

              {/* Cardinal Markers: N, E, S, W */}
              <text x="140" y="32" fill="#ef4444" fontSize="13" fontWeight="bold" textAnchor="middle">
                N
              </text>
              <text x="250" y="145" fill="rgba(255, 255, 255, 0.7)" fontSize="12" fontWeight="600" textAnchor="middle">
                E
              </text>
              <text x="140" y="260" fill="rgba(255, 255, 255, 0.7)" fontSize="12" fontWeight="600" textAnchor="middle">
                S
              </text>
              <text x="30" y="145" fill="rgba(255, 255, 255, 0.7)" fontSize="12" fontWeight="600" textAnchor="middle">
                W
              </text>

              {/* Qibla Direction Indicator (Kaaba Golden Beam) */}
              <g transform={`rotate(${qibla.bearingDeg}, 140, 140)`}>
                {/* Ray line */}
                <line
                  x1="140"
                  y1="140"
                  x2="140"
                  y2="28"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />

                {/* Kaaba Icon / Golden Pointer */}
                <g transform="translate(140, 24)">
                  <polygon points="0,-10 7,8 -7,8" fill="#f59e0b" />
                  {/* Stylized Kaaba cube */}
                  <rect x="-8" y="-2" width="16" height="15" rx="2" fill="#000000" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="-8" y1="3" x2="8" y2="3" stroke="#f59e0b" strokeWidth="1.2" />
                </g>
              </g>

              {/* Sun Position marker for indoor calibration */}
              <g transform={`rotate(${qibla.sunAzimuthDeg}, 140, 140)`}>
                <circle cx="140" cy="50" r="4" fill="#fbbf24" />
                <circle cx="140" cy="50" r="7" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              </g>
            </g>

            {/* Static device orientation center crosshair */}
            <circle cx="140" cy="140" r="5" fill="#f59e0b" />
            <circle cx="140" cy="140" r="14" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
            <line x1="140" y1="120" x2="140" y2="105" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Central Alignment Badge */}
          {isAligned && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-bold text-xs shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Facing Qibla</span>
              </div>
            </div>
          )}
        </div>

        {/* Alignment instructions */}
        <div className="text-center mt-2 max-w-sm">
          {isAligned ? (
            <p className="text-xs font-semibold text-emerald-400">
              Directly facing the Holy Kaaba. You are ready for prayer.
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Rotate your device until the golden Kaaba needle aligns directly with the top red marker.
            </p>
          )}
        </div>
      </div>

      {/* Manual Compass Simulation & Sun Calibration Controls */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Sun position: <strong className="text-white font-mono">{qibla.sunAzimuthDeg}°</strong> (useful for calibrating indoors)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualMode(!isManualMode)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isManualMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="w-3 h-3" />
              <span>{isManualMode ? 'Manual Dial Active' : 'Test Dial Manually'}</span>
            </button>
          </div>
        </div>

        {/* Manual rotation slider if active or when testing on desktop */}
        {isManualMode && (
          <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Simulate Device Heading:</span>
              <span className="font-mono font-bold text-amber-300">{manualHeading}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={manualHeading}
              onChange={(e) => setManualHeading(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0° (N)</span>
              <span>90° (E)</span>
              <span>180° (S)</span>
              <span>270° (W)</span>
              <span>360° (N)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
