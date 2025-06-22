// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { motion } from 'framer-motion';
import FloatingParticles from '../components/FloatingParticles';
import icon_memory from '/assets/images/icon_memory.png';
import icon_typing from '/assets/images/icon_typing.png';
import icon_math from '/assets/images/icon_math.png';
import icon_order from '/assets/images/icon_order.png';
import icon_sound from '/assets/images/icon_sound.png';
import icon_eye from '/assets/images/eye.png';

const games = [
  { name: 'Memory Game', path: '/memory-theme', icon: icon_memory },
  { name: 'Typing Game', path: '/typing-theme', icon: icon_typing },
  { name: 'Math Game', path: '/math-theme', icon: icon_math },
  { name: 'Sorting Game', path: '/sorting-theme', icon: icon_order },
  { name: 'Sound Match', path: '/sound-matching-theme', icon: icon_sound },
  { name: 'Identification Game', path: '/identification-theme', icon: icon_eye }
];

const GameCard = ({ game, index }) => {
  return (
    <motion.div
      className="game-card"
      key={game.name}
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
      <img src={game.icon} alt={`${game.name} Icon`} />
      <Link to={game.path}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {game.name}
        </motion.button>
      </Link>
    </motion.div>
  );
};

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
        {games.map((game, index) => (
          <GameCard game={game} index={index} />
        ))}
      </div>

      <motion.div
        className="menu-buttons"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <Link to="/statistics">
          <motion.button 
            className="statistics-btn"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            📊 Mis Estadísticas
          </motion.button>
        </Link>
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
