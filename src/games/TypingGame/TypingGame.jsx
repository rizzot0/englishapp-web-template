// src/games/TypingGame/TypingGame.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TypingGame.css';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSound, playSound } from '../../utils/soundManager';
import { gameStatsAPI } from '../../utils/supabase';

const wordSets = {
  fruits: [
    { word: 'apple', image: 'apple.webp' },
    { word: 'banana', image: 'banana.webp' },
    { word: 'grapes', image: 'grape.webp' },
    { word: 'pear', image: 'pear.webp' },
    { word: 'cherry', image: 'cherry.webp' },
    { word: 'lemon', image: 'lemon.webp' },
    { word: 'mango', image: 'mango.webp' },
    { word: 'kiwi', image: 'kiwi.webp' },
    { word: 'orange', image: 'orange.webp' },
    { word: 'peach', image: 'peach.webp' },
    { word: 'pineapple', image: 'pineapple.webp' },
    { word: 'blueberry', image: 'blueberry.webp' },
    { word: 'strawberry', image: 'strawberry.webp' },
    { word: 'watermelon', image: 'watermelon.webp' },
    { word: 'coconut', image: 'coconut.webp' },
    { word: 'rapsberry', image: 'rapsberry.webp' },
    { word: 'grape', image: 'grape.webp' },
  ],
  animals: [
    { word: 'cat', image: 'cat.webp' },
    { word: 'dog', image: 'dog.webp' },
    { word: 'fish', image: 'fish.webp' },
    { word: 'elephant', image: 'elephant.webp' },
    { word: 'frog', image: 'frog.webp' },
    { word: 'giraffe', image: 'giraffe.webp' },
    { word: 'monkey', image: 'monkey.webp' },
    { word: 'lion', image: 'lion.webp' },
    { word: 'penguin', image: 'penguin.webp' },
    { word: 'zebra', image: 'zebra.webp' },
    { word: 'tiger', image: 'tiger.webp' },
    { word: 'horse', image: 'horse.webp' },
    { word: 'bear', image: 'bear.webp' },
    { word: 'rabbit', image: 'rabbit.webp' },
    { word: 'fox', image: 'fox.webp' },
    { word: 'wolf', image: 'wolf.webp' },
    { word: 'cow', image: 'cow.webp' },
    { word: 'pig', image: 'pig.webp' },
    { word: 'chicken', image: 'chicken.webp' },
    { word: 'duck', image: 'duck.webp' },
    { word: 'owl', image: 'owl.webp' },
    { word: 'snake', image: 'snake.webp' },
    { word: 'turtle', image: 'turtle.webp' },
    { word: 'dolphin', image: 'dolphin.webp' },
    { word: 'whale', image: 'whale.webp' },
    { word: 'kangaroo', image: 'kangaroo.webp' }
  ],
  family: [
    { word: 'mother', image: 'mother.webp' },
    { word: 'father', image: 'father.webp' },
    { word: 'brother', image: 'brother.webp' },
    { word: 'sister', image: 'sister.webp' },
    { word: 'grandma', image: 'grandma.webp' },
    { word: 'grandpa', image: 'grandpa.webp' },
    { word: 'uncle', image: 'uncle.webp' },
    { word: 'aunt', image: 'aunt.webp' },
    { word: 'cousin', image: 'cousin.webp' },
    { word: 'niece', image: 'niece.webp' },
    { word: 'nephew', image: 'nephew.webp' },
    { word: 'baby', image: 'baby.webp' },
    { word: 'parents', image: 'parents.webp' }
  ]
};

const GAME_DURATION = 60;

// Función para detectar si es un dispositivo móvil
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768 && 'ontouchstart' in window);
};

// Componente del teclado virtual
const VirtualKeyboard = ({ onKeyPress, disabled }) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  
  const handleKeyClick = (key) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  return (
    <div className="virtual-keyboard">
      <div className="keyboard-row">
        {alphabet.slice(0, 10).map((key) => (
          <button
            key={key}
            className="keyboard-key"
            onClick={() => handleKeyClick(key)}
            disabled={disabled}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="keyboard-row">
        {alphabet.slice(10, 19).map((key) => (
          <button
            key={key}
            className="keyboard-key"
            onClick={() => handleKeyClick(key)}
            disabled={disabled}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="keyboard-row">
        {alphabet.slice(19).map((key) => (
          <button
            key={key}
            className="keyboard-key"
            onClick={() => handleKeyClick(key)}
            disabled={disabled}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function TypingGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedTheme = params.get('theme') || 'fruits';
  const difficulty = params.get('difficulty') || 'easy';

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [wordCompleted, setWordCompleted] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [savingStats, setSavingStats] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const prepareGame = useCallback(() => {
    setWords([...wordSets[selectedTheme]].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setTyped('');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameStarted(false);
    setGameEnded(false);
    setTypedChars(0);
    setWpm(0);
  }, [selectedTheme]);

  useEffect(() => {
    prepareGame();
    loadSound('typing.wav');
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('win.wav');
    
    // Detectar si es dispositivo móvil
    setIsMobile(isMobileDevice());
  }, [prepareGame]);

  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameEnded(true);
          playSound('win.wav');
          // WPM Calculation
          setWpm(Math.round((typedChars / 5) / (GAME_DURATION / 60)));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, typedChars]);

  const handleKeyPress = useCallback((key) => {
    if (gameEnded || wordCompleted) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const currentWord = words[currentIndex]?.word;
    if (!currentWord) return;

    if (key.length === 1 && key.match(/[a-z]/i)) {
      const nextChar = currentWord[typed.length];
      
      if (key.toLowerCase() === nextChar) {
        playSound('typing.wav');
        const newTyped = typed + key.toLowerCase();
        setTyped(newTyped);

        if (newTyped === currentWord) {
          playSound('correct.wav');
          setScore(prev => prev + 1);
          setTypedChars(prev => prev + currentWord.length);
          setWordCompleted(true);
          
          setTimeout(() => {
            setTyped('');
            setCurrentIndex(prev => (prev + 1) % words.length);
            setWordCompleted(false);
          }, 800);
        }
      } else {
        playSound('incorrect.wav');
        setIsWrong(true);
        setTimeout(() => setIsWrong(false), 300);
      }
    }
  }, [typed, currentIndex, gameEnded, wordCompleted, words, gameStarted]);

  const handleKeyDown = useCallback((e) => {
    if (isMobile) return; // No usar eventos de teclado en móviles
    handleKeyPress(e.key);
  }, [handleKeyPress, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isMobile]);

  const currentWord = words[currentIndex]?.word || '';
  const currentImage = words[currentIndex]?.image || '';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Guardar estadísticas en Supabase
  const saveStatsToDatabase = async () => {
    try {
      setSavingStats(true);
      const gameData = {
        game_type: 'typingGame',
        theme: selectedTheme,
        score: score,
        duration: GAME_DURATION - timeLeft,
        mistakes: typedChars - (score * 5), // aproximación: caracteres extra
        correct_answers: score,
        total_questions: words.length,
        difficulty: difficulty,
        player_name: 'Estudiante',
        wpm: wpm,
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

  // Guardar en Supabase cuando termina el juego
  useEffect(() => {
    if (gameEnded) {
      saveStatsToDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameEnded]);

  return (
    <div className="typing-game">
      <div className="typing-stats">
        <div className="stat-item"><span>Score</span><span>{score}</span></div>
        <div className="stat-item"><span>Time</span><span>{formatTime(timeLeft)}</span></div>
      </div>
      <div className="timer-bar-container">
        <motion.div 
          className="timer-bar"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="image-container"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -50 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
        >
          <img src={`/assets/images/${currentImage}`} alt="current" />
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className="typing-area"
        animate={{ x: isWrong ? [-10, 10, -5, 5, 0] : 0 }}
        transition={{ duration: 0.3 }}
      >
        {difficulty === 'easy' ? (
          <AnimatePresence>
            {currentWord.split('').map((char, idx) => {
              const isTyped = idx < typed.length;
              return (
                <motion.span
                  key={`${currentIndex}-${idx}`}
                  className={`letter ${isTyped ? 'typed' : 'pending'} ${wordCompleted ? 'completed' : ''}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0, scale: isTyped ? [1, 1.2, 1] : 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  {char}
                </motion.span>
              );
            })}
          </AnimatePresence>
        ) : (
          <span className="hidden-word">
            {currentWord.split('').map((char, idx) => (
              <span key={idx} className={`letter ${idx < typed.length ? 'typed' : 'pending'}`}>{idx < typed.length ? char : '_'}</span>
            ))}
          </span>
        )}
      </motion.div>

      {/* Mostrar teclado virtual solo en dispositivos móviles */}
      {isMobile && (
        <VirtualKeyboard 
          onKeyPress={handleKeyPress} 
          disabled={gameEnded || wordCompleted}
        />
      )}

      {/* Botón Back to Menu al final de todo */}
      <button className="menu-btn top-menu-btn" onClick={() => navigate('/')}>Back to Menu</button>

      <AnimatePresence>
        {gameEnded && (
          <motion.div className="game-over-modal">
            <div className="modal-content">
              <h2>⏰ Time's Up!</h2>
              <div className="final-stats">
                <div className="stat-row">
                  <span className="stat-label-final">Final Score:</span>
                  <span className="stat-value-final">{score}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-final">Words Per Minute:</span>
                  <span className="stat-value-final">{wpm}</span>
                </div>
                {savingStats && (
                  <div className="stat-row saving-stats">
                    <span className="stat-label-final">💾 Guardando estadísticas...</span>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <motion.button onClick={prepareGame} className="play-again-btn">
                  Play Again
                </motion.button>
                <motion.button onClick={() => navigate('/')} className="menu-btn">
                  Back to Menu
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
