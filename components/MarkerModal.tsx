import React, { useState, useEffect } from 'react';
import { X, Check, MapPin, ShoppingBag, TreeDeciduous, Home, Briefcase } from 'lucide-react';
import { MARKER_TYPES, TRANSLATIONS } from '../constants';
import { CustomMarker, Language } from '../types';

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, type: CustomMarker['type']) => void;
  tempMarker: { lat: number; lng: number } | null;
  editingMarker: CustomMarker | null;
  language: Language;
}

const IconMap = {
  general: MapPin,
  shop: ShoppingBag,
  park: TreeDeciduous,
  home: Home,
  work: Briefcase
};

export const MarkerModal: React.FC<MarkerModalProps> = ({ isOpen, onClose, onSave, tempMarker, editingMarker, language }) => {
  const [label, setLabel] = useState('');
  const [selectedType, setSelectedType] = useState<CustomMarker['type']>('general');
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (isOpen) {
        if (editingMarker) {
            setLabel(editingMarker.label);
            setSelectedType(editingMarker.type);
        } else {
            setLabel('');
            setSelectedType('general');
        }
    }
  }, [isOpen, editingMarker]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onSave(label, selectedType);
      // Reset is handled by useEffect on next open, but we can clear here too
      if (!editingMarker) {
          setLabel('');
          setSelectedType('general');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[var(--theme-100)] flex justify-between items-center">
          <h3 className="font-bold text-lg text-[var(--theme-900)]">
             {editingMarker ? t.edit_marker : t.new_marker}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--theme-100)] rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--theme-500)] uppercase tracking-wide mb-2">{t.label}</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t.label_placeholder}
              className="w-full bg-[var(--theme-50)] border border-[var(--theme-200)] rounded-lg px-4 py-3 text-[var(--theme-900)] placeholder:text-[var(--theme-400)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-900)] focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--theme-500)] uppercase tracking-wide mb-2">{t.type}</label>
            <div className="grid grid-cols-3 gap-2">
              {MARKER_TYPES.map((typeObj) => {
                const typeValue = typeObj.value as CustomMarker['type'];
                const IconComponent = IconMap[typeValue] || MapPin;
                
                return (
                  <button
                    key={typeValue}
                    type="button"
                    onClick={() => setSelectedType(typeValue)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      selectedType === typeValue
                        ? 'bg-[var(--theme-900)] border-[var(--theme-900)] text-white shadow-md scale-105'
                        : 'bg-white border-[var(--theme-200)] text-[var(--theme-600)] hover:border-[var(--theme-400)]'
                    }`}
                  >
                    <IconComponent size={20} className="mb-1" strokeWidth={2} />
                    <span className="text-[10px] font-medium">{t.marker_types[typeValue]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!label.trim()}
            className="w-full bg-[var(--theme-900)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-[var(--theme-800)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <Check size={18} strokeWidth={3} />
            <span>{editingMarker ? t.update_location : t.save_location}</span>
          </button>
        </form>
      </div>
    </div>
  );
};