// src/pages/MathThemeSelector.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MathThemeSelector.css';

export default function MathThemeSelector() {
  const [theme, setTheme] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (theme) {
      navigate(`/math?theme=${theme}`);
    }
  };

  return (
    <motion.div
      className="math-theme-selector"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Selecciona una temática ...
      </motion.h2>

      <motion.button
        className={`theme-btn ${theme === 'math' ? 'active' : ''}`}
        onClick={() => setTheme('math')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Matemáticas
      </motion.button>

      <motion.button
        className={`theme-btn ${theme === 'body' ? 'active' : ''}`}
        onClick={() => setTheme('body')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        Partes del Cuerpo
      </motion.button>

      <motion.button
        className="start-btn"
        onClick={handleStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Jugar
      </motion.button>
    </motion.div>
  );
}
