// src/games/SortingGame/SortingGame.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import './SortingGame.css';
import { loadSound, playSound } from '../../utils/soundManager';
import { gameStatsAPI } from '../../utils/supabase';

const themeItems = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  seasons: ['Spring', 'Summer', 'Autumn', 'Winter']
};

export default function SortingGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'days';

  const [items, setItems] = useState([]);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [status, setStatus] = useState(null); // 'correct', 'incorrect'
  const [savingStats, setSavingStats] = useState(false);

  useEffect(() => {
    const list = themeItems[theme];
    setOriginalOrder(list);
    setItems(shuffle(list));
    setStatus(null);

    loadSound('cardFlip.wav');
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('win.wav');
  }, [theme]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Guardar estadísticas en Supabase
  const saveStatsToDatabase = async (isCorrect) => {
    if (!isCorrect) return;
    try {
      setSavingStats(true);
      const gameData = {
        game_type: 'sortingGame',
        theme: theme,
        score: isCorrect ? 1 : 0,
        duration: null,
        mistakes: null,
        correct_answers: isCorrect ? items.length : 0,
        total_questions: items.length,
        difficulty: 'normal',
        player_name: 'Estudiante',
        wpm: null,
        accuracy: null
      };
      console.log('Intentando guardar en Supabase:', gameData);
      const result = await gameStatsAPI.saveGameStats(gameData);
      console.log('Respuesta de Supabase:', result);
      if (result.success) {
        console.log('Estadísticas guardadas en la base de datos');
      } else {
        console.error('Error guardando estadísticas:', result.error);
      }
    } catch (error) {
      console.error('Error guardando estadísticas en la base de datos:', error);
    } finally {
      setSavingStats(false);
    }
  };

  const checkOrder = () => {
    const isCorrect = items.join(',') === originalOrder.join(',');
    setStatus(isCorrect ? 'correct' : 'incorrect');
    playSound(isCorrect ? 'correct.wav' : 'incorrect.wav');
    if (isCorrect) {
      setTimeout(() => playSound('win.wav'), 500);
      saveStatsToDatabase(true);
    } else {
      // Reset status after a delay if incorrect
      setTimeout(() => setStatus(null), 1000);
    }
  };

  const resetGame = () => {
    setItems(shuffle(originalOrder));
    setStatus(null);
  };

  const getTitle = () => {
      switch(theme) {
          case 'days': return 'Days of the Week';
          case 'months': return 'Months of the Year';
          case 'seasons': return 'Seasons';
          default: return 'Order Game';
      }
  }

  return (
    <motion.div 
        className="sorting-game" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
    >
        <motion.h2 
            initial={{ y: -30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            Organize the {getTitle()}
        </motion.h2>

        <Reorder.Group 
            axis="y" 
            values={items} 
            onReorder={setItems}
            className={`items-list-sorting ${status ? status : ''}`}
        >
            {items.map((item) => (
                <Reorder.Item 
                    key={item} 
                    value={item}
                    className="sortable-item-sorting"
                    whileDrag={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
                    onDragStart={() => playSound('cardFlip.wav')}
                >
                    <span className="drag-handle">::</span>
                    <span>{item}</span>
                </Reorder.Item>
            ))}
        </Reorder.Group>

        <div className="buttons-sorting">
            <motion.button whileHover={{ scale: 1.05 }} onClick={checkOrder}>
                ✓ Check Order
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={resetGame}>
                🔄 Reset
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/')}>
                🏠 Back to Menu
            </motion.button>
        </div>

        <AnimatePresence>
            {status === 'correct' && (
                <motion.div
                    className="sorting-end-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                <motion.div
                    className="sorting-end-popup"
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: 'spring' }}
                >
                    <h2>🎉 Well Done!</h2>
                    <p>You sorted them all correctly!</p>
                    {savingStats && (
                      <div className="stat-row saving-stats">
                        <span className="stat-label-final">💾 Guardando estadísticas...</span>
                      </div>
                    )}
                    <div className="end-screen-buttons">
                        <button onClick={resetGame}>Play Again</button>
                        <button onClick={() => navigate('/')}>Back to Menu</button>
                    </div>
                </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
}
