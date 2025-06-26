import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import './SoundMatchingGame.css';
import { loadSound, playSound } from '../../utils/soundManager';
import { speak } from '../../utils/speechSynthesis';
import { gameStatsAPI } from '../../utils/supabase';

// Cambiamos el nombre para que sea más genérico
const themeData = {
  animals: [
    { name: 'dog', image: 'dog.webp' },
    { name: 'cat', image: 'cat.webp' },
    { name: 'lion', image: 'lion.webp' },
    { name: 'zebra', image: 'zebra.webp' },
    { name: 'frog', image: 'frog.webp' },
    { name: 'monkey', image: 'monkey.webp' },
    { name: 'elephant', image: 'elephant.webp' },
    { name: 'penguin', image: 'penguin.webp' },
    { name: 'tiger', image: 'tiger.webp' },
    { name: 'giraffe', image: 'giraffe.webp' },
    { name: 'fox', image: 'fox.webp' },
    { name: 'rabbit', image: 'rabbit.webp' },
    { name: 'horse', image: 'horse.webp' },
    { name: 'cow', image: 'cow.webp' },
    { name: 'pig', image: 'pig.webp' },
    { name: 'duck', image: 'duck.webp' },
    { name: 'monkey2', image: 'monkey2.webp' }
  ],
  objects: [
    { name: 'circle', image: 'circle.webp' },
    { name: 'square', image: 'square.webp' },
    { name: 'star', image: 'star.webp' },
    { name: 'triangle', image: 'triangle.webp' },
    { name: 'rectangle', image: 'rectangle.webp' }
  ],
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
  const [timer, setTimer] = useState(60);
  const [savingStats, setSavingStats] = useState(false);

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
    const currentThemeData = themeData[theme];
    if (currentThemeData.length === 0) return;

    // 1. Elegir una respuesta correcta
    const correctItem = currentThemeData[Math.floor(Math.random() * currentThemeData.length)];
    setQuestion(correctItem);

    // 2. Crear opciones (1 correcta, 2 o 3 incorrectas)
    const distractors = currentThemeData.filter(item => item.name !== correctItem.name);
    const numOptions = Math.min(currentThemeData.length, 4); // Máximo 4 opciones
    const numDistractors = numOptions - 1;
    
    const shuffledDistractors = shuffle(distractors).slice(0, numDistractors);
    const allOptions = shuffle([correctItem, ...shuffledDistractors]);
    setOptions(allOptions);

    // Precargar sonidos de feedback
    loadSound('correct.wav');
    loadSound('incorrect.wav');
  }, [theme, gameEnded]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);
  
  const playQuestionSound = () => {
    if (!question || gameEnded) return;

    // Usamos síntesis de voz para todos los temas que no tengan un 'sound' explícito
    if (theme === 'objects' || theme === 'animals') {
      speak(question.name);
    } else if (question.sound) { // Mantenemos la lógica por si añadimos temas con sonidos personalizados
      const sound = new Howl({
        src: [`/assets/sounds/${question.sound}`],
        html5: true
      });
      sound.play();
    }
  };

  const handleOptionClick = (selectedItem) => {
    if (feedback.show || gameEnded) return;

    const isCorrect = selectedItem.name === question.name;
    setFeedback({ show: true, correct: isCorrect, selected: selectedItem.name });
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
  
  // Guardar estadísticas en Supabase
  const saveStatsToDatabase = async () => {
    try {
      setSavingStats(true);
      const gameData = {
        game_type: 'soundMatchingGame',
        theme: theme,
        score: score,
        duration: GAME_DURATION - timeLeft,
        mistakes: null,
        correct_answers: score,
        total_questions: questionsAnswered,
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
                <img src="/assets/images/icon_soundmatching.webp" alt="Play Sound" style={{width: '60px', height: '60px'}} />
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
          <motion.div className="sound-end-modal">
            <div className="modal-content">
              <h2>⏰ Time's Up!</h2>
              <div className="final-stats">
                <div className="stat-row">
                  <span className="stat-label-final">Final Score:</span>
                  <span className="stat-value-final">{score}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label-final">Questions:</span>
                  <span className="stat-value-final">{questionsAnswered}</span>
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
                <motion.button onClick={handleBackToMenu} className="menu-btn">
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