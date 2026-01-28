import { Route, CustomMarker } from '../types';
import { STORAGE_KEYS } from '../constants';

export const saveRoutes = (routes: Route[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
  } catch (e) {
    console.error('Failed to save routes', e);
  }
};

export const getRoutes = (): Route[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROUTES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load routes', e);
    return [];
  }
};

export const clearRoutes = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ROUTES);
  } catch (e) {
    console.error('Failed to clear routes', e);
  }
};

export const saveMarkers = (markers: CustomMarker[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MARKERS, JSON.stringify(markers));
  } catch (e) {
    console.error('Failed to save markers', e);
  }
};

export const getMarkers = (): CustomMarker[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MARKERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load markers', e);
    return [];
  }
};