export type MovementMode = 'walking' | 'bike' | 'bus' | 'vehicle';

export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

export interface RouteSegment {
  id: string;
  mode: MovementMode;
  points: Coordinate[];
  startTime: number;
  endTime?: number;
  distance: number; // in meters
  steps: number;
  calories: number;
}

export interface Route {
  id: string;
  segments: RouteSegment[];
  startTime: number;
  endTime?: number;
  totalDistance: number; // Aggregate
  totalSteps: number;    // Aggregate
  totalCalories: number; // Aggregate
}

export interface CustomMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'general' | 'shop' | 'park' | 'home' | 'work';
  createdAt: number;
}

export interface AppState {
  isTracking: boolean;
  currentRoute: Route | null;
  savedRoutes: Route[];
  markers: CustomMarker[];
  userLocation: Coordinate | null;
  totalDistance: number;
  totalSteps: number;
}

export enum MapMode {
  VIEW = 'VIEW',
  ADD_MARKER = 'ADD_MARKER'
}