import React, { useState, useEffect, useRef } from 'react';
import { MapView } from './components/MapView';
import { MapControls } from './components/MapControls';
import { MarkerModal } from './components/MarkerModal';
import { Route, Coordinate, CustomMarker, RouteSegment, MovementMode } from './types';
import { getRoutes, saveRoutes, getMarkers, saveMarkers } from './services/storage';
import { calculateDistance, calculateSegmentMetrics } from './utils/geo'; 

// Simple UUID generator for this environment
const generateId = () => Math.random().toString(36).substr(2, 9);

const isValidNumber = (num: any): boolean => typeof num === 'number' && !isNaN(num) && isFinite(num);

const App: React.FC = () => {
  // State
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // Route State
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [activeSegment, setActiveSegment] = useState<RouteSegment | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  
  // Settings State
  const [currentMode, setCurrentMode] = useState<MovementMode>('walking');

  // UI State
  const [isAddMarkerMode, setIsAddMarkerMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempMarkerPos, setTempMarkerPos] = useState<{lat: number, lng: number} | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(0);

  // Refs for cleanup
  const watchId = useRef<number | null>(null);
  const wakeLock = useRef<any>(null);

  // Load data on mount and sanitize it
  useEffect(() => {
    const rawRoutes = getRoutes();
    const rawMarkers = getMarkers();

    // Sanitize Routes
    const validRoutes = rawRoutes.map(route => ({
      ...route,
      segments: (route.segments || []).map(seg => ({
        ...seg,
        points: (seg.points || []).filter(p => p && isValidNumber(p.lat) && isValidNumber(p.lng))
      })).filter(seg => seg.points.length > 0)
    })).filter(route => route.segments.length > 0);

    // Sanitize Markers
    const validMarkers = rawMarkers.filter(m => m && isValidNumber(m.lat) && isValidNumber(m.lng));

    setSavedRoutes(validRoutes);
    setMarkers(validMarkers);

    // Save back sanitized data if different (optional, but good for cleanup)
    if (validRoutes.length !== rawRoutes.length) saveRoutes(validRoutes);
    if (validMarkers.length !== rawMarkers.length) saveMarkers(validMarkers);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          if (isValidNumber(lat) && isValidNumber(lng)) {
            setUserLocation({
              lat,
              lng,
              timestamp: pos.timestamp,
              accuracy
            });
          }
        },
        (err) => console.error("Error getting location", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Wake Lock Management
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock active');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock.current) {
      try {
        await wakeLock.current.release();
        wakeLock.current = null;
        console.log('Wake Lock released');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  };

  // Manage Wake Lock Lifecycle
  useEffect(() => {
    if (isTracking) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTracking && !wakeLock.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isTracking]);

  // Tracking Logic
  useEffect(() => {
    if (isTracking) {
      // Initialize Route if needed
      if (!currentRoute) {
        setCurrentRoute({
          id: generateId(),
          segments: [],
          startTime: Date.now(),
          totalDistance: 0,
          totalSteps: 0,
          totalCalories: 0
        });
      }
      
      // Initialize Segment if needed (or if mode changed)
      if (!activeSegment) {
        setActiveSegment({
          id: generateId(),
          mode: currentMode,
          points: [],
          startTime: Date.now(),
          distance: 0,
          steps: 0,
          calories: 0
        });
      }

      const opts = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          
          if (!isValidNumber(lat) || !isValidNumber(lng)) return;

          const newPoint: Coordinate = {
            lat,
            lng,
            timestamp: pos.timestamp,
            accuracy
          };

          setUserLocation(newPoint);

          setActiveSegment(prevSeg => {
            if (!prevSeg) return null;
            
            // Only add points to the route if accuracy is reasonable (< 30m)
            if (accuracy > 30) {
                return prevSeg;
            }

            const lastPoint = prevSeg.points[prevSeg.points.length - 1];
            let distToAdd = 0;
            if (lastPoint && isValidNumber(lastPoint.lat) && isValidNumber(lastPoint.lng)) {
              distToAdd = calculateDistance(lastPoint, newPoint);
            }

            // Filter GPS noise
            if (prevSeg.points.length > 0 && distToAdd < 1) {
              return prevSeg;
            }
            
            if (!isValidNumber(distToAdd)) distToAdd = 0;

            const updatedPoints = [...prevSeg.points, newPoint];
            const newDist = prevSeg.distance + distToAdd;
            const metrics = calculateSegmentMetrics(newDist, prevSeg.mode);

            return {
              ...prevSeg,
              points: updatedPoints,
              distance: newDist,
              steps: metrics.steps,
              calories: metrics.calories
            };
          });
        },
        (err) => console.error("Tracking Error:", err),
        opts
      );
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking]); // Logic loop managed by conditional checks inside

  // Handle Mode Switching
  const handleModeChange = (newMode: MovementMode) => {
    if (newMode === currentMode) return;
    
    setCurrentMode(newMode);

    if (isTracking && activeSegment && currentRoute) {
      // Finalize current segment
      const completedSegment: RouteSegment = {
        ...activeSegment,
        endTime: Date.now()
      };

      // Push to route segments
      setCurrentRoute(prev => {
        if (!prev) return null;
        return {
          ...prev,
          segments: [...prev.segments, completedSegment],
          totalDistance: prev.totalDistance + completedSegment.distance,
          totalSteps: prev.totalSteps + completedSegment.steps,
          totalCalories: prev.totalCalories + completedSegment.calories
        };
      });

      // Start new segment
      setActiveSegment({
        id: generateId(),
        mode: newMode,
        points: [], // Start fresh points 
        startTime: Date.now(),
        distance: 0,
        steps: 0,
        calories: 0
      });
    }
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
      setIsTracking(true);
    }
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    
    if (currentRoute) {
      // Consolidate final segment
      let finalRoute = { ...currentRoute };
      
      if (activeSegment && activeSegment.points.length > 0) {
        const completedSegment = { ...activeSegment, endTime: Date.now() };
        finalRoute.segments = [...finalRoute.segments, completedSegment];
        finalRoute.totalDistance += completedSegment.distance;
        finalRoute.totalSteps += completedSegment.steps;
        finalRoute.totalCalories += completedSegment.calories;
      }

      finalRoute.endTime = Date.now();

      // Only save if there is data
      if (finalRoute.totalDistance > 0) {
        const newSavedRoutes = [...savedRoutes, finalRoute];
        setSavedRoutes(newSavedRoutes);
        saveRoutes(newSavedRoutes);
      }
    }

    // Reset
    setCurrentRoute(null);
    setActiveSegment(null);
  };

  // Marker Logic
  const handleMapClick = (lat: number, lng: number) => {
    if (!isValidNumber(lat) || !isValidNumber(lng)) return;
    setTempMarkerPos({ lat, lng });
    setModalOpen(true);
    setIsAddMarkerMode(false);
  };

  const handleSaveMarker = (label: string, type: CustomMarker['type']) => {
    if (tempMarkerPos && isValidNumber(tempMarkerPos.lat) && isValidNumber(tempMarkerPos.lng)) {
      const newMarker: CustomMarker = {
        id: generateId(),
        lat: tempMarkerPos.lat,
        lng: tempMarkerPos.lng,
        label,
        type,
        createdAt: Date.now()
      };
      const newMarkers = [...markers, newMarker];
      setMarkers(newMarkers);
      saveMarkers(newMarkers);
      setModalOpen(false);
      setTempMarkerPos(null);
    }
  };

  const handleDeleteMarker = (id: string) => {
    const newMarkers = markers.filter(m => m.id !== id);
    setMarkers(newMarkers);
    saveMarkers(newMarkers);
  };

  const handleCenterMap = () => {
    if (userLocation && isValidNumber(userLocation.lat) && isValidNumber(userLocation.lng)) {
        setCenterTrigger(prev => prev + 1);
    } else {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;
            if (isValidNumber(lat) && isValidNumber(lng)) {
                setUserLocation({
                    lat,
                    lng,
                    timestamp: pos.timestamp,
                    accuracy
                });
                setCenterTrigger(prev => prev + 1);
            }
        }, (err) => {}, { enableHighAccuracy: true });
    }
  };

  // Calculate live totals for display
  const liveDistance = (currentRoute?.totalDistance || 0) + (activeSegment?.distance || 0);
  const liveSteps = (currentRoute?.totalSteps || 0) + (activeSegment?.steps || 0);
  const liveCalories = (currentRoute?.totalCalories || 0) + (activeSegment?.calories || 0);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-zinc-50 font-sans">
      <MapView
        userLocation={userLocation}
        currentRoute={currentRoute}
        activeSegment={activeSegment}
        savedRoutes={savedRoutes}
        markers={markers}
        isTracking={isTracking}
        isAddMarkerMode={isAddMarkerMode}
        onMapClick={handleMapClick}
        onDeleteMarker={handleDeleteMarker}
        centerTrigger={centerTrigger}
      />
      
      {/* HUD & Controls */}
      <MapControls
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        onStopTracking={handleStopTracking}
        onAddMarkerMode={() => setIsAddMarkerMode(!isAddMarkerMode)}
        isAddMarkerMode={isAddMarkerMode}
        onCenterMap={handleCenterMap}
        currentDistance={liveDistance}
        currentSteps={liveSteps}
        currentCalories={liveCalories}
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />

      <MarkerModal
        isOpen={modalOpen}
        onClose={() => {
            setModalOpen(false);
            setTempMarkerPos(null);
        }}
        onSave={handleSaveMarker}
        tempMarker={tempMarkerPos}
      />

      {(!userLocation || !isValidNumber(userLocation.lat)) && (
         <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-[100] transition-opacity duration-1000 pointer-events-none">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-400 font-medium tracking-widest text-xs uppercase">Locating Signal</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;