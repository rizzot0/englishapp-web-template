// src/games/SortingGame/SortingGame.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SortingGame.css';
import { loadSound, playSound } from '../../utils/soundManager';

const themeItems = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  seasons: ['Spring', 'Summer', 'Autumn', 'Winter']
};

export default function SortingGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'days';

  const [items, setItems] = useState([]);
  const [original, setOriginal] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const list = themeItems[theme];
    setOriginal(list);
    setItems(shuffle(list));
    loadSound('cardFlip.wav');
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('win.wav');
  }, [theme]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const isMobile = () => window.innerWidth <= 768;

  const handleItemClick = (index) => {
    if (!isMobile()) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      const newItems = [...items];
      const temp = newItems[selectedIndex];
      newItems[selectedIndex] = newItems[index];
      newItems[index] = temp;
      setItems(newItems);
      setSelectedIndex(null);
      playSound('cardFlip.wav'); // sonido intercambio en móvil
    }
  };

  const handleDragStart = (e, index) => {
    if (isMobile()) return;
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, index) => {
    if (isMobile()) return;
    const draggedIndex = e.dataTransfer.getData('text/plain');
    if (draggedIndex === '') return;
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    playSound('cardFlip.wav'); // sonido arrastrar y soltar
  };

  const handleDragOver = (e) => {
    if (!isMobile()) e.preventDefault();
  };

  const checkOrder = () => {
    const isRight = items.join(',') === original.join(',');
    setIsCorrect(isRight);
    playSound(isRight ? 'correct.wav' : 'incorrect.wav');
    if (isRight) {
      setTimeout(() => playSound('win.wav'), 500);
    }
  };

  const reset = () => {
    setItems(shuffle(original));
    setIsCorrect(null);
    setSelectedIndex(null);
  };

  return (
    <motion.div className="sorting-game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        Order Game - {theme === 'days' ? 'Days of the Week' : theme === 'months' ? 'Months of the Year' : 'Seasons'}
      </motion.h2>

      <motion.div className="items-list" layout>
        {items.map((item, index) => (
          <motion.div
            key={index}
            className={`sortable-item ${selectedIndex === index ? 'selected' : ''}`}
            draggable={!isMobile()}
            onClick={() => handleItemClick(index)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            {item}
          </motion.div>
        ))}
      </motion.div>

      <div className="buttons">
        <motion.button whileHover={{ scale: 1.05 }} onClick={checkOrder}>✓📋 Verificar orden</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={reset}>🔄 Reiniciar</motion.button>
      </div>

<AnimatePresence>
  {isCorrect === true && (
    <motion.div
      className="sorting-end-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="sorting-end-popup"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2>🎉 ¡Correcto!</h2>
        <p>🎊 ¡Ordenaste todos los elementos correctamente!</p>
        <button onClick={reset}>🔁 Seguir</button>
        <button onClick={() => navigate('/')}>🏠 Volver al Menú</button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </motion.div>
  );
}
