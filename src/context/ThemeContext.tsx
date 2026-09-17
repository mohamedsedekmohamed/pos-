import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const colorMap: Record<ThemeColor, { primary: string; dark: string }> = {
  blue: { primary: '#3b82f6', dark: '#2563eb' },
  green: { primary: '#10b981', dark: '#059669' },
  red: { primary: '#ef4444', dark: '#dc2626' },
  purple: { primary: '#8b5cf6', dark: '#7c3aed' },
  orange: { primary: '#f97316', dark: '#ea580c' },
  teal: { primary: '#14b8a6', dark: '#0d9488' },
};

const fontSizeMap: Record<FontSize, string> = {
  small: '13px',
  medium: '16px',
  large: '19px',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem('themeColor') as ThemeColor;
    return colorMap[stored] ? stored : 'blue';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const stored = localStorage.getItem('fontSize') as FontSize;
    return fontSizeMap[stored] ? stored : 'medium';
  });

  // Dark Mode effect
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Theme Color effect
  useEffect(() => {
    const { primary, dark } = colorMap[themeColor];
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-primary-dark', dark);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  // Font Size effect
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', fontSizeMap[fontSize]);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, themeColor, setThemeColor, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
