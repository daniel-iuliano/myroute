export const STORAGE_KEYS = {
  ROUTES: 'monotrack_routes_v2',
  MARKERS: 'monotrack_markers',
};

// Estimation: 1 step approx 0.762 meters (average)
export const METERS_PER_STEP = 0.762;

export const MOVEMENT_MODES = [
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'bike', label: 'Bike', icon: '🚴' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
] as const;

export const METRICS_CONFIG = {
  walking: { 
    trackSteps: true, 
    trackCalories: true, 
    caloriesPerKm: 50 // Approx 50 kcal per km walking
  },
  bike: { 
    trackSteps: false, 
    trackCalories: true, 
    caloriesPerKm: 25 // Approx 25 kcal per km biking (variable, but using simple constant)
  },
  bus: { 
    trackSteps: false, 
    trackCalories: false, 
    caloriesPerKm: 0 
  },
  vehicle: { 
    trackSteps: false, 
    trackCalories: false, 
    caloriesPerKm: 0 
  },
};

export const MARKER_TYPES = [
  { value: 'general', label: 'General', icon: '📍' },
  { value: 'shop', label: 'Shop', icon: '🛍️' },
  { value: 'park', label: 'Park', icon: '🌳' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'work', label: 'Work', icon: '💼' },
] as const;

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};