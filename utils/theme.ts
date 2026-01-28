import { THEME_PRESETS } from '../constants';

interface ThemeVariables {
  '--theme-50': string;
  '--theme-100': string;
  '--theme-200': string;
  '--theme-300': string;
  '--theme-400': string;
  '--theme-500': string;
  '--theme-600': string;
  '--theme-700': string;
  '--theme-800': string;
  '--theme-900': string;
  '--theme-950': string;
  primaryHex: string; // For Leaflet or other JS needs
  darkHex: string;
}

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const generateThemeVariables = (theme: string): ThemeVariables => {
  let hue = 240;
  let sat = 5; // Default Zinc-like

  if (theme.startsWith('custom:')) {
    const val = parseInt(theme.split(':')[1], 10);
    if (!isNaN(val)) {
      hue = val;
      sat = 90; // Default high saturation for custom colors
    }
  } else {
    const preset = THEME_PRESETS.find(p => p.value === theme);
    if (preset) {
      hue = preset.hue;
      sat = preset.sat;
    }
  }

  const getHsl = (l: number) => `hsl(${hue}, ${sat}%, ${l}%)`;
  
  return {
    '--theme-50': getHsl(97),
    '--theme-100': getHsl(93),
    '--theme-200': getHsl(88),
    '--theme-300': getHsl(80),
    '--theme-400': getHsl(65),
    '--theme-500': getHsl(50),
    '--theme-600': getHsl(40),
    '--theme-700': getHsl(30),
    '--theme-800': getHsl(20),
    '--theme-900': getHsl(10),
    '--theme-950': getHsl(5),
    primaryHex: hslToHex(hue, sat, 50), // Standard primary
    darkHex: hslToHex(hue, sat, 10),    // Standard dark
  };
};