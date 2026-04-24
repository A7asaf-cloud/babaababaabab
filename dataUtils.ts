import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Dir = 'ltr' | 'rtl';

interface UIContextType {
  theme: Theme;
  dir: Dir;
  toggleTheme: () => void;
  toggleDir: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [dir, setDir] = useState<Dir>(() => 
    (localStorage.getItem('dir') as Dir) || 'ltr'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dir = dir;
    localStorage.setItem('theme', theme);
    localStorage.setItem('dir', dir);
  }, [theme, dir]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleDir = () => setDir(prev => prev === 'ltr' ? 'rtl' : 'ltr');

  return (
    <UIContext.Provider value={{ theme, dir, toggleTheme, toggleDir }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
