import React, { useState, useEffect, useRef } from 'react';
import { MapView } from './components/MapView';
import { MapControls } from './components/MapControls';
import { MarkerModal } from './components/MarkerModal';
import { StatsModal } from './components/StatsModal';
import { PauseModal } from './components/PauseModal';
import { Route, Coordinate, CustomMarker, RouteSegment, MovementMode, Language } from './types';
import { getRoutes, saveRoutes, getMarkers, saveMarkers, clearRoutes } from './services/storage';
import { calculateDistance, calculateSegmentMetrics } from './utils/geo'; 
import { GEOLOCATION_OPTIONS, TRANSLATIONS } from './constants';
import { Globe } from 'lucide-react';

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
  const [language, setLanguage] = useState<Language>('en');

  // UI State
  const [isAddMarkerMode, setIsAddMarkerMode] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [tempMarkerPos, setTempMarkerPos] = useState<{lat: number, lng: number} | null>(null);
  // Track which marker is being edited
  const [editingMarker, setEditingMarker] = useState<CustomMarker | null>(null);
  
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs for cleanup and logic
  const watchId = useRef<number | null>(null);
  const wakeLock = useRef<any>(null);
  const lastLocationRef = useRef<Coordinate | null>(null);
  // Ref to track elapsed time accurately across pauses
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0); // Time accumulated from previous segments/pauses

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
            const newPoint = {
              lat,
              lng,
              timestamp: pos.timestamp,
              accuracy
            };
            setUserLocation(newPoint);
            lastLocationRef.current = newPoint;
          }
        },
        (err) => console.error("Error getting location", err),
        GEOLOCATION_OPTIONS
      );
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isTracking) {
      // If just started tracking, or resumed
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }
      
      interval = window.setInterval(() => {
        const now = Date.now();
        const currentSessionDuration = now - startTimeRef.current;
        setElapsedTime(accumulatedTimeRef.current + currentSessionDuration);
      }, 1000);
    } else {
      // Not tracking
      // If we have a current route (PAUSED), we keep the elapsed time displayed
      // If we don't have a route (STOPPED), elapsed time is 0 (reset in stop handler)
    }
    return () => window.clearInterval(interval);
  }, [isTracking]);

  // Wake Lock Management
  const requestWakeLock = async () => {
    // Only request if supported and document is visible
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      try {
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock active');
      } catch (err: any) {
        // Warn instead of error to avoid console noise for non-critical failures
        console.warn(`Wake Lock failed: ${err.name}, ${err.message}`);
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
        console.warn(`Wake Lock release failed: ${err.name}, ${err.message}`);
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

          // --- Accuracy Filtering ---
          const prev = lastLocationRef.current;
          if (prev && prev.accuracy && prev.accuracy < 50 && accuracy > 500) {
              console.warn("Ignoring low accuracy update", accuracy);
              return;
          }

          lastLocationRef.current = newPoint;
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
        GEOLOCATION_OPTIONS
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
  }, [isTracking]);

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
      // Pause
      setIsTracking(false);
      
      // Accumulate time logic
      const sessionDuration = Date.now() - startTimeRef.current;
      accumulatedTimeRef.current += sessionDuration;
      startTimeRef.current = 0; // Reset start time for next resume

    } else {
      // Resume
      startTimeRef.current = Date.now();
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
      // Ensure start time is accurate to the very first segment or now if empty
      if (finalRoute.startTime === 0) finalRoute.startTime = Date.now();

      // Only save if there is data
      if (finalRoute.totalDistance > 0) {
        const newSavedRoutes = [...savedRoutes, finalRoute];
        setSavedRoutes(newSavedRoutes);
        saveRoutes(newSavedRoutes);
      }
    }

    // Reset All
    setCurrentRoute(null);
    setActiveSegment(null);
    setElapsedTime(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = 0;
  };

  const handleClearData = () => {
    clearRoutes();
    setSavedRoutes([]);
  };

  // Marker Logic
  const handleMapClick = (lat: number, lng: number) => {
    if (!isValidNumber(lat) || !isValidNumber(lng)) return;
    setTempMarkerPos({ lat, lng });
    setEditingMarker(null); // Ensure we are not editing
    setModalOpen(true);
    setIsAddMarkerMode(false);
  };

  const handleEditMarker = (marker: CustomMarker) => {
      setTempMarkerPos({ lat: marker.lat, lng: marker.lng });
      setEditingMarker(marker);
      setModalOpen(true);
  };

  const handleSaveMarker = (label: string, type: CustomMarker['type']) => {
    // If editing existing marker
    if (editingMarker) {
        const updatedMarkers = markers.map(m => 
            m.id === editingMarker.id ? { ...m, label, type } : m
        );
        setMarkers(updatedMarkers);
        saveMarkers(updatedMarkers);
        setModalOpen(false);
        setEditingMarker(null);
        setTempMarkerPos(null);
        return;
    }

    // If creating new marker
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
                const pt = {
                    lat,
                    lng,
                    timestamp: pos.timestamp,
                    accuracy
                };
                setUserLocation(pt);
                lastLocationRef.current = pt;
                setCenterTrigger(prev => prev + 1);
            }
        }, (err) => {}, GEOLOCATION_OPTIONS);
    }
  };

  // Calculate live totals for display
  const liveDistance = (currentRoute?.totalDistance || 0) + (activeSegment?.distance || 0);
  const liveSteps = (currentRoute?.totalSteps || 0) + (activeSegment?.steps || 0);
  const liveCalories = (currentRoute?.totalCalories || 0) + (activeSegment?.calories || 0);
  
  // Logic to determine if we are in "Paused" state:
  // Not tracking (GPS off) BUT we have a current route in memory
  const isPaused = !isTracking && currentRoute !== null;

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
        showMarkers={showMarkers}
        onMapClick={handleMapClick}
        onEditMarker={handleEditMarker}
        onDeleteMarker={handleDeleteMarker}
        centerTrigger={centerTrigger}
        language={language}
      />
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-[1000] group">
        <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-full pl-2 pr-3 py-1.5 flex items-center gap-1.5 border border-zinc-200/50 hover:bg-white transition-all cursor-pointer">
           <Globe size={16} className="text-zinc-500" />
           <select 
             value={language} 
             onChange={(e) => setLanguage(e.target.value as Language)}
             className="bg-transparent text-sm font-medium text-zinc-700 focus:outline-none cursor-pointer appearance-none pr-4"
             style={{ backgroundImage: 'none' }}
           >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ar">Argentino</option>
           </select>
           {/* Custom arrow */}
           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-zinc-400 pointer-events-none"></div>
        </div>
      </div>
      
      {/* HUD & Controls */}
      <MapControls
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        onStopTracking={handleStopTracking}
        onAddMarkerMode={() => setIsAddMarkerMode(!isAddMarkerMode)}
        isAddMarkerMode={isAddMarkerMode}
        showMarkers={showMarkers}
        onToggleMarkers={() => setShowMarkers(!showMarkers)}
        onCenterMap={handleCenterMap}
        onOpenStats={() => setStatsOpen(true)}
        currentDistance={liveDistance}
        currentSteps={liveSteps}
        currentCalories={liveCalories}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        elapsedTime={elapsedTime}
        language={language}
      />

      <MarkerModal
        isOpen={modalOpen}
        onClose={() => {
            setModalOpen(false);
            setTempMarkerPos(null);
            setEditingMarker(null);
        }}
        onSave={handleSaveMarker}
        tempMarker={tempMarkerPos}
        editingMarker={editingMarker}
        language={language}
      />

      <StatsModal 
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        routes={savedRoutes}
        language={language}
        onClearData={handleClearData}
      />

      <PauseModal 
        isOpen={isPaused}
        onResume={handleToggleTracking}
        onFinish={handleStopTracking}
        language={language}
        distance={liveDistance}
        duration={elapsedTime}
        calories={liveCalories}
        steps={liveSteps}
        mode={currentMode}
      />

      {(!userLocation || !isValidNumber(userLocation.lat)) && (
         <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-[100] transition-opacity duration-1000 pointer-events-none">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-400 font-medium tracking-widest text-xs uppercase">{TRANSLATIONS[language].locating}</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;