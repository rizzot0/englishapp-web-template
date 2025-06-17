// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="home-menu">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        EnglishApp 🌟
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Select a game:
      </motion.h2>

      <div className="game-grid">
        {[ 
          { icon: 'icon_memory.png', path: '/memory-theme', label: 'Memory Game' },
          { icon: 'icon_typing.png', path: '/typing-theme', label: 'Typing Game' },
          { icon: 'icon_math.png', path: '/math-theme', label: 'Math Game' },
          { icon: 'icon_order.png', path: '/sorting-theme', label: 'Sorting Game' }
        ].map((game, index) => (
          <motion.div
            className="game-card"
            key={game.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.2 }}
          >
            <img src={`/assets/images/${game.icon}`} alt={`${game.label} Icon`} />
            <Link to={game.path}><button>{game.label}</button></Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="menu-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <button className="music-btn">🔊 Música ON</button>
        <Link to="/instructions">
          <button className="instructions-btn">📄 Instructions</button>
        </Link>
      </motion.div>
    </div>
  );
}
