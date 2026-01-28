export const STORAGE_KEYS = {
  ROUTES: 'monotrack_routes_v2',
  MARKERS: 'monotrack_markers',
};

// Estimation: 1 step approx 0.762 meters (average)
export const METERS_PER_STEP = 0.762;

export const MOVEMENT_MODES = [
  { value: 'walking', icon: '🚶' },
  { value: 'bike', icon: '🚴' },
  { value: 'bus', icon: '🚌' },
  { value: 'vehicle', icon: '🚗' },
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
  { value: 'general', icon: '📍' },
  { value: 'shop', icon: '🛍️' },
  { value: 'park', icon: '🌳' },
  { value: 'home', icon: '🏠' },
  { value: 'work', icon: '💼' },
] as const;

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0,
};

export const TRANSLATIONS = {
  en: {
    distance: "Distance",
    steps: "Steps",
    calories: "Calories",
    km: "km",
    m: "m",
    kcal: "kcal",
    burned: "kcal burned",
    taken_previously: "steps taken previously",
    tap_map: "Tap map to place marker",
    locating: "Locating Signal",
    new_marker: "New Marker",
    label: "Label",
    label_placeholder: "e.g. Favorite Coffee",
    type: "Type",
    save_location: "Save Location",
    delete_location: "Delete Location",
    center_map: "Center Map",
    tracking_start: "Start",
    tracking_stop: "Pause",
    add_marker: "Add Marker",
    time: "Time",
    duration: "Duration",
    stats: "Analytics",
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
    total_routes: "Total Routes",
    history: "History",
    no_data: "No activity recorded yet",
    session_paused: "Session Paused",
    resume: "Resume",
    finish: "Finish",
    current_session: "Current Session",
    modes: {
      walking: "Walking",
      bike: "Bike",
      bus: "Bus",
      vehicle: "Vehicle"
    },
    marker_types: {
      general: "General",
      shop: "Shop",
      park: "Park",
      home: "Home",
      work: "Work"
    }
  },
  es: {
    distance: "Distancia",
    steps: "Pasos",
    calories: "Calorías",
    km: "km",
    m: "m",
    kcal: "kcal",
    burned: "kcal quemadas",
    taken_previously: "pasos previos",
    tap_map: "Toca el mapa para colocar marcador",
    locating: "Buscando Señal",
    new_marker: "Nuevo Marcador",
    label: "Etiqueta",
    label_placeholder: "ej. Café Favorito",
    type: "Tipo",
    save_location: "Guardar Ubicación",
    delete_location: "Eliminar Ubicación",
    center_map: "Centrar Mapa",
    tracking_start: "Iniciar",
    tracking_stop: "Pausar",
    add_marker: "Añadir Marcador",
    time: "Tiempo",
    duration: "Duración",
    stats: "Estadísticas",
    daily: "Hoy",
    weekly: "Esta Semana",
    monthly: "Este Mes",
    total_routes: "Rutas Totales",
    history: "Historial",
    no_data: "Sin actividad registrada",
    session_paused: "Sesión Pausada",
    resume: "Reanudar",
    finish: "Terminar",
    current_session: "Sesión Actual",
    modes: {
      walking: "Caminando",
      bike: "Bicicleta",
      bus: "Autobús",
      vehicle: "Vehículo"
    },
    marker_types: {
      general: "General",
      shop: "Tienda",
      park: "Parque",
      home: "Casa",
      work: "Trabajo"
    }
  },
  ar: {
    distance: "Distancia",
    steps: "Pasos",
    calories: "Calorías",
    km: "km",
    m: "m",
    kcal: "kcal",
    burned: "kcal quemadas",
    taken_previously: "pasos hechos",
    tap_map: "Tocá el mapa para poner el coso",
    locating: "Buscando Señal",
    new_marker: "Nuevo Lugar",
    label: "Nombre",
    label_placeholder: "ej. El café de siempre",
    type: "Tipo",
    save_location: "Guardar",
    delete_location: "Borrar",
    center_map: "Centrar",
    tracking_start: "Arrancar",
    tracking_stop: "Frenar",
    add_marker: "Agregar Lugar",
    time: "Tiempo",
    duration: "Tiempo",
    stats: "Estadísticas",
    daily: "Hoy",
    weekly: "Esta Semana",
    monthly: "Este Mes",
    total_routes: "Viajes Totales",
    history: "Historial",
    no_data: "Todavía no hiciste nada",
    session_paused: "Frenamos un toque",
    resume: "Seguir",
    finish: "Listo",
    current_session: "Ahora",
    modes: {
      walking: "A pata",
      bike: "Bici",
      bus: "Bondi",
      vehicle: "Auto"
    },
    marker_types: {
      general: "General",
      shop: "Negocio",
      park: "Plaza",
      home: "Rancho",
      work: "Laburo"
    }
  }
};