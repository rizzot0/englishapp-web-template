// src/games/MathGame/MathGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSound, playSound } from '../../utils/soundManager';
import './MathGame.css';


const bodyParts = [ 
  { name: 'eye', image: 'eye.png' },  
  { name: 'nose', image: 'nose.png' },
  { name: 'mouth', image: 'mouth.png' },
  { name: 'ear', image: 'ear.png' },
  { name: 'head', image: 'head.png' },
  { name: 'feet', image: 'feet.png' },
  { name: 'knee', image: 'knee.png' },
  { name: 'shoulder', image: 'shoulder.png' }
];

export default function MathGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'math';

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [showEnd, setShowEnd] = useState(false);
  const timerRef = useRef(null);

  const [clickedIndex, setClickedIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {

     // Cargar efectos de sonido
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('alarm.wav');

    startTimer();
    generateQuestion();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (time <= 0) {
      clearInterval(timerRef.current);
      playSound('alarm.wav');
      setShowEnd(true);
    }
  }, [time]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTime(prev => prev - 1);
    }, 1000);
  };

  const generateQuestion = () => {
    if (theme === 'math') {
      let a, b, result, op, isSum;
      do {
        a = Math.floor(Math.random() * 21);
        b = Math.floor(Math.random() * 21);
        isSum = Math.random() > 0.5;
        result = isSum ? a + b : a - b;
      } while (result > 20 || result < 0);

      op = isSum ? '+' : '-';
      setQuestion(`${a} ${op} ${b} = ?`);
      setAnswer(result.toString());

      const fake1 = Math.min(20, result + Math.floor(Math.random() * 5 + 1));
      let fake2 = Math.max(result - Math.floor(Math.random() * 5 + 1), 0);
      if (fake1 === result || fake2 === result || fake1 === fake2) {
        fake2 = Math.max(0, (result + 3) % 21);
      }

      const choices = shuffle([result, fake1, fake2]).map(n => numberToWord(n));
      setOptions(choices);
    } else {
      const correct = bodyParts[Math.floor(Math.random() * bodyParts.length)];
      const others = bodyParts.filter(p => p.name !== correct.name);
      const fake1 = others[Math.floor(Math.random() * others.length)];
      const fake2 = others[Math.floor(Math.random() * others.length)];
      setImage(correct.image);
      setAnswer(correct.name);
      setOptions(shuffle([correct.name, fake1.name, fake2.name]));
    }
  };

const handleOptionClick = (selected, index) => {
  const correct = selected === answer || selected === numberToWord(answer);
  setClickedIndex(index);
  setIsCorrect(correct);

  if (correct) {
    playSound('correct.wav');
    setScore(prev => prev + 1);
  } else {
    playSound('incorrect.wav');
  }

  // Espera 600ms para mostrar la animación antes de avanzar
  setTimeout(() => {
    setClickedIndex(null);
    setIsCorrect(null);
    generateQuestion();
  }, 600);
};


  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const numberToWord = (n) => {
    const words = [
      'zero','one','two','three','four','five','six','seven','eight','nine','ten',
      'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'
    ];
    return words[n] || n.toString();
  };

  const restart = () => {
    setScore(0);
    setTime(60);
    setShowEnd(false);
    generateQuestion();
    startTimer();
  };

  return (
    <div className="math-game">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Time: {time}
      </motion.h2>
      <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Score: {score}
      </motion.h3>

      <motion.div
        className="question-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {theme === 'math' ? (
          <h1 className="math-question">{question}</h1>
        ) : (
          <img src={`/assets/images/${image}`} alt="part" className="body-img" />
        )}
      </motion.div>

      <motion.div className="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        {options.map((opt, i) => {
          const isSelected = i === clickedIndex;
          return (
            <motion.button
              key={i}
              onClick={() => handleOptionClick(opt, i)}
              className={`option-button ${isSelected && isCorrect === true ? 'correct' : ''} ${isSelected && isCorrect === false ? 'incorrect' : ''}`}
              animate={isSelected && isCorrect === true ? { scale: [1, 1.2, 1] } :
                      isSelected && isCorrect === false ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {opt}
            </motion.button>
          );
        })}
      </motion.div>
      <AnimatePresence>
        {showEnd && (
          <motion.div
            className="end-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="end-modal">
              <h2>🎉 ¡Tiempo terminado!</h2>
              <h3>Tu puntaje fue: {score}</h3>
              <button onClick={restart}>Reiniciar</button>
              <button onClick={() => navigate('/')}>Volver al Menú</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
