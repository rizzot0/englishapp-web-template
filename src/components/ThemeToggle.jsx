import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../utils/themeContext.jsx';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1, rotate: 180 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="theme-icon"
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </motion.div>
      
      {/* Efecto de ondas */}
      <motion.div
        className="theme-ripple"
        animate={{
          scale: [0, 1.5],
          opacity: [0.8, 0]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 2
        }}
      />
    </motion.button>
  );
};

export default ThemeToggle; 