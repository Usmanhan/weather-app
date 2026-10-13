import { HijriDateInfo, NextPrayerInfo, PrayerSchedule, PrayerTimeItem } from '../types';

export const PRAYER_METHODS = [
  { id: 3, name: 'Muslim World League (MWL)', desc: 'Fajr 18°, Isha 17°' },
  { id: 2, name: 'Islamic Society of North America (ISNA)', desc: 'Fajr 15°, Isha 15°' },
  { id: 4, name: 'Umm Al-Qura University, Makkah', desc: 'Fajr 18.5°, Isha +90 min' },
  { id: 1, name: 'University of Islamic Sciences, Karachi', desc: 'Fajr 18°, Isha 18°' },
  { id: 5, name: 'Egyptian General Authority', desc: 'Fajr 19.5°, Isha 17.5°' },
  { id: 7, name: 'University of Tehran (Geophysics)', desc: 'Fajr 17.7°, Isha 14°' },
  { id: 0, name: 'Shia Ithna-Ashari (Leva Institute)', desc: 'Fajr 16°, Isha 14°' },
  { id: 9, name: 'Kuwait Awqaf', desc: 'Fajr 18°, Isha 17.5°' },
  { id: 10, name: 'Qatar Awqaf', desc: 'Fajr 18°, Isha +90 min' },
  { id: 11, name: 'Majlis Ugama Islam Singapura (MUIS)', desc: 'Fajr 20°, Isha 18°' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey', desc: 'Fajr 18°, Isha 17°' },
];

export const HIJRI_MONTHS = [
  { en: 'Muharram', ar: 'المحرّم' },
  { en: 'Safar', ar: 'صفر' },
  { en: 'Rabi al-Awwal', ar: 'ربيع الأوّل' },
  { en: 'Rabi al-Thani', ar: 'ربيع الثاني' },
  { en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', ar: 'جمادى الآخرة' },
  { en: 'Rajab', ar: 'رجب' },
  { en: 'Shaban', ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوّال' },
  { en: 'Dhul Qadah', ar: 'ذو القعدة' },
  { en: 'Dhul Hijjah', ar: 'ذو الحجة' },
];

// Helper to format 24h time ("15:30") to 12h or 24h
export function formatPrayerTime(timeStr: string, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  const clean = timeStr.split(' ')[0]; // remove "(EST)" or timezone tags
  const [hourStr, minStr] = clean.split(':');
  const h = parseInt(hourStr, 10);
  const m = parseInt(minStr, 10);

  if (isNaN(h) || isNaN(m)) return timeStr;

  if (format === '24h') {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

// Convert "HH:MM" to total minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const clean = timeStr.split(' ')[0];
  const [h, m] = clean.split(':').map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

// Format minutes from midnight back to "HH:MM"
export function minutesToTime(totalMin: number): string {
  const normalized = ((Math.floor(totalMin) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Built-in Astronomical Calculation Engine (offline & resilience guarantee)
export function calculateAstronomicalTimes(
  date: Date,
  lat: number,
  lng: number,
  school: 'standard' | 'hanafi' = 'standard'
) {
  // Approximate Solar coordinates
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Fractional year
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in degrees
  const decl =
    deg *
    (0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) +
      0.000907 * Math.sin(2 * gamma) -
      0.002697 * Math.cos(3 * gamma) +
      0.00148 * Math.sin(3 * gamma));

  // Local solar noon in minutes from local midnight UTC
  const timeOffset = -date.getTimezoneOffset(); // in minutes
  const solarNoonMin = 720 - 4 * lng - eqtime + timeOffset;

  // Hour angle calculation for arbitrary solar altitude angle alpha
  const calcHourAngle = (alpha: number): number | null => {
    const cosHA =
      (Math.sin(alpha * rad) - Math.sin(lat * rad) * Math.sin(decl * rad)) /
      (Math.cos(lat * rad) * Math.cos(decl * rad));
    if (cosHA < -1 || cosHA > 1) return null;
    return Math.acos(cosHA) * deg;
  };

  // Sunrise & Sunset (alpha = -0.833° for atmospheric refraction)
  const sunriseHA = calcHourAngle(-0.8333) ?? 90;
  const sunriseMin = solarNoonMin - sunriseHA * 4;
  const sunsetMin = solarNoonMin + sunriseHA * 4;

  // Fajr (alpha = -18°)
  const fajrHA = calcHourAngle(-18) ?? 108;
  const fajrMin = solarNoonMin - fajrHA * 4;

  // Isha (alpha = -17.5°)
  const ishaHA = calcHourAngle(-17.5) ?? 106;
  const ishaMin = solarNoonMin + ishaHA * 4;

  // Asr: shadow factor standard=1, hanafi=2
  const shadowFactor = school === 'hanafi' ? 2 : 1;
  const asrAltitude = deg * Math.atan(1 / (shadowFactor + Math.tan(Math.abs(lat - decl) * rad)));
  const asrHA = calcHourAngle(asrAltitude) ?? 45;
  const asrMin = solarNoonMin + asrHA * 4;

  // Dhuhr (solar noon + slight buffer e.g. 2 min)
  const dhuhrMin = solarNoonMin + 2;

  // Duha (approx 15 min after sunrise)
  const duhaMin = sunriseMin + 15;

  // Night calculations: Maghrib to next day's Fajr
  const nightDuration = (fajrMin + 1440 - sunsetMin) % 1440;
  const midnightMin = (sunsetMin + nightDuration / 2) % 1440;
  const lastThirdMin = (sunsetMin + (2 / 3) * nightDuration) % 1440;

  return {
    fajr: minutesToTime(fajrMin),
    sunrise: minutesToTime(sunriseMin),
    dhuhr: minutesToTime(dhuhrMin),
    asr: minutesToTime(asrMin),
    maghrib: minutesToTime(sunsetMin),
    isha: minutesToTime(ishaMin),
    imsak: minutesToTime(fajrMin - 10),
    midnight: minutesToTime(midnightMin),
    lastThird: minutesToTime(lastThirdMin),
    duha: minutesToTime(duhaMin),
  };
}

export function computeNextPrayer(
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  },
  now: Date
): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayers = [
    { name: 'Fajr', ar: 'الفجر', min: timeToMinutes(times.fajr), raw: times.fajr },
    { name: 'Sunrise', ar: 'الشروق', min: timeToMinutes(times.sunrise), raw: times.sunrise },
    { name: 'Dhuhr', ar: 'الظهر', min: timeToMinutes(times.dhuhr), raw: times.dhuhr },
    { name: 'Asr', ar: 'العصر', min: timeToMinutes(times.asr), raw: times.asr },
    { name: 'Maghrib', ar: 'المغرب', min: timeToMinutes(times.maghrib), raw: times.maghrib },
    { name: 'Isha', ar: 'العشاء', min: timeToMinutes(times.isha), raw: times.isha },
  ];

  let nextIdx = prayers.findIndex((p) => p.min > currentMinutes);
  let nextPrayer = prayers[nextIdx];
  let prevPrayer = nextIdx > 0 ? prayers[nextIdx - 1] : prayers[prayers.length - 1];

  let diffMinutes = 0;
  if (!nextPrayer) {
    // Past Isha -> Next is tomorrow's Fajr
    nextPrayer = prayers[0];
    prevPrayer = prayers[prayers.length - 1];
    diffMinutes = 1440 - currentMinutes + nextPrayer.min;
  } else {
    diffMinutes = nextPrayer.min - currentMinutes;
  }

  const secondsRemaining = Math.max(0, Math.floor(diffMinutes * 60));
  const hrs = Math.floor(secondsRemaining / 3600);
  const mins = Math.floor((secondsRemaining % 3600) / 60);
  const secs = secondsRemaining % 60;
  const timeRemainingFormatted = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Progress percentage of current prayer window
  let windowDuration = 0;
  let elapsed = 0;
  if (currentMinutes < prayers[0].min) {
    windowDuration = (1440 - prayers[prayers.length - 1].min) + prayers[0].min;
    elapsed = (1440 - prayers[prayers.length - 1].min) + currentMinutes;
  } else if (nextIdx === -1) {
    windowDuration = (1440 - prayers[prayers.length - 1].min) + prayers[0].min;
    elapsed = currentMinutes - prayers[prayers.length - 1].min;
  } else {
    windowDuration = nextPrayer.min - prevPrayer.min;
    elapsed = currentMinutes - prevPrayer.min;
  }

  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / Math.max(1, windowDuration)) * 100)));

  return {
    name: nextPrayer.name,
    arabicName: nextPrayer.ar,
    timeString: nextPrayer.raw,
    secondsRemaining,
    timeRemainingFormatted,
    progressPercent,
  };
}

export async function fetchPrayerSchedule(
  latitude: number,
  longitude: number,
  methodId = 3,
  school: 'standard' | 'hanafi' = 'standard',
  timeFormat: '12h' | '24h' = '12h'
): Promise<PrayerSchedule> {
  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000);
  const schoolParam = school === 'hanafi' ? 1 : 0;
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${methodId}&school=${schoolParam}`;

  let rawTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    imsak: string;
    midnight: string;
    lastThird: string;
    duha: string;
  } | null = null;

  let hijri: HijriDateInfo = {
    day: '14',
    monthEn: 'Shawwal',
    monthAr: 'شوّال',
    year: '1447',
    designation: 'AH',
    formatted: '14 Shawwal 1447 AH',
  };

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const t = data.data.timings;
      const h = data.data.date?.hijri;

      if (h) {
        hijri = {
          day: h.day,
          monthEn: h.month?.en || 'Shawwal',
          monthAr: h.month?.ar || '',
          year: h.year || '1447',
          designation: h.designation?.abbreviated || 'AH',
          formatted: `${h.day} ${h.month?.en} ${h.year} AH`,
        };
      }

      const maghribMin = timeToMinutes(t.Maghrib);
      const fajrMin = timeToMinutes(t.Fajr);
      const nightDuration = (fajrMin + 1440 - maghribMin) % 1440;
      const calculatedLastThird = minutesToTime((maghribMin + (2 / 3) * nightDuration) % 1440);
      const sunriseMin = timeToMinutes(t.Sunrise);
      const calculatedDuha = minutesToTime((sunriseMin + 15) % 1440);

      rawTimes = {
        fajr: t.Fajr.split(' ')[0],
        sunrise: t.Sunrise.split(' ')[0],
        dhuhr: t.Dhuhr.split(' ')[0],
        asr: t.Asr.split(' ')[0],
        maghrib: t.Maghrib.split(' ')[0],
        isha: t.Isha.split(' ')[0],
        imsak: t.Imsak ? t.Imsak.split(' ')[0] : minutesToTime(fajrMin - 10),
        midnight: t.Midnight ? t.Midnight.split(' ')[0] : minutesToTime((maghribMin + nightDuration / 2) % 1440),
        lastThird: calculatedLastThird,
        duha: calculatedDuha,
      };
    }
  } catch {
    // Silently proceed to astronomical fallback
  }

  // Fallback if AlAdhan failed or was unreachable
  if (!rawTimes) {
    rawTimes = calculateAstronomicalTimes(now, latitude, longitude, school);
  }

  const nextPrayer = computeNextPrayer(
    {
      fajr: rawTimes.fajr,
      sunrise: rawTimes.sunrise,
      dhuhr: rawTimes.dhuhr,
      asr: rawTimes.asr,
      maghrib: rawTimes.maghrib,
      isha: rawTimes.isha,
    },
    now
  );

  const items: PrayerTimeItem[] = [
    {
      name: 'Fajr',
      arabicName: 'الفجر',
      rawTime: rawTimes.fajr,
      time: formatPrayerTime(rawTimes.fajr, timeFormat),
      isNext: nextPrayer.name === 'Fajr',
    },
    {
      name: 'Sunrise',
      arabicName: 'الشروق',
      rawTime: rawTimes.sunrise,
      time: formatPrayerTime(rawTimes.sunrise, timeFormat),
      isNext: nextPrayer.name === 'Sunrise',
    },
    {
      name: 'Dhuhr',
      arabicName: 'الظهر',
      rawTime: rawTimes.dhuhr,
      time: formatPrayerTime(rawTimes.dhuhr, timeFormat),
      isNext: nextPrayer.name === 'Dhuhr',
    },
    {
      name: 'Asr',
      arabicName: 'العصر',
      rawTime: rawTimes.asr,
      time: formatPrayerTime(rawTimes.asr, timeFormat),
      isNext: nextPrayer.name === 'Asr',
    },
    {
      name: 'Maghrib',
      arabicName: 'المغرب',
      rawTime: rawTimes.maghrib,
      time: formatPrayerTime(rawTimes.maghrib, timeFormat),
      isNext: nextPrayer.name === 'Maghrib',
    },
    {
      name: 'Isha',
      arabicName: 'العشاء',
      rawTime: rawTimes.isha,
      time: formatPrayerTime(rawTimes.isha, timeFormat),
      isNext: nextPrayer.name === 'Isha',
    },
  ];

  const methodObj = PRAYER_METHODS.find((m) => m.id === methodId) || PRAYER_METHODS[0];

  return {
    fajr: formatPrayerTime(rawTimes.fajr, timeFormat),
    sunrise: formatPrayerTime(rawTimes.sunrise, timeFormat),
    dhuhr: formatPrayerTime(rawTimes.dhuhr, timeFormat),
    asr: formatPrayerTime(rawTimes.asr, timeFormat),
    maghrib: formatPrayerTime(rawTimes.maghrib, timeFormat),
    isha: formatPrayerTime(rawTimes.isha, timeFormat),
    imsak: formatPrayerTime(rawTimes.imsak, timeFormat),
    midnight: formatPrayerTime(rawTimes.midnight, timeFormat),
    lastThird: formatPrayerTime(rawTimes.lastThird, timeFormat),
    duha: formatPrayerTime(rawTimes.duha, timeFormat),
    items,
    nextPrayer,
    hijri,
    methodName: methodObj.name,
    schoolName: school === 'hanafi' ? 'Hanafi' : 'Standard (Shafi, Maliki, Hanbali)',
  };
}

// Fetch 30-day calendar for Monthly Timetable view
export async function fetchMonthlyCalendar(
  latitude: number,
  longitude: number,
  year: number,
  month: number,
  methodId = 3,
  school: 'standard' | 'hanafi' = 'standard'
) {
  const schoolParam = school === 'hanafi' ? 1 : 0;
  const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${methodId}&school=${schoolParam}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch {
    // Fallback if needed
  }
  return null;
}

// Web Audio API serene chime tone generator for Adhan notifications
export function playSereneChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell sequence: F4, A4, C5, F5
    const freqs = [349.23, 440.0, 523.25, 698.46];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.22);

      gain.gain.setValueAtTime(0, now + idx * 0.22);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.22 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.22);
      osc.stop(now + idx * 0.22 + 1.8);
    });
  } catch {
    // Audio context may require user gesture on some browsers
  }
}
