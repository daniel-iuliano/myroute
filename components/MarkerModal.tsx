import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { MARKER_TYPES } from '../constants';
import { CustomMarker } from '../types';

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, type: CustomMarker['type']) => void;
  tempMarker: { lat: number; lng: number } | null;
}

export const MarkerModal: React.FC<MarkerModalProps> = ({ isOpen, onClose, onSave, tempMarker }) => {
  const [label, setLabel] = useState('');
  const [selectedType, setSelectedType] = useState<CustomMarker['type']>('general');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onSave(label, selectedType);
      setLabel('');
      setSelectedType('general');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-zinc-900">New Marker</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Favorite Coffee"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {MARKER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value as CustomMarker['type'])}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    selectedType === type.value
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-105'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                  }`}
                >
                  <span className="text-xl mb-1">{type.icon}</span>
                  <span className="text-[10px] font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!label.trim()}
            className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <Check size={18} strokeWidth={3} />
            <span>Save Location</span>
          </button>
        </form>
      </div>
    </div>
  );
};