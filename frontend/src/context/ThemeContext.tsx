import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ColorTheme {
  name: string;
  primary: string;
  secondary: string;
  color: string;
}

const colorThemes: ColorTheme[] = [
  { name: 'Default', primary: '262 83% 58%', secondary: '220 100% 64%', color: 'hsl(262 83% 58%)' },
  { name: 'Ocean', primary: '200 100% 40%', secondary: '200 100% 60%', color: 'hsl(200 100% 40%)' },
  { name: 'Forest', primary: '142 76% 36%', secondary: '142 76% 56%', color: 'hsl(142 76% 36%)' },
  { name: 'Sunset', primary: '24 95% 53%', secondary: '24 95% 73%', color: 'hsl(24 95% 53%)' },
  { name: 'Purple', primary: '280 100% 70%', secondary: '280 100% 85%', color: 'hsl(280 100% 70%)' }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: string;
  setColorTheme: (themeName: string) => void;
  availableColorThemes: ColorTheme[];
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  );
  
  const [colorTheme, setColorThemeState] = useState<string>(
    () => localStorage.getItem('selectedTheme') || 'Default'
  );

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === 'dark');
    } else {
      root.classList.add(theme);
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    const selected = colorThemes.find(t => t.name === colorTheme);
    if (selected) {
      const root = document.documentElement;
      root.style.setProperty('--primary', selected.primary);
      root.style.setProperty('--secondary', selected.secondary);
      root.style.setProperty('--ring', selected.primary);
    }
  }, [colorTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  const setColorTheme = (newColorTheme: string) => {
    localStorage.setItem('selectedTheme', newColorTheme);
    setColorThemeState(newColorTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        colorTheme, 
        setColorTheme, 
        availableColorThemes: colorThemes,
        isDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
