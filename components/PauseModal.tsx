import React from 'react';
import { Play, Check, Timer, Footprints, Flame } from 'lucide-react';
import { Language, MovementMode } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatDistance, formatDuration } from '../utils/geo';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onFinish: () => void;
  language: Language;
  distance: number;
  duration: number;
  calories: number;
  steps: number;
  mode: MovementMode;
}

export const PauseModal: React.FC<PauseModalProps> = ({ 
  isOpen, 
  onResume, 
  onFinish, 
  language,
  distance,
  duration,
  calories,
  steps,
  mode
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-zinc-50 px-6 py-6 border-b border-zinc-100 flex flex-col items-center">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t.session_paused}</span>
            <h2 className="text-2xl font-black text-zinc-900">{t.current_session}</h2>
        </div>

        {/* Stats Preview */}
        <div className="p-6 space-y-6">
            {/* Time */}
            <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-mono font-bold text-zinc-900 tabular-nums tracking-tight">
                    {formatDuration(duration)}
                </div>
                <div className="text-xs font-medium text-zinc-400 uppercase mt-1 tracking-wide">{t.duration}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-zinc-100">
                    <Footprints size={20} className="text-zinc-400 mb-2" />
                    <span className="text-xl font-bold text-zinc-900">{formatDistance(distance)}</span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">{t.distance}</span>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-zinc-100">
                    <Flame size={20} className="text-zinc-400 mb-2" />
                    {mode === 'walking' ? (
                        <>
                         <span className="text-xl font-bold text-zinc-900">{steps.toLocaleString()}</span>
                         <span className="text-[10px] font-semibold text-zinc-400 uppercase">{t.steps}</span>
                        </>
                    ) : (
                        <>
                         <span className="text-xl font-bold text-zinc-900">{Math.round(calories)}</span>
                         <span className="text-[10px] font-semibold text-zinc-400 uppercase">{t.calories}</span>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 grid grid-cols-2 gap-3">
            <button 
                onClick={onResume}
                className="flex items-center justify-center gap-2 bg-zinc-900 text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
            >
                <Play size={18} fill="currentColor" />
                {t.resume}
            </button>
            <button 
                onClick={onFinish}
                className="flex items-center justify-center gap-2 bg-white text-zinc-900 border-2 border-zinc-100 py-4 rounded-xl font-bold hover:bg-zinc-50 hover:border-zinc-200 transition-all active:scale-95"
            >
                <Check size={18} />
                {t.finish}
            </button>
        </div>
      </div>
    </div>
  );
};