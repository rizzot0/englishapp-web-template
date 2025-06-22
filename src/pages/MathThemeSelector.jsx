// src/pages/MathThemeSelector.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './TypingThemeSelector.css';

export default function MathThemeSelector() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('');

  const difficulties = [
    { name: 'Easy (0-10)', value: 'easy' },
    { name: 'Medium (0-20)', value: 'medium' },
    { name: 'Hard (0-50)', value: 'hard' }
  ];

  const handleStart = () => {
    if (difficulty) {
      navigate(`/math?difficulty=${difficulty}`);
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
        Choose a Difficulty
      </motion.h2>

      {difficulties.map((d, i) => (
        <motion.button
          key={d.value}
          className={`theme-btn ${difficulty === d.value ? 'active' : ''}`}
          onClick={() => setDifficulty(d.value)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
        >
          {d.name}
        </motion.button>
      ))}

      <motion.button
        className="start-btn"
        onClick={handleStart}
        disabled={!difficulty}
        whileHover={{ scale: !difficulty ? 1 : 1.05 }}
        whileTap={{ scale: !difficulty ? 1 : 0.95 }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        Play
      </motion.button>
    </motion.div>
  );
}
