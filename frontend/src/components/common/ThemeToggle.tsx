import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = true, className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer select-none border border-slate-700/60 light:border-slate-300/80 bg-slate-800/80 light:bg-slate-100 hover:scale-105 active:scale-95 shadow-sm text-xs font-semibold ${className}`}
      title={theme === 'dark' ? 'Switch to White / Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      <div className="relative flex items-center justify-center w-5 h-5">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>

      {showLabel && (
        <span className="text-slate-200 light:text-slate-700 font-medium">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
