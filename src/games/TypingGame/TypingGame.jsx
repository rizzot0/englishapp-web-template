// src/games/TypingGame/TypingGame.jsx
import React, { useEffect, useState, useRef } from 'react';
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

  const words = wordSets[selectedTheme] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60); 
  const [showEnd, setShowEnd] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadSound('typing.wav');
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('alarm.wav');

    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          playSound('alarm.wav');
          setShowEnd(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (time <= 0 || showEnd) return;

      const currentWord = words[currentIndex].word;
      const nextChar = currentWord[typed.length];

      if (e.key === nextChar) {
        playSound('typing.wav');

        const newTyped = typed + e.key;
        setTyped(newTyped);

        if (newTyped === currentWord) {
          playSound('correct.wav');
          setScore(prev => prev + 1);
          setTimeout(() => {
            setTyped('');
            setCurrentIndex((prev) => (prev + 1) % words.length);
          }, 300);
        }
      } else {
        playSound('incorrect.wav');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typed, currentIndex, time, showEnd]);

  const currentWord = words[currentIndex]?.word || '';
  const currentImage = words[currentIndex]?.image || '';

  return (
    <div className="typing-game">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Tiempo: {time}
      </motion.h2>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Puntaje: {score}
      </motion.h3>

      <motion.div
        className="image-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <img src={`/assets/images/${currentImage}`} alt="current" />
      </motion.div>

      <div className="typing-area">
        {currentWord.split('').map((char, idx) => (
          <motion.span
            key={idx}
            className={idx < typed.length ? 'typed' : 'pending'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            {idx < typed.length ? typed[idx] : '_'}
          </motion.span>
        ))}
      </div>
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2>⏰ Tiempo terminado</h2>
        <h3>Tu puntaje fue: {score}</h3>
        <button onClick={() => navigate('/')}>Volver al menú</button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
