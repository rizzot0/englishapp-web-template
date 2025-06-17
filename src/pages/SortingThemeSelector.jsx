// src/pages/SortingThemeSelector.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SortingThemeSelector.css';

export default function SortingThemeSelector() {
  const [theme, setTheme] = useState('');
  const navigate = useNavigate();

  const themes = [
    { label: 'Days of the Week', value: 'days' },
    { label: 'Months of the Year', value: 'months' },
    { label: 'Seasons', value: 'seasons' }
  ];

  const handleStart = () => {
    if (theme) {
      navigate(`/sorting?theme=${theme}`);
    }
  };

  return (
    <motion.div 
      className="sorting-selector"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Select a Theme to Start
      </motion.h2>

      {themes.map((t, index) => (
        <motion.button
          key={t.value}
          className={`theme-btn ${theme === t.value ? 'active' : ''}`}
          onClick={() => setTheme(t.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          {t.label}
        </motion.button>
      ))}

      <motion.button
        className="start-btn"
        onClick={handleStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Start Game
      </motion.button>
    </motion.div>
  );
}
