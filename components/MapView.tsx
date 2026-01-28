import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Coordinate, Route, CustomMarker, MovementMode, Language } from '../types';
import { MARKER_TYPES, TRANSLATIONS } from '../constants';

// --- Helpers ---

// Validate coordinate
const isValidCoord = (lat: any, lng: any): boolean => {
  return typeof lat === 'number' && !isNaN(lat) && isFinite(lat) &&
         typeof lng === 'number' && !isNaN(lng) && isFinite(lng);
};

// --- Icons ---
const createUserIcon = () => L.divIcon({
  className: 'custom-user-icon',
  html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg pulse-ring"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// SVG Paths for Clean Monochromatic Icons
const ICONS = {
  general: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  park: '<path d="M12 22v-5"/><path d="M10 3.8 6.56 9.47a1 1 0 0 0 .83 1.53h1.8v5h-2.8a1 1 0 0 0-.83 1.53L12 22l6.44-4.47a1 1 0 0 0-.83 1.53h-2.8v-5h1.8a1 1 0 0 0 .83-1.53L13.99 3.8a1 1 0 0 0-1.99 0Z"/>', 
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  work: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'
};

const createCustomMarkerIcon = (type: CustomMarker['type']) => {
  const svgContent = ICONS[type] || ICONS.general;
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="relative group cursor-pointer">
        <div class="w-10 h-10 bg-white rounded-full shadow-lg border border-zinc-200 flex items-center justify-center transform transition-transform group-hover:scale-110 text-zinc-800">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             ${svgContent}
           </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-zinc-200"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48]
  });
};

// Get path color/style based on mode
const getPathOptions = (mode: MovementMode, isCurrent: boolean) => {
  const baseColor = isCurrent ? '#2563eb' : '#18181b'; // Blue vs Zinc
  const opacity = isCurrent ? 1 : 0.2;
  
  if (mode === 'walking') {
    return { color: baseColor, weight: isCurrent ? 5 : 4, opacity, dashArray: undefined };
  } else if (mode === 'bike') {
    return { color: baseColor, weight: isCurrent ? 5 : 4, opacity, dashArray: '5, 10' };
  } else {
    // Bus / Vehicle
    return { color: baseColor, weight: isCurrent ? 5 : 4, opacity, dashArray: '1, 5' };
  }
};

// --- Components ---

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size after a short delay to ensure container is rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const MapEvents = ({ 
  isAddMarkerMode, 
  onMapClick 
}: { 
  isAddMarkerMode: boolean; 
  onMapClick: (lat: number, lng: number) => void 
}) => {
  useMapEvents({
    click(e) {
      if (isAddMarkerMode && isValidCoord(e.latlng.lat, e.latlng.lng)) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const UserTracker = ({ location, isTracking }: { location: Coordinate | null, isTracking: boolean }) => {
  const map = useMap();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (location && isValidCoord(location.lat, location.lng)) {
      if (firstLoad.current || isTracking) {
         if (firstLoad.current) {
             map.setView([location.lat, location.lng], 16);
             firstLoad.current = false;
         } else {
             map.flyTo([location.lat, location.lng], map.getZoom(), {
                animate: true,
                duration: 0.5 
             });
         }
      }
    }
  }, [location, isTracking, map]);

  return null;
};

interface MapViewProps {
  userLocation: Coordinate | null;
  currentRoute: Route | null;
  activeSegment: { points: Coordinate[], mode: MovementMode } | null;
  savedRoutes: Route[];
  markers: CustomMarker[];
  isTracking: boolean;
  isAddMarkerMode: boolean;
  showMarkers: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onEditMarker: (marker: CustomMarker) => void;
  onDeleteMarker: (id: string) => void;
  centerTrigger: number;
  language: Language;
}

export const MapView: React.FC<MapViewProps> = ({
  userLocation,
  currentRoute,
  activeSegment,
  savedRoutes,
  markers,
  isTracking,
  isAddMarkerMode,
  showMarkers,
  onMapClick,
  onEditMarker,
  onDeleteMarker,
  centerTrigger,
  language
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (mapRef.current && userLocation && isValidCoord(userLocation.lat, userLocation.lng)) {
       mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16);
    }
  }, [centerTrigger]);

  const defaultCenter: L.LatLngExpression = [51.505, -0.09];

  const getValidPoints = (points: Coordinate[] | undefined) => {
    if (!points || !Array.isArray(points)) return [];
    return points
        .filter(p => p && isValidCoord(p.lat, p.lng))
        .map(p => [p.lat, p.lng] as [number, number]);
  };

  return (
    <div className="w-full h-full absolute inset-0 bg-zinc-100 z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full outline-none"
        zoomControl={false}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="grayscale-tiles"
        />

        <MapEvents isAddMarkerMode={isAddMarkerMode} onMapClick={onMapClick} />
        <UserTracker location={userLocation} isTracking={isTracking} />

        {/* Saved Routes */}
        {savedRoutes.map((route) => (
          <React.Fragment key={route.id}>
            {route.segments && route.segments.map((segment) => {
               const validPoints = getValidPoints(segment.points);
               if (validPoints.length < 2) return null;
               return (
                 <Polyline
                   key={segment.id}
                   positions={validPoints}
                   pathOptions={getPathOptions(segment.mode, false)}
                 />
               );
            })}
          </React.Fragment>
        ))}

        {/* Current Completed Segments */}
        {currentRoute && currentRoute.segments && currentRoute.segments.map((segment) => {
           const validPoints = getValidPoints(segment.points);
           if (validPoints.length < 2) return null;
           return (
             <Polyline
               key={segment.id}
               positions={validPoints}
               pathOptions={getPathOptions(segment.mode, true)}
             />
           );
        })}
        
        {/* Active Segment */}
        {activeSegment && (
          (() => {
            let validPoints = getValidPoints(activeSegment.points);
            
            if (isTracking && userLocation && isValidCoord(userLocation.lat, userLocation.lng)) {
               const lastPoint = validPoints[validPoints.length - 1];
               const currentLat = userLocation.lat;
               const currentLng = userLocation.lng;
               
               if (!lastPoint || (Math.abs(lastPoint[0] - currentLat) > 0.000001 || Math.abs(lastPoint[1] - currentLng) > 0.000001)) {
                   validPoints.push([currentLat, currentLng]);
               }
            }

            if (validPoints.length < 2) return null;

            return (
              <Polyline
                positions={validPoints}
                pathOptions={getPathOptions(activeSegment.mode, true)}
              />
            );
          })()
        )}

        {/* User Location Accuracy Circle */}
        {userLocation && isValidCoord(userLocation.lat, userLocation.lng) && userLocation.accuracy && (
          <Circle 
            center={[userLocation.lat, userLocation.lng]}
            radius={userLocation.accuracy}
            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.1, weight: 1, opacity: 0.3 }}
          />
        )}

        {/* User Location Marker */}
        {userLocation && isValidCoord(userLocation.lat, userLocation.lng) && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()} />
        )}

        {/* Custom Markers */}
        {showMarkers && markers.map((marker) => {
          if (!marker || !isValidCoord(marker.lat, marker.lng)) return null;
          return (
            <Marker 
              key={marker.id} 
              position={[marker.lat, marker.lng]} 
              icon={createCustomMarkerIcon(marker.type)}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="p-1 min-w-[140px]">
                  <h3 className="font-bold text-zinc-900 text-sm">{marker.label}</h3>
                  <p className="text-xs text-zinc-500 capitalize mb-3">{t.marker_types[marker.type]}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => {
                            mapRef.current?.closePopup();
                            onEditMarker(marker);
                        }}
                        className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold py-1.5 px-2 rounded-md transition-colors text-center"
                    >
                        {t.edit_location}
                    </button>
                    <button 
                        onClick={() => onDeleteMarker(marker.id)}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1.5 px-2 rounded-md transition-colors text-center"
                    >
                        {t.delete_location}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
      
      <style>{`
        .pulse-ring::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: rgba(37, 99, 235, 0.4);
          border-radius: 50%;
          animation: pulse-blue 2s infinite;
        }
        @keyframes pulse-blue {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          70% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        .leaflet-control-container .leaflet-routing-container-hide {
            display: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .custom-popup .leaflet-popup-content {
            margin: 12px;
        }
      `}</style>
    </div>
  );
};