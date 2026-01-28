import React, { useState, useEffect } from 'react';
import { X, Check, Palette } from 'lucide-react';
import { Language } from '../types';
import { THEME_PRESETS, TRANSLATIONS } from '../constants';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeSelect: (theme: string) => void;
  language: Language;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onThemeSelect,
  language
}) => {
  // Parse initial hue if custom
  const [customHue, setCustomHue] = useState(200);
  
  useEffect(() => {
    if (currentTheme.startsWith('custom:')) {
        const hue = parseInt(currentTheme.split(':')[1], 10);
        if (!isNaN(hue)) setCustomHue(hue);
    }
  }, [currentTheme]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hue = parseInt(e.target.value, 10);
      setCustomHue(hue);
  };

  const applyCustom = () => {
      onThemeSelect(`custom:${customHue}`);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[var(--theme-100)] flex justify-between items-center bg-[var(--theme-50)]">
          <div className="flex items-center gap-2">
             <Palette size={20} className="text-[var(--theme-900)]" />
             <h3 className="font-bold text-lg text-[var(--theme-900)]">
                {t.select_theme}
             </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>
        
        <div className="p-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
                {THEME_PRESETS.map((theme) => {
                    const isActive = currentTheme === theme.value;
                    // Generate a preview color for the preset
                    const previewColor = `hsl(${theme.hue}, ${theme.sat}%, 50%)`;
                    return (
                        <button
                            key={theme.value}
                            onClick={() => {
                                onThemeSelect(theme.value);
                                onClose();
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                isActive 
                                ? 'border-[var(--theme-500)] bg-[var(--theme-50)]' 
                                : 'border-transparent hover:bg-zinc-50'
                            }`}
                        >
                            <div 
                                className="w-8 h-8 rounded-full shadow-sm mb-2 flex items-center justify-center"
                                style={{ backgroundColor: previewColor }}
                            >
                                {isActive && <Check size={16} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-bold ${isActive ? 'text-[var(--theme-900)]' : 'text-zinc-600'}`}>
                                {theme.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-[var(--theme-100)]">
                <label className="text-xs font-bold uppercase text-[var(--theme-500)] tracking-wide mb-3 block">
                    {t.custom_color}
                </label>
                
                <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={customHue}
                    onChange={handleCustomChange}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer mb-4"
                    style={{
                        background: 'linear-gradient(to right, hsl(0, 50%, 60%) 0%, hsl(60, 50%, 60%) 17%, hsl(120, 50%, 60%) 33%, hsl(180, 50%, 60%) 50%, hsl(240, 50%, 60%) 67%, hsl(300, 50%, 60%) 83%, hsl(360, 50%, 60%) 100%)'
                    }}
                />

                <button 
                    onClick={applyCustom}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: `hsl(${customHue}, 50%, 50%)` }}
                >
                    {currentTheme === `custom:${customHue}` && <Check size={18} strokeWidth={3} />}
                    {t.select_theme}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};