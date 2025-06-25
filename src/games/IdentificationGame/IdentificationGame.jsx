import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSound, playSound } from '../../utils/soundManager';
import { gameStatsAPI } from '../../utils/supabase';
import './IdentificationGame.css';

const gameThemes = {
  bodyParts: {
    data: [
      { name: 'eye', image: 'eye.png' },
      { name: 'nose', image: 'nose.png' },
      { name: 'mouth', image: 'mouth.png' },
      { name: 'ear', image: 'ear.png' },
      { name: 'head', image: 'head.png' },
      { name: 'feet', image: 'feet.png' },
      { name: 'knee', image: 'knee.png' },
      { name: 'shoulder', image: 'shoulder.png' }
    ],
    questionPrompt: 'What is this?'
  },
  fruits: {
    data: [
      { name: 'apple', image: 'apple.png' },
      { name: 'banana', image: 'banana.png' },
      { name: 'cherry', image: 'cherry.png' },
      { name: 'grape', image: 'grape.png' },
      { name: 'kiwi', image: 'kiwi.png' },
      { name: 'lemon', image: 'lemon.png' },
      { name: 'mango', image: 'mango.png' },
      { name: 'orange', image: 'orange.png' },
      { name: 'peach', image: 'peach.png' },
      { name: 'pear', image: 'pear.png' },
      { name: 'pineapple', image: 'pineapple.png' }
    ],
    questionPrompt: 'What fruit is this?'
  },
  animals: {
    data: [
      { name: 'cat', image: 'cat.png' },
      { name: 'dog', image: 'dog.png' },
      { name: 'elephant', image: 'elephant.png' },
      { name: 'fish', image: 'fish.png' },
      { name: 'frog', image: 'frog.png' },
      { name: 'giraffe', image: 'giraffe.png' },
      { name: 'lion', image: 'lion.png' },
      { name: 'monkey', image: 'monkey.png' },
      { name: 'penguin', image: 'penguin.png' },
      { name: 'tiger', image: 'tiger.png' },
      { name: 'zebra', image: 'zebra.png' }
    ],
    questionPrompt: 'What animal is this?'
  },
  family: {
    data: [
      { name: 'aunt', image: 'aunt.png' },
      { name: 'brother', image: 'brother.png' },
      { name: 'father', image: 'father.png' },
      { name: 'grandma', image: 'grandma.png' },
      { name: 'grandpa', image: 'grandpa.png' },
      { name: 'mother', image: 'mother.png' },
      { name: 'sister', image: 'sister.png' },
      { name: 'uncle', image: 'uncle.png' }
    ],
    questionPrompt: 'Who is this?'
  }
};

export default function IdentificationGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'bodyParts';
  const { data, questionPrompt } = gameThemes[theme];

  const [question, setQuestion] = useState({ image: null, answer: '' });
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
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
    if (gameEnded) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameEnded(true);
          playSound('win.wav');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameEnded]);

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

    setTimeout(() => {
      if (!gameEnded) {
        generateQuestion();
      }
    }, 1200);
  };
  
  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(60);
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
        duration: 60 - timeLeft,
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
          animate={{ width: `${(timeLeft / 60) * 100}%` }}
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