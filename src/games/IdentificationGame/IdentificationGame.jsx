import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSound, playSound } from '../../utils/soundManager';
import { gameStatsAPI } from '../../utils/supabase';
import './IdentificationGame.css';

const gameThemes = {
  bodyParts: {
    data: [
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
    ],
    questionPrompt: 'What is this?'
  },
  fruits: {
    data: [
      { name: 'apple', image: 'apple.webp' },
      { name: 'banana', image: 'banana.webp' },
      { name: 'cherry', image: 'cherry.webp' },
      { name: 'grape', image: 'grape.webp' },
      { name: 'kiwi', image: 'kiwi.webp' },
      { name: 'lemon', image: 'lemon.webp' },
      { name: 'mango', image: 'mango.webp' },
      { name: 'orange', image: 'orange.webp' },
      { name: 'peach', image: 'peach.webp' },
      { name: 'pear', image: 'pear.webp' },
      { name: 'pineapple', image: 'pineapple.webp' },
      { name: 'blueberry', image: 'blueberry.webp' },
      { name: 'strawberry', image: 'strawberry.webp' },
      { name: 'watermelon', image: 'watermelon.webp' },
      { name: 'coconut', image: 'coconut.webp' },
      { name: 'rapsberry', image: 'rapsberry.webp' }
    ],
    questionPrompt: 'What fruit is this?'
  },
  animals: {
    data: [
      { name: 'cat', image: 'cat.webp' },
      { name: 'dog', image: 'dog.webp' },
      { name: 'elephant', image: 'elephant.webp' },
      { name: 'fish', image: 'fish.webp' },
      { name: 'frog', image: 'frog.webp' },
      { name: 'giraffe', image: 'giraffe.webp' },
      { name: 'lion', image: 'lion.webp' },
      { name: 'monkey', image: 'monkey.webp' },
      { name: 'penguin', image: 'penguin.webp' },
      { name: 'tiger', image: 'tiger.webp' },
      { name: 'zebra', image: 'zebra.webp' },
      { name: 'horse', image: 'horse.webp' },
      { name: 'cow', image: 'cow.webp' },
      { name: 'pig', image: 'pig.webp' },
      { name: 'fox', image: 'fox.webp' },
      { name: 'rabbit', image: 'rabbit.webp' },
      { name: 'duck', image: 'duck.webp' },
      { name: 'monkey2', image: 'monkey2.webp' }
    ],
    questionPrompt: 'What animal is this?'
  },
  family: {
    data: [
      { name: 'aunt', image: 'aunt.webp' },
      { name: 'brother', image: 'brother.webp' },
      { name: 'father', image: 'father.webp' },
      { name: 'grandma', image: 'grandma.webp' },
      { name: 'grandpa', image: 'grandpa.webp' },
      { name: 'mother', image: 'mother.webp' },
      { name: 'sister', image: 'sister.webp' },
      { name: 'uncle', image: 'uncle.webp' }
    ],
    questionPrompt: 'Who is this?'
  }
};

export default function IdentificationGame({
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval,
  setTimeoutFn = setTimeout,
  initialTime = 60,
  disableTimer = false,
  disableTimeouts = false
} = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'bodyParts';
  const { data, questionPrompt } = gameThemes[theme];

  const [question, setQuestion] = useState({ image: null, answer: '' });
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameEnded, setGameEnded] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, correct: false, selected: null });
  const [savingStats, setSavingStats] = useState(false);

  const generateQuestion = useCallback(() => {
    setFeedback({ show: false, correct: false, selected: null });

    const correctItem = data[Math.floor(Math.random() * data.length)];
    setQuestion({ image: correctItem.image, answer: correctItem.name });

    const choices = new Set([correctItem.name]);
    while (choices.size < 4) {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      choices.add(randomItem.name);
    }
    setOptions([...choices].sort(() => Math.random() - 0.5));
  }, [data]);

  useEffect(() => {
    generateQuestion();
    loadSound('correct.wav');
    loadSound('incorrect.wav');
    loadSound('win.wav');
  }, [generateQuestion]);

  useEffect(() => {
    if (disableTimer || gameEnded) return;
    const timer = setIntervalFn(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearIntervalFn(timer);
          setGameEnded(true);
          playSound('win.wav');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearIntervalFn(timer);
  }, [gameEnded, disableTimer]);

  const handleOptionClick = (selectedOption) => {
    if (feedback.show) return;

    const isCorrect = selectedOption === question.answer;
    setFeedback({ show: true, correct: isCorrect, selected: selectedOption });

    if (isCorrect) {
      playSound('correct.wav');
      setScore(prev => prev + 1);
    } else {
      playSound('incorrect.wav');
    }

    if (!disableTimeouts) {
      setTimeoutFn(() => {
        if (!gameEnded) {
          generateQuestion();
        }
      }, 1200);
    }
  };
  
  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(initialTime);
    setGameEnded(false);
    generateQuestion();
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Guardar estadísticas en Supabase
  const saveStatsToDatabase = async () => {
    try {
      setSavingStats(true);
      const gameData = {
        game_type: 'identificationGame',
        theme: theme,
        score: score,
        duration: initialTime - timeLeft,
        mistakes: null,
        correct_answers: score,
        total_questions: null,
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
    if (gameEnded) {
      saveStatsToDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameEnded]);

  return (
    <div className="identification-game">
      <div className="typing-stats"> {/* Reutilizamos clases de CSS */}
        <div className="stat-item"><span>Score</span><span>{score}</span></div>
        <div className="stat-item"><span>Time</span><span>{formatTime(timeLeft)}</span></div>
      </div>
      <div className="timer-bar-container">
        <motion.div 
          className="timer-bar"
          animate={{ width: `${(timeLeft / initialTime) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.answer}
          className="question-container-id"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <img src={`/assets/images/${question.image}`} alt={question.answer} className="item-image-id" />
          <h2 className="prompt-id">{questionPrompt}</h2>
        </motion.div>
      </AnimatePresence>

      <div className="options-container-id">
        {options.map((opt, i) => {
          const isSelected = feedback.selected === opt;
          const isCorrectAnswer = question.answer === opt;
          let buttonClass = 'option-button-id';
          if (feedback.show && isSelected) {
            buttonClass += feedback.correct ? ' correct' : ' incorrect';
          } else if (feedback.show && isCorrectAnswer) {
            buttonClass += ' correct-answer';
          } else if (feedback.show) {
            buttonClass += ' disabled';
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleOptionClick(opt)}
              className={buttonClass}
              disabled={feedback.show}
              whileHover={{ scale: feedback.show ? 1 : 1.05 }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {gameEnded && (
          <motion.div className="id-end-modal">
            <div className="modal-content">
              <h2>⏰ Time's Up!</h2>
              <div className="final-stats">
                <div className="stat-row">
                  <span className="stat-label-final">Final Score:</span>
                  <span className="stat-value-final">{score}</span>
                </div>
                {savingStats && (
                  <div className="stat-row saving-stats">
                    <span className="stat-label-final">💾 Guardando estadísticas...</span>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <motion.button onClick={handlePlayAgain} className="play-again-btn">
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