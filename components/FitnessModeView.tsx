import React from 'react';
import { Minimize2, Play, Pause, StopCircle, Timer, Flame, Footprints, Map } from 'lucide-react';
import { MovementMode, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatDuration } from '../utils/geo';

interface FitnessModeViewProps {
  isOpen: boolean;
  onClose: () => void;
  isTracking: boolean;
  onToggleTracking: () => void;
  onStopTracking: () => void;
  currentDistance: number;
  currentSteps: number;
  currentCalories: number;
  elapsedTime: number;
  mode: MovementMode;
  language: Language;
}

export const FitnessModeView: React.FC<FitnessModeViewProps> = ({
  isOpen,
  onClose,
  isTracking,
  onToggleTracking,
  onStopTracking,
  currentDistance,
  currentSteps,
  currentCalories,
  elapsedTime,
  mode,
  language
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[2000] bg-[var(--theme-50)] flex flex-col animate-in fade-in duration-300">
      
      {/* Top Bar - Fixed */}
      <div className="flex-none px-6 py-4 md:py-6 flex justify-between items-center bg-[var(--theme-50)] z-10">
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--theme-200)]/50 rounded-full">
            <span className="text-xl">{mode === 'walking' ? '🚶' : mode === 'bike' ? '🚴' : mode === 'bus' ? '🚌' : '🚗'}</span>
            <span className="text-sm font-bold text-[var(--theme-600)] uppercase tracking-wider pr-1">
                {t.modes[mode]}
            </span>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-[var(--theme-500)] hover:text-[var(--theme-900)] transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-[var(--theme-100)]"
        >
          <Map size={18} />
          <span className="text-sm font-bold">{t.map_view}</span>
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-6 space-y-8 md:space-y-12 pb-8">
          
          {/* Main Timer */}
          <div className="flex flex-col items-center">
               <div className="text-7xl md:text-9xl font-black text-[var(--theme-900)] font-mono tracking-tighter tabular-nums text-center">
                  {formatDuration(elapsedTime)}
               </div>
               <span className="text-xs md:text-sm font-bold text-[var(--theme-400)] uppercase tracking-[0.2em] mt-2">{t.duration}</span>
          </div>

          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl">
              
              {/* Distance */}
              <div className="flex flex-col items-center justify-center p-5 md:p-6 bg-white rounded-3xl shadow-sm border border-[var(--theme-100)]/50">
                  <span className="text-4xl md:text-5xl font-bold text-[var(--theme-900)] tracking-tight">
                      {(currentDistance / 1000).toFixed(2)}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-[var(--theme-400)] uppercase tracking-wider mt-1">{t.km}</span>
              </div>

              {/* Steps (if walking) */}
              {mode === 'walking' && (
                  <div className="flex flex-col items-center justify-center p-5 md:p-6 bg-white rounded-3xl shadow-sm border border-[var(--theme-100)]/50">
                      <span className="text-4xl md:text-5xl font-bold text-[var(--theme-900)] tracking-tight">
                          {currentSteps.toLocaleString()}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-[var(--theme-400)] uppercase tracking-wider mt-1">{t.steps}</span>
                  </div>
              )}

              {/* Calories */}
              <div className="flex flex-col items-center justify-center p-5 md:p-6 bg-white rounded-3xl shadow-sm border border-[var(--theme-100)]/50">
                  <span className="text-4xl md:text-5xl font-bold text-[var(--theme-900)] tracking-tight">
                      {Math.round(currentCalories)}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-[var(--theme-400)] uppercase tracking-wider mt-1">{t.calories}</span>
              </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="flex-none pb-8 pt-4 md:pb-12 md:pt-6 flex justify-center items-center gap-6 bg-[var(--theme-50)] border-t border-[var(--theme-100)] z-10">
        {!isTracking ? (
           <button
             onClick={onToggleTracking}
             className="bg-[var(--theme-900)] text-white w-20 h-20 md:w-24 md:h-24 rounded-full shadow-2xl hover:bg-[var(--theme-800)] active:scale-95 transition-all flex items-center justify-center"
           >
             <Play fill="currentColor" className="ml-2 w-8 h-8 md:w-10 md:h-10" />
           </button>
        ) : (
            <>
             <button
               onClick={onToggleTracking}
               className="bg-[var(--theme-100)] text-amber-500 w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg hover:bg-[var(--theme-200)] active:scale-95 transition-all flex items-center justify-center border-2 border-[var(--theme-200)]"
             >
               <Pause fill="currentColor" className="w-7 h-7 md:w-8 md:h-8" />
             </button>
             <button
               onClick={onStopTracking}
               className="bg-red-500 text-white w-16 h-16 md:w-20 md:h-20 rounded-full shadow-xl shadow-red-200 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center"
             >
               <StopCircle fill="currentColor" className="w-7 h-7 md:w-8 md:h-8" />
             </button>
            </>
        )}
      </div>

    </div>
  );
};