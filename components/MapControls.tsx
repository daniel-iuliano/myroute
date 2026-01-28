import React from 'react';
import { Play, Pause, StopCircle, MapPin, Navigation, BarChart3, Timer, Eye, EyeOff, Maximize2, Palette } from 'lucide-react';
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
  onToggleFitnessMode: () => void;
  onOpenThemeModal: () => void;
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
  onToggleFitnessMode,
  onOpenThemeModal,
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
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 md:p-5 w-full max-w-sm pointer-events-auto border border-[var(--theme-200)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Timer Header */}
          <div className="flex items-center justify-center mb-4 pb-4 border-b border-[var(--theme-100)]">
             <div className="flex items-center gap-2 text-[var(--theme-900)]">
                 <Timer size={18} className="text-[var(--theme-400)] animate-pulse" />
                 <span className="text-3xl font-mono font-bold tracking-tight tabular-nums">
                    {formatDuration(elapsedTime)}
                 </span>
             </div>
          </div>

          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-[var(--theme-400)] uppercase tracking-wider">{t.distance}</span>
            <span className="text-xs font-semibold text-[var(--theme-400)] uppercase tracking-wider">
               {currentMode === 'walking' ? t.steps : t.calories}
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[var(--theme-900)] tracking-tight">
                {(currentDistance / 1000).toFixed(2)}
              </span>
              <span className="text-sm font-medium text-[var(--theme-500)]">{t.km}</span>
            </div>
            
            {/* Conditional Metric Display */}
            {currentMode === 'walking' ? (
                <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--theme-900)] tracking-tight">
                    {currentSteps.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-[var(--theme-500)]">{t.steps.toLowerCase()}</span>
                </div>
            ) : (
                <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--theme-900)] tracking-tight">
                    {Math.round(currentCalories)}
                </span>
                <span className="text-sm font-medium text-[var(--theme-500)]">{t.kcal}</span>
                </div>
            )}
          </div>
          
          {/* Secondary stats for hybrid/completeness */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--theme-100)] text-xs text-[var(--theme-500)]">
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
      <div className="flex bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-1 gap-1 pointer-events-auto border border-[var(--theme-200)] overflow-x-auto max-w-full touch-pan-x scrollbar-hide">
         {MOVEMENT_MODES.map((mode) => (
             <button
               key={mode.value}
               onClick={() => onModeChange(mode.value as MovementMode)}
               className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                 currentMode === mode.value 
                   ? 'bg-[var(--theme-900)] text-white shadow-md' 
                   : 'text-[var(--theme-600)] hover:bg-[var(--theme-50)]'
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
          className="bg-white text-[var(--theme-900)] p-3 md:p-4 rounded-full shadow-xl hover:bg-[var(--theme-50)] active:scale-95 transition-all duration-200 border border-[var(--theme-100)]"
          aria-label={t.center_map || "Center Map"}
        >
          <Navigation size={24} strokeWidth={2} />
        </button>

        {/* Stats Button */}
        <button
          onClick={onOpenStats}
          className="bg-white text-[var(--theme-900)] p-3 md:p-4 rounded-full shadow-xl hover:bg-[var(--theme-50)] active:scale-95 transition-all duration-200 border border-[var(--theme-100)]"
          aria-label={t.stats}
        >
          <BarChart3 size={24} strokeWidth={2} />
        </button>

        {/* Tracking Toggle */}
        <div className="flex items-center bg-[var(--theme-900)] rounded-full shadow-2xl p-1.5 gap-2">
           {!isTracking ? (
              <button
                onClick={onToggleTracking}
                className="bg-[var(--theme-900)] text-white p-3 md:p-4 rounded-full hover:bg-[var(--theme-800)] active:scale-95 transition-all duration-200 flex items-center justify-center w-14 h-14 md:w-16 md:h-16"
                aria-label={t.tracking_start || "Start"}
              >
                <Play size={28} fill="currentColor" className="ml-1" />
              </button>
           ) : (
             <>
              <button
                onClick={onToggleTracking}
                className="bg-[var(--theme-800)] text-amber-400 p-3 md:p-4 rounded-full hover:bg-[var(--theme-700)] active:scale-95 transition-all duration-200 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center"
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

        {/* Marker & View Controls Group */}
        <div className="flex items-center gap-2">
             
             {/* Theme Toggle */}
             <button
                onClick={onOpenThemeModal}
                className="p-3 md:p-4 rounded-full shadow-xl active:scale-95 transition-all duration-200 border border-[var(--theme-100)] bg-white text-[var(--theme-900)] hover:bg-[var(--theme-50)]"
                aria-label={t.theme || "Theme"}
            >
                <Palette size={24} strokeWidth={2} />
            </button>
            
             {/* Fitness Mode Toggle */}
             <button
                onClick={onToggleFitnessMode}
                className="p-3 md:p-4 rounded-full shadow-xl active:scale-95 transition-all duration-200 border border-[var(--theme-100)] bg-white text-[var(--theme-900)] hover:bg-[var(--theme-50)]"
                aria-label={t.fitness_mode || "Fitness Mode"}
            >
                <Maximize2 size={24} strokeWidth={2} />
            </button>

            {/* Toggle Markers */}
            <button
                onClick={onToggleMarkers}
                className={`p-3 md:p-4 rounded-full shadow-xl active:scale-95 transition-all duration-200 border border-[var(--theme-100)] ${
                !showMarkers 
                    ? 'bg-[var(--theme-100)] text-[var(--theme-400)]' 
                    : 'bg-white text-[var(--theme-900)] hover:bg-[var(--theme-50)]'
                }`}
                aria-label={t.toggle_markers || "Toggle Markers"}
            >
                {showMarkers ? <Eye size={24} strokeWidth={2} /> : <EyeOff size={24} strokeWidth={2} />}
            </button>

            {/* Add Marker Button */}
            <button
            onClick={onAddMarkerMode}
            className={`p-3 md:p-4 rounded-full shadow-xl active:scale-95 transition-all duration-200 border border-[var(--theme-100)] ${
                isAddMarkerMode 
                ? 'bg-[var(--theme-900)] text-white ring-2 ring-[var(--theme-900)] ring-offset-2' 
                : 'bg-white text-[var(--theme-900)] hover:bg-[var(--theme-50)]'
            }`}
            aria-label={t.add_marker || "Add Marker"}
            >
            <MapPin size={24} strokeWidth={2} className={isAddMarkerMode ? "animate-pulse" : ""} />
            </button>
        </div>
      </div>
      
      {isAddMarkerMode && (
         <div className="bg-[var(--theme-900)] text-white text-sm px-4 py-2 rounded-full shadow-lg animate-bounce mb-2 text-center">
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