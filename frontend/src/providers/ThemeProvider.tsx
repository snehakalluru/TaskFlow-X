import { ReactNode, createContext, useEffect, useMemo } from 'react';

type Theme = 'dark';

export const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme: Theme = 'dark';
  const setTheme = () => {
    localStorage.setItem('tf_theme', 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('tf_theme', 'dark');
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

