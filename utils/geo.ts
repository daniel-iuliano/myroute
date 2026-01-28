import { Coordinate, RouteSegment } from '../types';
import { METERS_PER_STEP, METRICS_CONFIG } from '../constants';

// Haversine formula to calculate distance between two points in meters
export const calculateDistance = (point1: Coordinate, point2: Coordinate): number => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (point1.lat * Math.PI) / 180;
  const lat2 = (point2.lat * Math.PI) / 180;
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateSegmentMetrics = (distance: number, mode: RouteSegment['mode']) => {
  const config = METRICS_CONFIG[mode];
  
  let steps = 0;
  let calories = 0;

  if (config.trackSteps) {
    steps = Math.floor(distance / METERS_PER_STEP);
  }

  if (config.trackCalories) {
    calories = (distance / 1000) * config.caloriesPerKm;
  }

  return { steps, calories };
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};