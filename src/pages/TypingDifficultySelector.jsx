import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './TypingThemeSelector.css';

export default function TypingDifficultySelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme');
  const [difficulty, setDifficulty] = useState('');

  const handleStart = () => {
    if (difficulty && theme) {
      navigate(`/typing?theme=${theme}&difficulty=${difficulty}`);
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
        Select the difficulty
      </motion.h2>
      <motion.button
        className={`theme-btn ${difficulty === 'easy' ? 'active' : ''}`}
        onClick={() => setDifficulty('easy')}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Easy (shows the letters)
      </motion.button>
      <motion.button
        className={`theme-btn ${difficulty === 'hard' ? 'active' : ''}`}
        onClick={() => setDifficulty('hard')}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        Hard (does not show the letters)
      </motion.button>
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
        Start game
      </motion.button>
      <motion.button
        className="back-to-menu-btn"
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        Back
      </motion.button>
    </motion.div>
  );
} 