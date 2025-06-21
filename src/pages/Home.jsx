// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { motion } from 'framer-motion';
import FloatingParticles from '../components/FloatingParticles';

export default function Home() {
  return (
    <div className="home-menu">
      <FloatingParticles />
      
      {/* Elementos decorativos */}
      <div className="decorative-elements">
        <div className="decorative-element">🎈</div>
        <div className="decorative-element">🎪</div>
        <div className="decorative-element">🎨</div>
        <div className="decorative-element">🎭</div>
      </div>

      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        EnglishApp
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        ¡Aprende inglés jugando! 🎮
      </motion.h2>

      <div className="game-grid">
        {[ 
          { icon: 'icon_memory.png', path: '/memory-theme', label: 'Memory Game', emoji: '🧠' },
          { icon: 'icon_typing.png', path: '/typing-theme', label: 'Typing Game', emoji: '⌨️' },
          { icon: 'icon_math.png', path: '/math-theme', label: 'Math Game', emoji: '➕' },
          { icon: 'icon_order.png', path: '/sorting-theme', label: 'Sorting Game', emoji: '🔀' }
        ].map((game, index) => (
          <motion.div
            className="game-card"
            key={game.label}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
              style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
            >
              {game.emoji}
            </motion.div>
            <img src={`/assets/images/${game.icon}`} alt={`${game.label} Icon`} />
            <Link to={game.path}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {game.label}
              </motion.button>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="menu-buttons"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <Link to="/instructions">
          <motion.button 
            className="instructions-btn"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            📄 Instrucciones
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
