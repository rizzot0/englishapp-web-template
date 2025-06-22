import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Obtener el tema guardado en localStorage o usar el preferido del sistema
    const savedTheme = localStorage.getItem('englishAppTheme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Detectar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Guardar el tema en localStorage
    localStorage.setItem('englishAppTheme', isDarkMode ? 'dark' : 'light');
    
    // Aplicar clase al body
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Actualizar meta theme-color para PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#1a1a2e' : '#FDFCDC');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 