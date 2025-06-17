// src/pages/TypingThemeSelector.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './TypingThemeSelector.css';

export default function TypingThemeSelector() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('');

  const themes = [
    { name: 'Fruits', value: 'fruits' },
    { name: 'Animals', value: 'animals' },
    { name: 'Family Members', value: 'family' }
  ];

  const handleStart = () => {
    if (theme) {
      navigate(`/typing?theme=${theme}`);
    }
  };

  return (
    <motion.div
      className="typing-selector"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Select a Theme to Start
      </motion.h2>

      {themes.map((t, i) => (
        <motion.button
          key={t.value}
          className={`theme-btn ${theme === t.value ? 'active' : ''}`}
          onClick={() => setTheme(t.value)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
        >
          {t.name}
        </motion.button>
      ))}

      <motion.button
        className="start-btn"
        onClick={handleStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        Start Typing Game
      </motion.button>
    </motion.div>
  );
}
