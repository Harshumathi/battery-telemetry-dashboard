import { useState, useEffect, useContext, createContext } from 'react';


const ThemeContext = createContext();


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };


  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
