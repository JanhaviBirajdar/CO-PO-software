import React from 'react';
import { Sun, Moon, Type, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, textSize, toggleTextSize, highContrast, toggleHighContrast } = useTheme();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Dark / Light Mode Icon Button */}
      <button
        onClick={toggleTheme}
        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 shadow-md cursor-pointer ${
          theme === 'dark'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25 shadow-amber-500/10'
            : 'bg-indigo-100/80 border-indigo-300 text-indigo-700 hover:bg-indigo-200/80 shadow-indigo-500/10'
        }`}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-700" />
        )}
      </button>

      {/* Font Size Adjuster Icon Button */}
      <button
        onClick={toggleTextSize}
        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 shadow-md cursor-pointer relative ${
          theme === 'dark'
            ? 'bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/25 shadow-sky-500/10'
            : 'bg-sky-100/80 border-sky-300 text-sky-700 hover:bg-sky-200/80 shadow-sky-500/10'
        }`}
        title={`Text Size: ${textSize.toUpperCase()} (Click to toggle Normal / Large / XL)`}
        aria-label="Change Text Size"
      >
        <Type className={`w-4 h-4 ${theme === 'dark' ? 'text-sky-400' : 'text-sky-700'}`} />
        <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-[8px] rounded-full uppercase leading-none shadow-sm">
          {textSize === 'normal' ? '1' : textSize === 'large' ? '2' : '3'}
        </span>
      </button>

      {/* High Contrast Toggle Icon Button */}
      <button
        onClick={toggleHighContrast}
        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 shadow-md cursor-pointer ${
          highContrast
            ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-400 ring-2 ring-emerald-500/30 shadow-emerald-500/20'
            : theme === 'dark'
            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 hover:bg-purple-500/25 shadow-purple-500/10'
            : 'bg-purple-100/80 border-purple-300 text-purple-700 hover:bg-purple-200/80 shadow-purple-500/10'
        }`}
        title={highContrast ? 'High Contrast Mode: ON' : 'High Contrast Mode: OFF'}
        aria-label="Toggle High Contrast Mode"
      >
        <Eye className={`w-4 h-4 ${highContrast ? 'text-emerald-400' : theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`} />
      </button>
    </div>
  );
};
