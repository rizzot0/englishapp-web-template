import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  getProgressSummary, 
  getGameStats, 
  formatTime, 
  formatDate,
  clearProgress 
} from '../utils/progressManager';
import './Statistics.css';

const Statistics = () => {
  const [summary, setSummary] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setSummary(getProgressSummary());
  };

  const getGameDisplayName = (gameName) => {
    const names = {
      memoryGame: 'Memory Game',
      typingGame: 'Typing Game', 
      mathGame: 'Math Game',
      sortingGame: 'Sorting Game',
      soundMatchingGame: 'Sound Matching',
      identificationGame: 'Identification Game'
    };
    return names[gameName] || gameName;
  };

  const handleClearProgress = () => {
    clearProgress();
    loadStatistics();
    setShowConfirmClear(false);
  };

  if (!summary) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="statistics-page">
      <motion.div
        className="statistics-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="stats-header">
          <Link to="/" className="back-button">
            ← Volver al Menú
          </Link>
          <h1>📊 Mis Estadísticas</h1>
          <button 
            className="clear-button"
            onClick={() => setShowConfirmClear(true)}
          >
            🗑️ Limpiar Datos
          </button>
        </div>

        {/* Resumen General */}
        <motion.div 
          className="general-summary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2>🎯 Resumen General</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">🎮</div>
              <div className="summary-value">{summary.totalGames}</div>
              <div className="summary-label">Juegos Jugados</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⏱️</div>
              <div className="summary-value">{formatTime(summary.totalTime)}</div>
              <div className="summary-label">Tiempo Total</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🏆</div>
              <div className="summary-value">{summary.totalScore}</div>
              <div className="summary-label">Puntuación Total</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🔥</div>
              <div className="summary-value">{summary.streak}</div>
              <div className="summary-label">Días Seguidos</div>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas por Juego */}
        <motion.div 
          className="games-stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>🎮 Estadísticas por Juego</h2>
          <div className="games-grid">
            {Object.entries(summary.games).map(([gameName, gameStats]) => (
              <motion.div
                key={gameName}
                className="game-stats-card"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedGame(selectedGame === gameName ? null : gameName)}
              >
                <h3>{getGameDisplayName(gameName)}</h3>
                <div className="game-stats-summary">
                  <div className="stat-item">
                    <span className="stat-label">Juegos:</span>
                    <span className="stat-value">{gameStats.totalGames}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Mejor:</span>
                    <span className="stat-value">{gameStats.bestScore}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Promedio:</span>
                    <span className="stat-value">{gameStats.averageScore}</span>
                  </div>
                </div>
                {selectedGame === gameName && (
                  <motion.div
                    className="detailed-stats"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <DetailedGameStats gameName={gameName} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Juego Favorito */}
        {summary.favoriteGame && (
          <motion.div 
            className="favorite-game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2>❤️ Tu Juego Favorito</h2>
            <div className="favorite-game-card">
              <div className="favorite-icon">🎯</div>
              <h3>{getGameDisplayName(summary.favoriteGame)}</h3>
              <p>¡Has jugado este juego más que cualquier otro!</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Modal de confirmación para limpiar datos */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="confirm-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3>⚠️ ¿Estás seguro?</h3>
              <p>Esto eliminará todos tus datos de progreso y no se puede deshacer.</p>
              <div className="modal-buttons">
                <button onClick={handleClearProgress} className="confirm-btn">
                  Sí, eliminar todo
                </button>
                <button onClick={() => setShowConfirmClear(false)} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente para estadísticas detalladas de un juego
const DetailedGameStats = ({ gameName }) => {
  const [detailedStats, setDetailedStats] = useState({});

  useEffect(() => {
    // Aquí podrías cargar estadísticas más detalladas por tema
    const stats = {};
    const themes = ['fruits', 'animals', 'colors', 'shapes', 'emotions', 'family', 'bodyParts', 'days', 'months', 'seasons'];
    
    themes.forEach(theme => {
      const themeStats = getGameStats(gameName, theme);
      if (themeStats && themeStats.gamesPlayed > 0) {
        stats[theme] = themeStats;
      }
    });
    
    setDetailedStats(stats);
  }, [gameName]);

  const getThemeDisplayName = (theme) => {
    const names = {
      fruits: 'Frutas',
      animals: 'Animales', 
      colors: 'Colores',
      shapes: 'Formas',
      emotions: 'Emociones',
      family: 'Familia',
      bodyParts: 'Partes del Cuerpo',
      days: 'Días de la Semana',
      months: 'Meses del Año',
      seasons: 'Estaciones'
    };
    return names[theme] || theme;
  };

  return (
    <div className="detailed-stats-content">
      {Object.entries(detailedStats).map(([theme, stats]) => (
        <div key={theme} className="theme-stats">
          <h4>{getThemeDisplayName(theme)}</h4>
          <div className="theme-stats-grid">
            <div className="theme-stat">
              <span>Jugados: {stats.gamesPlayed}</span>
            </div>
            <div className="theme-stat">
              <span>Mejor: {stats.bestScore}</span>
            </div>
            <div className="theme-stat">
              <span>Promedio: {stats.averageScore}</span>
            </div>
            {stats.lastPlayed && (
              <div className="theme-stat">
                <span>Último: {formatDate(stats.lastPlayed)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Statistics; 