// src/games/MathGame/MathGame.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSound, playSound } from '../../utils/soundManager';
import { gameStatsAPI } from '../../utils/supabase';
import './MathGame.css';

const bodyParts = [ 
  { name: 'eye', image: 'eye.webp' },  
  { name: 'nose', image: 'nose.webp' },
  { name: 'mouth', image: 'mouth.webp' },
  { name: 'ear', image: 'ear.png' },
  { name: 'head', image: 'head.webp' },
  { name: 'feet', image: 'feet.webp' },
  { name: 'knee', image: 'knee.webp' },
  { name: 'shoulder', image: 'shoulder.webp' },
  { name: 'hand', image: 'hand.webp' },
  { name: 'leg', image: 'leg.webp' },
  { name: 'hair', image: 'hair.webp' },
  { name: 'heart', image: 'heart.webp' }
];

const numberWords = [
    'zero','one','two','three','four','five','six','seven','eight','nine','ten',
    'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'
];

export default function MathGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'math';
  const difficulty = params.get('difficulty') || 'easy';

  const [question, setQuestion] = useState({ text: '', image: null });
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [showEnd, setShowEnd] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState({ selected: null, correct: null });
  const timerRef = useRef(null);
  const [savingStats, setSavingStats] = useState(false);

  const generateQuestion = useCallback(() => {
    setIsAnswering(false);
    setFeedback({ selected: null, correct: null });

    if (theme === 'math') {
        // Definir los rangos según la dificultad
        let max = 10;
        if (difficulty === 'medium') max = 20;
        if (difficulty === 'hard') max = 50;

        let a, b, result, op, isSum;
        // Intentar hasta encontrar una operación válida
        do {
          isSum = Math.random() > 0.5;
          a = Math.floor(Math.random() * (max + 1));
          b = Math.floor(Math.random() * (max + 1));
          if (!isSum && a < b) [a, b] = [b, a]; // Para restas, a >= b
          result = isSum ? a + b : a - b;
        } while (
          a > max || b > max || result > max || result < 0
        );

        op = isSum ? '+' : '-';
        setQuestion({ text: `${a} ${op} ${b} = ?`, image: null });
        const correctAnswer = numberWords[result];
        setAnswer(correctAnswer);

        const choices = new Set([correctAnswer]);
        while(choices.size < 3) {
            const fakeNum = Math.floor(Math.random() * (max + 1));
            choices.add(numberWords[fakeNum]);
        }
        setOptions(shuffle([...choices]));
    } else {
        const correct = bodyParts[Math.floor(Math.random() * bodyParts.length)];
        setQuestion({ text: 'What is this?', image: correct.image });
        setAnswer(correct.name);
        
        const choices = new Set([correct.name]);
        while (choices.size < 3) {
            const fakePart = bodyParts[Math.floor(Math.random() * bodyParts.length)];
            choices.add(fakePart.name);
        }
        setOptions(shuffle([...choices]));
    }
  }, [theme, difficulty]);

  useEffect(() => {
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('alarm.wav');

    timerRef.current = setInterval(() => setTime(t => t - 1), 1000);
    generateQuestion();
    
    return () => clearInterval(timerRef.current);
  }, [generateQuestion]);

  useEffect(() => {
    if (time <= 0) {
      clearInterval(timerRef.current);
      playSound('alarm.wav');
      setShowEnd(true);
    }
  }, [time]);

  const handleOptionClick = (selectedOption) => {
    if (isAnswering) return;
    setIsAnswering(true);

    const isCorrect = selectedOption === answer;
    setFeedback({ selected: selectedOption, correct: isCorrect });

    if (isCorrect) {
      playSound('correct.wav');
      setScore(prev => prev + 1);
    } else {
      playSound('incorrect.wav');
    }

    setTimeout(() => {
      generateQuestion();
    }, 1200);
  };

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const restart = () => {
    setScore(0);
    setTime(60);
    setShowEnd(false);
    generateQuestion();
    timerRef.current = setInterval(() => setTime(t => t - 1), 1000);
  };

  // Guardar estadísticas en Supabase
  const saveStatsToDatabase = async () => {
    try {
      setSavingStats(true);
      const gameData = {
        game_type: 'mathGame',
        theme: theme,
        score: score,
        duration: 60 - time,
        mistakes: null, // No se cuenta explícitamente
        correct_answers: score,
        total_questions: null, // No se cuenta explícitamente
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

  useEffect(() => {
    if (showEnd) {
      saveStatsToDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEnd]);

  return (
    <div className="math-game">
        <div className="game-stats-math">
            <motion.h2>Time: <AnimatePresence mode="popLayout"><motion.span key={time}>{time}</motion.span></AnimatePresence></motion.h2>
            <div className="timer-bar-container-math">
                <motion.div 
                    className="timer-bar-math"
                    animate={{ width: `${(time / 60) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </div>
            <motion.h3>Score: <AnimatePresence mode="popLayout"><motion.span key={score}>{score}</motion.span></AnimatePresence></motion.h3>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={question.text}
                className="question-container-math"
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                {question.image ? (
                    <img src={`/assets/images/${question.image}`} alt="body part" className="body-img-math" />
                ) : (
                    <h1 className="math-question">{question.text}</h1>
                )}
            </motion.div>
        </AnimatePresence>

        <motion.div className="options-math">
            {options.map((opt, i) => {
                const isSelected = feedback.selected === opt;
                const isCorrectAnswer = answer === opt;

                let buttonClass = 'option-button-math';
                if (isAnswering && isSelected) {
                    buttonClass += feedback.correct ? ' correct' : ' incorrect';
                } else if (isAnswering && isCorrectAnswer) {
                    buttonClass += ' correct';
                } else if (isAnswering) {
                    buttonClass += ' disabled';
                }

                return (
                    <motion.button
                        key={i}
                        onClick={() => handleOptionClick(opt)}
                        className={buttonClass}
                        disabled={isAnswering}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: isAnswering ? 1 : 1.05 }}
                    >
                        {opt}
                    </motion.button>
                );
            })}
        </motion.div>
        
        <motion.div
            className="math-game-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <button onClick={() => navigate('/')} className="menu-btn-math">
                🏠 Back to Menu
            </button>
        </motion.div>

        <AnimatePresence>
            {showEnd && (
                <motion.div className="math-end-popup">
                    <h2>⏰ Time's Up!</h2>
                    <div className="final-stats-math">
                        <div className="stat-row-math">
                            <span className="stat-label-final">Final Score:</span>
                            <span className="stat-value-final">{score}</span>
                        </div>
                        {savingStats && (
                          <div className="stat-row-math saving-stats">
                            <span className="stat-label-final">💾 Guardando estadísticas...</span>
                          </div>
                        )}
                    </div>
                    <div className="end-screen-buttons-math">
                        <button onClick={restart}>Play Again</button>
                        <button onClick={() => navigate('/')}>Back to Menu</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
