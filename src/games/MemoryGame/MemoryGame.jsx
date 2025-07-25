// src/games/MemoryGame/MemoryGame.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './MemoryGame.css';
import { loadSound, playSound } from '../../utils/soundManager';
import { saveGameScore, getGameStats } from '../../utils/progressManager';
import { gameStatsAPI } from '../../utils/supabase';

const themes = {
  fruits: [
    { word: 'apple', image: 'apple.webp' },
    { word: 'banana', image: 'banana.webp' },
    { word: 'grapes', image: 'grape.webp' },
    { word: 'pear', image: 'pear.webp' },
    { word: 'cherry', image: 'cherry.webp' },
    { word: 'kiwi', image: 'kiwi.webp' },
    { word: 'lemon', image: 'lemon.webp' },
    { word: 'orange', image: 'orange.webp' },
    { word: 'blueberry', image: 'blueberry.webp' },
    { word: 'strawberry', image: 'strawberry.webp' },
    { word: 'watermelon', image: 'watermelon.webp' },
    { word: 'coconut', image: 'coconut.webp' },
    { word: 'rapsberry', image: 'rapsberry.webp' },
    { word: 'mango', image: 'mango.webp' },
    { word: 'peach', image: 'peach.webp' },
    { word: 'pineapple', image: 'pineapple.webp' },
    { word: 'grape', image: 'grape.webp' }
  ],
  colors: [
    { word: 'red', image: 'red.webp' },
    { word: 'blue', image: 'blue.webp' },
    { word: 'green', image: 'green.webp' },
    { word: 'yellow', image: 'yellow.webp' }
  ],
  shapes: [
    { word: 'circle', image: 'circle.webp' },
    { word: 'square', image: 'square.webp' },
    { word: 'star', image: 'star.webp' },
    { word: 'triangle', image: 'triangle.webp' },
    { word: 'rectangle', image: 'rectangle.webp' }
  ],
  emotions: [
    { word: 'happy', image: 'happy.webp' },
    { word: 'angry', image: 'angry.webp' },
    { word: 'sad', image: 'sad.webp' },
    { word: 'surprised', image: 'surprised.webp' }
  ]
};

const MemoryGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedTheme = params.get('theme') || 'fruits';

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [savingStats, setSavingStats] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Función para seleccionar aleatoriamente 6 frutas para cada partida
  const getRandomFruits = () => {
    const allFruits = themes.fruits;
    const shuffled = [...allFruits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6); // Solo 6 frutas
  };

  // Obtener las frutas para esta partida
  const currentFruits = selectedTheme === 'fruits' ? getRandomFruits() : themes[selectedTheme] || themes.fruits;
  const totalPairs = currentFruits.length;

  // Determinar la clase de la cuadrícula según el número de cartas
  const gridLayoutClass = totalPairs <= 4 ? 'grid-8-cards' : 'grid-16-cards';

  const prepareGame = useCallback(() => {
    loadSound('cardFlip.wav');
    loadSound('correct.wav');
    loadSound('win.wav');

    // Usar las frutas seleccionadas aleatoriamente para esta partida
    const pairs = selectedTheme === 'fruits' ? getRandomFruits() : (themes[selectedTheme] || themes.fruits);
    const mixed = pairs.flatMap(({ word, image }) => [
      { id: word, type: 'word', value: word },
      { id: word, type: 'image', value: image },
    ]);

    const shuffled = [...mixed].sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, uid: i }));
    
    setCards(shuffled);
    setMatched([]);
    setFlipped([]);
    setMoves(0);
    setGameWon(false);
    setIsChecking(false);
    setStartTime(Date.now());
    setGameTime(0);
    setIsPreviewing(true);

    // Cargar estadísticas del tema
    const stats = getGameStats('memoryGame', selectedTheme);
    setGameStats(stats);

    // Mostrar todas las cartas durante 2 segundos
    setTimeout(() => {
      setFlipped([]);
      setIsPreviewing(false);
    }, 2000);
    // Voltear todas las cartas al inicio
    setFlipped(shuffled.map((_, idx) => idx));
  }, [selectedTheme]);

  useEffect(() => {
    prepareGame();
  }, [prepareGame]);

  // Función para guardar estadísticas en Supabase
  const saveStatsToDatabase = async (score, duration, moves, accuracy) => {
    try {
      setSavingStats(true);
      
      const gameData = {
        game_type: 'memoryGame',
        theme: selectedTheme,
        score: score,
        duration: duration,
        mistakes: moves - totalPairs, // Movimientos incorrectos
        correct_answers: totalPairs,
        total_questions: totalPairs,
        difficulty: 'normal',
        player_name: 'Estudiante',
        wpm: null,
        accuracy: accuracy
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

  useEffect(() => {
    if (totalPairs > 0 && matched.length === totalPairs) {
      const endTime = Date.now();
      const timeElapsed = Math.round((endTime - startTime) / 1000);
      setGameTime(timeElapsed);
      
      setTimeout(() => {
        playSound('win.wav');
        setGameWon(true);
        
        // Guardar progreso local
        saveGameScore('memoryGame', selectedTheme, totalPairs, timeElapsed, {
          moves: moves,
          accuracy: Math.round((totalPairs / moves) * 100) || 100
        });

        // Guardar estadísticas en la base de datos
        const accuracy = Math.round((totalPairs / moves) * 100) || 100;
        saveStatsToDatabase(totalPairs, timeElapsed, moves, accuracy);
      }, 800);
    }
  }, [matched, totalPairs, moves, startTime, selectedTheme]);

  const handleClick = (index) => {
    if (isPreviewing || isChecking || gameWon || flipped.includes(index) || matched.includes(cards[index].id)) {
      return;
    }

    playSound('cardFlip.wav');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.id === secondCard.id) {
        playSound('correct.wav');
        setMatched(prev => [...prev, firstCard.id]);
        setFlipped([]);
        setIsChecking(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const handlePlayAgain = () => {
    prepareGame();
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="memory-game">
      <div className="memory-stats">
        <div className="stat-item">
          <span>Moves:</span>
          <span>{moves}</span>
        </div>
        <div className="stat-item">
          <span>Pairs Found:</span>
          <span>{matched.length} / {totalPairs}</span>
        </div>
        {gameStats && gameStats.bestScore > 0 && (
          <div className="stat-item best-score">
            <span>Best Score:</span>
            <span>{gameStats.bestScore} / {totalPairs}</span>
          </div>
        )}
        {savingStats && (
          <div className="stat-item saving">
            <span>💾 Guardando...</span>
          </div>
        )}
      </div>
      
      <div className={`grid ${gridLayoutClass}`}>
        {cards.map((card, index) => {
          const isFlipping = flipped.includes(index);
          const isMatched = matched.includes(card.id);
          const isFlipped = isFlipping || isMatched;

          return (
            <div
              key={card.uid}
              className="card"
              onClick={() => handleClick(index)}
            >
              <motion.div
                className="card-inner"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="card-face card-front">
                  <span>❓</span>
                </div>
                <div className={`card-face card-back ${isMatched ? 'matched' : ''} ${isFlipping && !isMatched ? 'flipping' : ''}`}>
                  {card.type === 'image' ? (
                    <img src={`/assets/images/${card.value}`} alt={card.id} />
                  ) : (
                    <span className="word-card-text">{card.value}</span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="memory-buttons">
        <motion.button 
          onClick={handlePlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Play Again
        </motion.button>
        <motion.button 
          onClick={handleBackToMenu}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 Back to Menu
        </motion.button>
      </div>

      <AnimatePresence>
        {gameWon && (
          <motion.div 
            className="memory-game-end-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="memory-game-end-popup"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring' }}
            >
              <h2>🎉 ¡Perfecto!</h2>
              <p>¡Has encontrado todas las parejas!</p>
              
              <div className="final-stats">
                <div className="stat-row">
                  <span className="stat-label-final">Tiempo:</span>
                  <span className="stat-value-final">{formatTime(gameTime)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-final">Movimientos:</span>
                  <span className="stat-value-final">{moves}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-final">Precisión:</span>
                  <span className="stat-value-final">{Math.round((totalPairs / moves) * 100) || 100}%</span>
                </div>
                {gameStats && gameStats.bestScore > 0 && (
                  <div className="stat-row">
                    <span className="stat-label-final">Mejor Puntuación:</span>
                    <span className="stat-value-final">{gameStats.bestScore} / {totalPairs}</span>
                  </div>
                )}
                {savingStats && (
                  <div className="stat-row saving-stats">
                    <span className="stat-label-final">💾 Guardando estadísticas...</span>
                  </div>
                )}
              </div>

              <div className="end-screen-buttons">
                <motion.button 
                  onClick={handlePlayAgain}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎮 Play Again
                </motion.button>
                <motion.button 
                  onClick={handleBackToMenu}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏠 Back to Menu
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryGame;
