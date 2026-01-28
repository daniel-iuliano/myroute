import React from 'react';
import { Play, Pause, StopCircle, MapPin, Navigation, BarChart3, Timer, Eye, EyeOff } from 'lucide-react';
import { MOVEMENT_MODES, TRANSLATIONS } from '../constants';
import { MovementMode, Language } from '../types';
import { formatDuration } from '../utils/geo';

interface MapControlsProps {
  isTracking: boolean;
  onToggleTracking: () => void;
  onStopTracking: () => void;
  onAddMarkerMode: () => void;
  isAddMarkerMode: boolean;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  onCenterMap: () => void;
  onOpenStats: () => void;
  currentDistance: number;
  currentSteps: number;
  currentCalories: number;
  currentMode: MovementMode;
  onModeChange: (mode: MovementMode) => void;
  elapsedTime: number;
  language: Language;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isTracking,
  onToggleTracking,
  onStopTracking,
  onAddMarkerMode,
  isAddMarkerMode,
  showMarkers,
  onToggleMarkers,
  onCenterMap,
  onOpenStats,
  currentDistance,
  currentSteps,
  currentCalories,
  currentMode,
  onModeChange,
  elapsedTime,
  language
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="absolute bottom-6 md:bottom-8 left-0 right-0 px-4 md:px-8 z-[1000] pointer-events-none flex flex-col items-center gap-3 md:gap-4 pb-safe-area">
      {/* Live Stats Card */}
      {isTracking && (
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 md:p-5 w-full max-w-sm pointer-events-auto border border-zinc-200/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Timer Header */}
          <div className="flex items-center justify-center mb-4 pb-4 border-b border-zinc-100/80">
             <div className="flex items-center gap-2 text-zinc-900">
                 <Timer size={18} className="text-zinc-400 animate-pulse" />
                 <span className="text-3xl font-mono font-bold tracking-tight tabular-nums">
                    {formatDuration(elapsedTime)}
                 </span>
             </div>
          </div>

          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t.distance}</span>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
               {currentMode === 'walking' ? t.steps : t.calories}
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-zinc-900 tracking-tight">
                {(currentDistance / 1000).toFixed(2)}
              </span>
              <span className="text-sm font-medium text-zinc-500">{t.km}</span>
            </div>
            
            {/* Conditional Metric Display */}
            {currentMode === 'walking' ? (
                <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-zinc-900 tracking-tight">
                    {currentSteps.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-zinc-500">{t.steps.toLowerCase()}</span>
                </div>
            ) : (
                <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-zinc-900 tracking-tight">
                    {Math.round(currentCalories)}
                </span>
                <span className="text-sm font-medium text-zinc-500">{t.kcal}</span>
                </div>
            )}
          </div>
          
          {/* Secondary stats for hybrid/completeness */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-xs text-zinc-500">
             {currentMode === 'walking' && (
                <span>{Math.round(currentCalories)} {t.burned}</span>
             )}
             {currentMode !== 'walking' && currentSteps > 0 && (
                <span>{currentSteps} {t.taken_previously}</span>
             )}
          </div>
        </div>
      )}

      {/* Mode Selection Pills */}
      <div className="flex bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-1 gap-1 pointer-events-auto border border-zinc-200/50 overflow-x-auto max-w-full touch-pan-x scrollbar-hide">
         {MOVEMENT_MODES.map((mode) => (
             <button
               key={mode.value}
               onClick={() => onModeChange(mode.value as MovementMode)}
               className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                 currentMode === mode.value 
                   ? 'bg-zinc-900 text-white shadow-md' 
                   : 'text-zinc-600 hover:bg-zinc-100'
               }`}
             >
                 <span>{mode.icon}</span>
                 <span>{t.modes[mode.value as MovementMode]}</span>
             </button>
         ))}
      </div>

      {/* Main Control Bar */}
      <div className="flex items-center gap-3 pointer-events-auto">
        
        {/* Center Map Button */}
        <button
          onClick={onCenterMap}
          className="bg-white text-zinc-900 p-3 md:p-4 rounded-full shadow-xl hover:bg-zinc-50 active:scale-95 transition-all duration-200 border border-zinc-100"
          aria-label={t.center_map || "Center Map"}
        >
          <Navigation size={24} strokeWidth={2} />
        </button>

        {/* Stats Button */}
        <button
          onClick={onOpenStats}
          className="bg-white text-zinc-900 p-3 md:p-4 rounded-full shadow-xl hover:bg-zinc-50 active:scale-95 transition-all duration-200 border border-zinc-100"
          aria-label={t.stats}
        >
          <BarChart3 size={24} strokeWidth={2} />
        </button>

        {/* Tracking Toggle */}
        <div className="flex items-center bg-zinc-900 rounded-full shadow-2xl p-1.5 gap-2">
           {!isTracking ? (
              <button
                onClick={onToggleTracking}
                className="bg-zinc-900 text-white p-3 md:p-4 rounded-full hover:bg-zinc-800 active:scale-95 transition-all duration-200 flex items-center justify-center w-14 h-14 md:w-16 md:h-16"
                aria-label={t.tracking_start || "Start"}
              >
                <Play size={28} fill="currentColor" className="ml-1" />
              </button>
           ) : (
             <>
              <button
                onClick={onToggleTracking}
                className="bg-zinc-800 text-amber-400 p-3 md:p-4 rounded-full hover:bg-zinc-700 active:scale-95 transition-all duration-200 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center"
                aria-label={t.tracking_stop || "Pause"}
              >
                <Pause size={24} fill="currentColor" />
              </button>
              <button
                onClick={onStopTracking}
                className="bg-red-500 text-white p-3 md:p-4 rounded-full hover:bg-red-600 active:scale-95 transition-all duration-200 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center"
                aria-label="Stop"
              >
                <StopCircle size={24} fill="currentColor" />
              </button>
             </>
           )}
        </div>

        {/* Marker Controls Group */}
        <div className="flex items-center gap-2">
            {/* Toggle Markers */}
            <button
                onClick={onToggleMarkers}
                className={`p-3 md:p-4 rounded-full shadow-xl active:scale-95 transition-all duration-200 border border-zinc-100 ${
                !showMarkers 
                    ? 'bg-zinc-100 text-zinc-400' 
                    : 'bg-white text-zinc-900 hover:bg-zinc-50'
                }`}
                aria-label={t.toggle_markers || "Toggle Markers"}
            >
                {showMarkers ? <Eye size={24} strokeWidth={2} /> : <EyeOff size={24} strokeWidth={2} />}
            </button>

            {/* Add Marker Button */}
            <button
            onClick={onAddMarkerMode}
            className={`p-3 md:p-4 rounded-full shadow-xl active:scale-95 transition-all duration-200 border border-zinc-100 ${
                isAddMarkerMode 
                ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2' 
                : 'bg-white text-zinc-900 hover:bg-zinc-50'
            }`}
            aria-label={t.add_marker || "Add Marker"}
            >
            <MapPin size={24} strokeWidth={2} className={isAddMarkerMode ? "animate-pulse" : ""} />
            </button>
        </div>
      </div>
      
      {isAddMarkerMode && (
         <div className="bg-zinc-900 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-bounce mb-2 text-center">
            {t.tap_map}
         </div>
      )}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .pb-safe-area {
            padding-bottom: env(safe-area-inset-bottom, 24px);
        }
      `}</style>
    </div>
  );
};