import { QiblaData } from '../types';

export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export function calculateQibla(latitude: number, longitude: number): QiblaData {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const lat1 = latitude * rad;
  const lon1 = longitude * rad;
  const lat2 = KAABA_COORDS.latitude * rad;
  const lon2 = KAABA_COORDS.longitude * rad;

  const dLon = lon2 - lon1;

  // Great Circle Bearing to Kaaba
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = Math.atan2(y, x) * deg;
  bearing = (bearing + 360) % 360;

  // Haversine Distance to Kaaba
  const R = 6371; // Earth radius in km
  const dLat = lat2 - lat1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);
  const distanceMiles = Math.round(distanceKm * 0.621371);

  // Approximate Sun Azimuth for Sun Compass calibration
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  // Sun moves ~15 deg/hr from approx 90° (east) at 6am to 180° (south in northern hemisphere) at 12pm, 270° (west) at 6pm
  const solarTime = hours + longitude / 15 - now.getTimezoneOffset() / 60;
  let sunAzimuthDeg = (solarTime - 12) * 15 + 180;
  sunAzimuthDeg = (sunAzimuthDeg + 360) % 360;

  return {
    bearingDeg: Math.round(bearing * 10) / 10,
    distanceKm,
    distanceMiles,
    sunAzimuthDeg: Math.round(sunAzimuthDeg),
  };
}

export function getCardinalDirection(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
