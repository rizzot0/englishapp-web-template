// src/games/SortingGame/SortingGame.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SortingGame.css';

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

  useEffect(() => {
    const list = themeItems[theme];
    setOriginal(list);
    setItems(shuffle(list));
  }, [theme]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, index) => {
    const draggedIndex = e.dataTransfer.getData('text/plain');
    if (draggedIndex === '') return;
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
  };

  const handleDragOver = (e) => e.preventDefault();

  const checkOrder = () => {
    if (items.join(',') === original.join(',')) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const reset = () => {
    setItems(shuffle(original));
    setIsCorrect(null);
  };

  return (
    <motion.div
      className="sorting-game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Order Game - {theme === 'days' ? 'Days of the Week' : theme === 'months' ? 'Months of the Year' : 'Seasons'}
      </motion.h2>

      <motion.div className="items-list" layout>
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="sortable-item"
            draggable
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
            className="result correct"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3>🎉 ¡Correcto!</h3>
            <p>🎊 ¡Ordenaste todos los elementos correctamente!</p>
            <button onClick={reset}>🔁 Seguir</button>
            <button onClick={() => navigate('/')}>🏠 Volver al Menú</button>
          </motion.div>
        )}

        {isCorrect === false && (
          <motion.div
            className="result incorrect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>❌ ¡Incorrecto!</h3>
            <p>Inténtalo de nuevo. ¡Puedes hacerlo!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
