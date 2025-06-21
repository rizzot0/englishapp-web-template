// src/games/TypingGame/TypingGame.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TypingGame.css';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSound, playSound } from '../../utils/soundManager';

const wordSets = {
  fruits: [
    { word: 'apple', image: 'apple.png' },
    { word: 'banana', image: 'banana.png' },
    { word: 'grapes', image: 'grape.png' },
    { word: 'pear', image: 'pear.png' },
    { word: 'cherry', image: 'cherry.png' },
    { word: 'lemon', image: 'lemon.png' },
    { word: 'mango', image: 'mango.png' },
    { word: 'kiwi', image: 'kiwi.png' },
    { word: 'orange', image: 'orange.png' },
    { word: 'peach', image: 'peach.png' },
    { word: 'pineapple', image: 'pineapple.png' },
  ],
  animals: [
    { word: 'cat', image: 'cat.png' },
    { word: 'dog', image: 'dog.png' },
    { word: 'fish', image: 'fish.png' },
    { word: 'elephant', image: 'elephant.png' },
    { word: 'frog', image: 'frog.png' },
    { word: 'giraffe', image: 'giraffe.png' },
    { word: 'monkey', image: 'monkey.png' },
    { word: 'lion', image: 'lion.png' },
    { word: 'penguin', image: 'penguin.png' },
    { word: 'zebra', image: 'zebra.png' },
    { word: 'tiger', image: 'tiger.png' }
  ],
  family: [
    { word: 'mother', image: 'mother.png' },
    { word: 'father', image: 'father.png' },
    { word: 'brother', image: 'brother.png' },
    { word: 'sister', image: 'sister.png' },
    { word: 'grandma', image: 'grandmother.png' },
    { word: 'grandpa', image: 'grandfather.png' },
    { word: 'uncle', image: 'uncle.png' },
    { word: 'aunt', image: 'aunt.png' }
  ]
};

export default function TypingGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedTheme = params.get('theme') || 'fruits';

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60); 
  const [showEnd, setShowEnd] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [wordCompleted, setWordCompleted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Barajar las palabras al inicio
    setWords([...wordSets[selectedTheme]].sort(() => Math.random() - 0.5));
  }, [selectedTheme]);

  useEffect(() => {
    loadSound('typing.wav');
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('alarm.wav');
    loadSound('win.wav');

    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          playSound('alarm.wav');
          setShowEnd(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);
  
  const handleKeyDown = useCallback((e) => {
    if (time <= 0 || showEnd || wordCompleted) return;
  
    const currentWord = words[currentIndex]?.word;
    if (!currentWord) return;
  
    const { key } = e;
  
    // Solo procesar letras del alfabeto
    if (key.length === 1 && key.match(/[a-z]/i)) {
      const nextChar = currentWord[typed.length];
      
      if (key.toLowerCase() === nextChar) {
        playSound('typing.wav');
        const newTyped = typed + key.toLowerCase();
        setTyped(newTyped);
  
        if (newTyped === currentWord) {
          playSound('win.wav');
          setScore(prev => prev + 1);
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
  }, [typed, currentIndex, time, showEnd, wordCompleted, words]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentWord = words[currentIndex]?.word || '';
  const currentImage = words[currentIndex]?.image || '';

  return (
    <div className="typing-game">
      <div className="game-stats">
        <motion.h2>
          Tiempo: <AnimatePresence mode="popLayout"><motion.span key={time} initial={{ scale: 1.5, opacity: 0}} animate={{ scale: 1, opacity: 1}} exit={{ scale: 0.5, opacity: 0}} transition={{ duration: 0.3 }}>{time}</motion.span></AnimatePresence>
        </motion.h2>
        <div className="timer-bar-container">
          <motion.div 
            className="timer-bar"
            initial={{ width: "100%" }}
            animate={{ width: `${(time / 60) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        <motion.h3>
          Puntaje: <AnimatePresence mode="popLayout"><motion.span key={score} initial={{ scale: 1.5, opacity: 0}} animate={{ scale: 1, opacity: 1}} exit={{ scale: 0.5, opacity: 0}} transition={{ duration: 0.3, type: "spring" }}>{score}</motion.span></AnimatePresence>
        </motion.h3>
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
        <AnimatePresence>
          {currentWord.split('').map((char, idx) => {
            const isTyped = idx < typed.length;
            const isCorrect = isTyped && typed[idx] === char;
            
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
      </motion.div>

      <AnimatePresence>
        {showEnd && (
          <motion.div
            className="typing-end-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="typing-end-popup"
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              transition={{ duration: 0.4, type: 'spring' }}
            >
              <h2>⏰ ¡Tiempo terminado!</h2>
              <h3>Tu puntaje final fue: {score}</h3>
              <button onClick={() => navigate('/')}>🏠 Volver al Menú</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
