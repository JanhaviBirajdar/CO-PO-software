import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type TextSize = 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  toggleTextSize: () => void;
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'dark'; // Default theme
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const savedSize = localStorage.getItem('app_text_size');
    if (savedSize === 'normal' || savedSize === 'large' || savedSize === 'xlarge') {
      return savedSize;
    }
    return 'large'; // Default to Large text for better readability by senior users
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('app_high_contrast') === 'true';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('app_text_size', size);
  };

  const toggleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  const setHighContrast = (active: boolean) => {
    setHighContrastState(active);
    localStorage.setItem('app_high_contrast', active ? 'true' : 'false');
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }

    root.classList.remove('text-normal', 'text-large', 'text-xlarge');
    root.classList.add(`text-${textSize}`);

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [theme, textSize, highContrast]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        textSize,
        setTextSize,
        toggleTextSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

