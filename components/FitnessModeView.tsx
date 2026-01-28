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
    <div className="fixed inset-0 z-[2000] bg-zinc-50 flex flex-col animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-200/50 rounded-full">
            <span className="text-xl">{mode === 'walking' ? '🚶' : mode === 'bike' ? '🚴' : mode === 'bus' ? '🚌' : '🚗'}</span>
            <span className="text-sm font-bold text-zinc-600 uppercase tracking-wider pr-1">
                {t.modes[mode]}
            </span>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-100"
        >
          <Map size={18} />
          <span className="text-sm font-bold">{t.map_view}</span>
        </button>
      </div>

      {/* Main Metrics - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
        
        {/* Main Timer */}
        <div className="flex flex-col items-center">
             <div className="text-8xl md:text-9xl font-black text-zinc-900 font-mono tracking-tighter tabular-nums">
                {formatDuration(elapsedTime)}
             </div>
             <span className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">{t.duration}</span>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            
            {/* Distance */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-zinc-100/50">
                <span className="text-5xl font-bold text-zinc-900 tracking-tight">
                    {(currentDistance / 1000).toFixed(2)}
                </span>
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">{t.km}</span>
            </div>

            {/* Steps (if walking) */}
            {mode === 'walking' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-zinc-100/50">
                    <span className="text-5xl font-bold text-zinc-900 tracking-tight">
                        {currentSteps.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">{t.steps}</span>
                </div>
            )}

            {/* Calories */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-zinc-100/50">
                <span className="text-5xl font-bold text-zinc-900 tracking-tight">
                    {Math.round(currentCalories)}
                </span>
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">{t.calories}</span>
            </div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="pb-12 pt-6 flex justify-center items-center gap-6">
        {!isTracking ? (
           <button
             onClick={onToggleTracking}
             className="bg-zinc-900 text-white w-24 h-24 rounded-full shadow-2xl hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center"
           >
             <Play size={40} fill="currentColor" className="ml-2" />
           </button>
        ) : (
            <>
             <button
               onClick={onToggleTracking}
               className="bg-zinc-100 text-amber-500 w-20 h-20 rounded-full shadow-lg hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center border-2 border-zinc-200"
             >
               <Pause size={32} fill="currentColor" />
             </button>
             <button
               onClick={onStopTracking}
               className="bg-red-500 text-white w-20 h-20 rounded-full shadow-xl shadow-red-200 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center"
             >
               <StopCircle size={32} fill="currentColor" />
             </button>
            </>
        )}
      </div>

    </div>
  );
};