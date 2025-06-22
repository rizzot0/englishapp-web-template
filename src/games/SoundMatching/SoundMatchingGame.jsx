import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import './SoundMatchingGame.css';
import { loadSound, playSound } from '../../utils/soundManager';

// En un futuro, estos datos vendrán de un archivo o API.
// Por ahora, usamos sonidos existentes como placeholder.
const animalData = {
  animals: [
    { name: 'dog', image: 'dog.png', sound: 'correct.wav' },
    { name: 'cat', image: 'cat.png', sound: 'incorrect.wav' },
    { name: 'lion', image: 'lion.png', sound: 'win.wav' },
    { name: 'zebra', image: 'zebra.png', sound: 'alarm.wav' },
    { name: 'frog', image: 'frog.png', sound: 'ding.wav' },
    { name: 'monkey', image: 'monkey.png', sound: 'positive.wav' },
  ],
  objects: [], // Para futura expansión
};

const GAME_DURATION = 60; // 60 segundos

export default function SoundMatchingGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') || 'animals';

  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, correct: false, selected: null });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameEnded, setGameEnded] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Temporizador
  useEffect(() => {
    if (gameEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameEnded(true);
          playSound('win.wav');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameEnded]);

  const generateQuestion = useCallback(() => {
    if (gameEnded) return;
    
    setFeedback({ show: false, correct: false, selected: null });
    const themeData = animalData[theme];
    if (themeData.length === 0) return;

    // 1. Elegir una respuesta correcta
    const correctAnimal = themeData[Math.floor(Math.random() * themeData.length)];
    setQuestion(correctAnimal);

    // 2. Crear opciones (1 correcta, 2 incorrectas)
    const distractors = themeData.filter(animal => animal.name !== correctAnimal.name);
    const shuffledDistractors = shuffle(distractors).slice(0, 2);
    const allOptions = shuffle([correctAnimal, ...shuffledDistractors]);
    setOptions(allOptions);

    // Precargar sonidos de feedback
    loadSound('correct.wav');
    loadSound('incorrect.wav');
  }, [theme, gameEnded]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);
  
  const playQuestionSound = () => {
    if (question && question.sound && !gameEnded) {
      const sound = new Howl({
        src: [`/assets/sounds/${question.sound}`]
      });
      sound.play();
    }
  };

  const handleOptionClick = (selectedAnimal) => {
    if (feedback.show || gameEnded) return;

    const isCorrect = selectedAnimal.name === question.name;
    setFeedback({ show: true, correct: isCorrect, selected: selectedAnimal.name });
    setQuestionsAnswered(prev => prev + 1);

    if (isCorrect) {
      playSound('correct.wav');
      setScore(s => s + 1);
    } else {
      playSound('incorrect.wav');
    }

    setTimeout(() => {
      if (!gameEnded) {
        generateQuestion();
      }
    }, 1500);
  };

  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameEnded(false);
    setQuestionsAnswered(0);
    setFeedback({ show: false, correct: false, selected: null });
    generateQuestion();
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeProgress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;
  
  if (!question && !gameEnded) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="sound-matching-game">
      {/* Barra de estadísticas */}
      <div className="game-stats-sound">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className={`stat-value ${timeLeft <= 10 ? 'time-warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Questions:</span>
          <span className="stat-value">{questionsAnswered}</span>
        </div>
      </div>

      {/* Barra de progreso del tiempo */}
      <div className="time-progress-container">
        <div className="time-progress-bar">
          <motion.div 
            className="time-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {!gameEnded && (
        <>
          <div className="sound-prompt">
            <motion.button 
                onClick={playQuestionSound} 
                className="play-sound-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
              🔊 Play Sound
            </motion.button>
            <p>Listen and choose the correct picture!</p>
          </div>

          <div className="image-options">
            {options.map(option => (
              <motion.div
                key={option.name}
                className={`image-option-card ${feedback.show && (feedback.selected === option.name ? (feedback.correct ? 'correct' : 'incorrect') : '')} ${feedback.show && feedback.selected !== option.name ? 'disabled' : ''}`}
                onClick={() => handleOptionClick(option)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: feedback.show ? 1 : 1.05 }}
              >
                <img src={`/assets/images/${option.image}`} alt={option.name} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {gameEnded && (
          <motion.div 
            className="game-over-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <div className="modal-content">
              <h2>🎉 Game Over! 🎉</h2>
              
              <div className="final-stats">
                <div className="stat-row">
                  <span className="stat-label-final">Final Score:</span>
                  <span className="stat-value-final final-score">{score}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-final">Questions Answered:</span>
                  <span className="stat-value-final">{questionsAnswered}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-final">Accuracy:</span>
                  <span className="stat-value-final">{questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0}%</span>
                </div>
              </div>

              <div className="modal-buttons">
                <motion.button
                  onClick={handlePlayAgain}
                  className="play-again-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎮 Play Again
                </motion.button>
                <motion.button
                  onClick={handleBackToMenu}
                  className="menu-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏠 Back to Menu
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}   