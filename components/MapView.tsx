import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Coordinate, Route, CustomMarker, MovementMode } from '../types';
import { MARKER_TYPES } from '../constants';

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

const createCustomMarkerIcon = (type: CustomMarker['type']) => {
  const markerDef = MARKER_TYPES.find(m => m.value === type) || MARKER_TYPES[0];
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="relative group">
        <div class="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-zinc-100 flex items-center justify-center transform transition-transform group-hover:scale-110 text-xl">
          ${markerDef.icon}
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r-2 border-b-2 border-zinc-100"></div>
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
         // Use setView for first load to be instant/safe, flyTo for updates
         // Duration lowered to 0.5s for "hyper precise" feel
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
  onMapClick: (lat: number, lng: number) => void;
  onDeleteMarker: (id: string) => void;
  centerTrigger: number;
}

export const MapView: React.FC<MapViewProps> = ({
  userLocation,
  currentRoute,
  activeSegment,
  savedRoutes,
  markers,
  isTracking,
  isAddMarkerMode,
  onMapClick,
  onDeleteMarker,
  centerTrigger
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Manual center logic for button press
  useEffect(() => {
    if (mapRef.current && userLocation && isValidCoord(userLocation.lat, userLocation.lng)) {
       mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16);
    }
  }, [centerTrigger]);

  const defaultCenter: L.LatLngExpression = [51.505, -0.09];

  // Helper to filter points safely
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
            const validPoints = getValidPoints(activeSegment.points);
            // Leaflet handles 1 point fine (just doesn't draw line).
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
        {markers.map((marker) => {
          if (!marker || !isValidCoord(marker.lat, marker.lng)) return null;
          return (
            <Marker 
              key={marker.id} 
              position={[marker.lat, marker.lng]} 
              icon={createCustomMarkerIcon(marker.type)}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="p-1 min-w-[120px]">
                  <h3 className="font-bold text-zinc-900">{marker.label}</h3>
                  <p className="text-xs text-zinc-500 capitalize">{marker.type}</p>
                  <button 
                    onClick={() => onDeleteMarker(marker.id)}
                    className="mt-2 text-xs text-red-500 font-medium hover:text-red-700 w-full text-left"
                  >
                    Delete Location
                  </button>
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
      `}</style>
    </div>
  );
};