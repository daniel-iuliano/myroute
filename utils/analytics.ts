import { Route } from '../types';

export interface AggregatedStats {
  distance: number;
  calories: number;
  duration: number; // in milliseconds
  count: number;
}

export interface AnalyticsData {
  daily: AggregatedStats;
  weekly: AggregatedStats;
  monthly: AggregatedStats;
}

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const isSameWeek = (d1: Date, d2: Date) => {
  // Get start of week (Sunday) for both
  const startOfWeek1 = new Date(d1);
  startOfWeek1.setDate(d1.getDate() - d1.getDay());
  startOfWeek1.setHours(0, 0, 0, 0);

  const startOfWeek2 = new Date(d2);
  startOfWeek2.setDate(d2.getDate() - d2.getDay());
  startOfWeek2.setHours(0, 0, 0, 0);

  return startOfWeek1.getTime() === startOfWeek2.getTime();
};

const isSameMonth = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
};

export const calculateAnalytics = (routes: Route[]): AnalyticsData => {
  const now = new Date();
  
  const initialStats: AggregatedStats = { distance: 0, calories: 0, duration: 0, count: 0 };
  
  // Helper to deep copy initial stats to avoid reference issues
  const createStat = () => ({ ...initialStats });

  const stats: AnalyticsData = {
    daily: createStat(),
    weekly: createStat(),
    monthly: createStat(),
  };

  routes.forEach(route => {
    const routeDate = new Date(route.startTime);
    // Calculate duration. If endTime is missing (shouldn't happen for saved routes), default to 0 duration or ignore
    const duration = (route.endTime && route.endTime > route.startTime) 
      ? route.endTime - route.startTime 
      : 0;

    // Daily
    if (isSameDay(now, routeDate)) {
      stats.daily.distance += route.totalDistance;
      stats.daily.calories += route.totalCalories;
      stats.daily.duration += duration;
      stats.daily.count += 1;
    }

    // Weekly
    if (isSameWeek(now, routeDate)) {
      stats.weekly.distance += route.totalDistance;
      stats.weekly.calories += route.totalCalories;
      stats.weekly.duration += duration;
      stats.weekly.count += 1;
    }

    // Monthly
    if (isSameMonth(now, routeDate)) {
      stats.monthly.distance += route.totalDistance;
      stats.monthly.calories += route.totalCalories;
      stats.monthly.duration += duration;
      stats.monthly.count += 1;
    }
  });

  return stats;
};

export const getTopRoutes = (routes: Route[]): Route[] => {
  // Sort by distance descending
  return [...routes].sort((a, b) => b.totalDistance - a.totalDistance).slice(0, 5);
};