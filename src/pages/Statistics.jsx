import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getProgressSummary, 
  getGameStats, 
  formatTime, 
  formatDate,
  clearProgress 
} from '../utils/progressManager';
import { gameStatsAPI } from '../utils/supabase';
import './Statistics.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaUserLock } from 'react-icons/fa';

const Statistics = () => {
  const [summary, setSummary] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState([]);
  const [viewMode, setViewMode] = useState('local'); // 'local' o 'database'
  const statsRef = React.useRef();
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
    loadDatabaseStats();
  }, []);

  const loadStatistics = () => {
    setSummary(getProgressSummary());
    setLoading(false);
  };

  const loadDatabaseStats = async () => {
    try {
      const result = await gameStatsAPI.getAllStats(100);
      if (result.success) {
        setDbStats(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando estadísticas de la base de datos:', error);
    }
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

  const getDatabaseSummary = () => {
    if (!dbStats || !dbStats.length) return null;

    const totalGames = dbStats.length;
    const totalScore = dbStats.reduce((sum, stat) => sum + (stat.score || 0), 0);
    const totalTime = dbStats.reduce((sum, stat) => sum + (stat.duration || 0), 0);
    
    // Agrupar por tipo de juego
    const gamesByType = dbStats.reduce((acc, stat) => {
      const gameType = stat.game_type;
      if (!acc[gameType]) {
        acc[gameType] = {
          totalGames: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          totalTime: 0
        };
      }
      acc[gameType].totalGames++;
      acc[gameType].totalScore += stat.score || 0;
      acc[gameType].bestScore = Math.max(acc[gameType].bestScore, stat.score || 0);
      acc[gameType].totalTime += stat.duration || 0;
      return acc;
    }, {});

    // Calcular promedios
    Object.keys(gamesByType).forEach(gameType => {
      gamesByType[gameType].averageScore = Math.round(
        gamesByType[gameType].totalScore / gamesByType[gameType].totalGames
      );
    });

    return {
      totalGames,
      totalScore,
      totalTime,
      games: gamesByType
    };
  };

  const currentSummary = viewMode === 'database' ? getDatabaseSummary() : summary;

  // Verificar si hay datos válidos
  const hasValidData = currentSummary && 
    ((viewMode === 'local' && currentSummary.games && Object.keys(currentSummary.games).length > 0) ||
     (viewMode === 'database' && dbStats && dbStats.length > 0));

  // Función para exportar a PDF
  const handleExportPDF = async () => {
    if (!statsRef.current) return;
    const element = statsRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Ajustar la imagen al ancho de la página
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('estadisticas.pdf');
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  if (!hasValidData) {
    return (
      <div className="statistics-page">
        <div className="no-data">
          <h2>📊 No hay datos disponibles</h2>
          <p>¡Juega algunos juegos para ver tus estadísticas!</p>
          <Link to="/" className="back-button">← Volver al Menú</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <motion.div
        className="statistics-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        ref={statsRef}
      >
        {/* Header */}
        <div className="stats-header">
          <Link to="/" className="back-button">
            ← Volver al Menú
          </Link>
          <h1>📊 Mis Estadísticas</h1>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'local' ? 'active' : ''}`}
              onClick={() => setViewMode('local')}
            >
              📱 Local
            </button>
            <button 
              className={`view-btn ${viewMode === 'database' ? 'active' : ''}`}
              onClick={() => setViewMode('database')}
            >
              ☁️ Base de Datos
            </button>
          </div>
          <button
            className="view-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#7eaaff', color: 'white', fontWeight: 700 }}
            onClick={() => navigate('/teacher-panel')}
          >
            <FaUserLock /> Panel del Profesor
          </button>
          <button className="export-pdf-btn" onClick={handleExportPDF}>
            📄 Exportar a PDF
          </button>
          {viewMode === 'local' && (
            <button 
              className="clear-button"
              onClick={() => setShowConfirmClear(true)}
            >
              🗑️ Limpiar Datos
            </button>
          )}
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
              <div className="summary-value">{currentSummary.totalGames}</div>
              <div className="summary-label">Juegos Jugados</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⏱️</div>
              <div className="summary-value">{formatTime(currentSummary.totalTime)}</div>
              <div className="summary-label">Tiempo Total</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🏆</div>
              <div className="summary-value">{currentSummary.totalScore}</div>
              <div className="summary-label">Puntuación Total</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-value">
                {currentSummary.totalGames > 0 
                  ? Math.round(currentSummary.totalScore / currentSummary.totalGames) 
                  : 0}
              </div>
              <div className="summary-label">Promedio</div>
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
            {Object.entries(currentSummary.games || {}).map(([gameName, gameStats]) => {
              const { avgMistakes, avgWpm, avgAccuracy } = getExtraMetrics(gameName, dbStats);
              return (
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
                  {/* Métricas extra */}
                  {gameName === 'typingGame' && (
                    <div className="extra-metric">
                      <span>Avg. WPM: {avgWpm}</span>
                    </div>
                  )}
                  {gameName === 'memoryGame' && (
                    <div className="extra-metric">
                      <span>Avg. Accuracy: {avgAccuracy}%</span>
                    </div>
                  )}
                  {avgMistakes !== 'N/A' && (
                    <div className="extra-metric">
                      <span>Avg. Mistakes: {avgMistakes}</span>
                    </div>
                  )}
                  {selectedGame === gameName && (
                    <motion.div
                      className="detailed-stats"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <DetailedGameStats 
                        gameName={gameName} 
                        viewMode={viewMode}
                        dbStats={dbStats}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mejores Puntuaciones (solo en modo base de datos) */}
        {viewMode === 'database' && dbStats.length > 0 && (
          <motion.div 
            className="top-scores-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2>🏆 Mejores Puntuaciones</h2>
            <div className="top-scores-grid">
              {dbStats
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 10)
                .map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    className="top-score-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="rank">#{index + 1}</div>
                    <div className="score-info">
                      <div className="game-name">{getGameDisplayName(stat.game_type)}</div>
                      <div className="score">{stat.score || 0} pts</div>
                      <div className="date">{formatDate(stat.created_at)}</div>
                    </div>
                  </motion.div>
                ))}
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
              <p>Esto eliminará todos tus datos de progreso local y no se puede deshacer.</p>
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
const DetailedGameStats = ({ gameName, viewMode, dbStats }) => {
  const [detailedStats, setDetailedStats] = useState({});

  useEffect(() => {
    if (viewMode === 'local') {
      // Estadísticas locales por tema
      const stats = {};
      const themes = ['fruits', 'animals', 'colors', 'shapes', 'emotions', 'family', 'bodyParts', 'days', 'months', 'seasons'];
      
      themes.forEach(theme => {
        const themeStats = getGameStats(gameName, theme);
        if (themeStats && themeStats.gamesPlayed > 0) {
          stats[theme] = themeStats;
        }
      });
      
      setDetailedStats(stats);
    } else {
      // Estadísticas de base de datos por tema
      const gameStats = dbStats.filter(stat => stat.game_type === gameName);
      const stats = {};
      
      gameStats.forEach(stat => {
        const theme = stat.theme || 'general';
        if (!stats[theme]) {
          stats[theme] = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            averageScore: 0
          };
        }
        stats[theme].gamesPlayed++;
        stats[theme].totalScore += stat.score || 0;
        stats[theme].bestScore = Math.max(stats[theme].bestScore, stat.score || 0);
      });

      // Calcular promedios
      Object.keys(stats).forEach(theme => {
        stats[theme].averageScore = Math.round(
          stats[theme].totalScore / stats[theme].gamesPlayed
        );
      });
      
      setDetailedStats(stats);
    }
  }, [gameName, viewMode, dbStats]);

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
      seasons: 'Estaciones',
      general: 'General'
    };
    return names[theme] || theme;
  };

  return (
    <div className="detailed-stats-content">
      {Object.entries(detailedStats || {}).map(([theme, stats]) => (
        <div key={theme} className="theme-stats">
          <h4>{getThemeDisplayName(theme)}</h4>
          <div className="theme-stats-grid">
            <div className="theme-stat">
              <span>Jugados: {stats.gamesPlayed || 0}</span>
            </div>
            <div className="theme-stat">
              <span>Mejor: {stats.bestScore || 0}</span>
            </div>
            <div className="theme-stat">
              <span>Promedio: {stats.averageScore || 0}</span>
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

// Agregar función para calcular métricas extra por juego
const getExtraMetrics = (gameType, dbStats) => {
  if (!dbStats || !Array.isArray(dbStats)) {
    return { avgMistakes: 'N/A', avgWpm: 'N/A', avgAccuracy: 'N/A' };
  }

  const stats = dbStats.filter(stat => stat.game_type === gameType);

  // Promedio de errores
  const avgMistakes = stats.length
    ? (stats.reduce((sum, stat) => sum + (stat.mistakes || 0), 0) / stats.length).toFixed(2)
    : 'N/A';

  // Promedio de WPM (solo TypingGame)
  const wpmStats = stats.filter(stat => stat.wpm !== null && stat.wpm !== undefined);
  const avgWpm = wpmStats.length && gameType === 'typingGame'
    ? (wpmStats.reduce((sum, stat) => sum + (stat.wpm || 0), 0) / wpmStats.length).toFixed(2)
    : 'N/A';

  // Promedio de Accuracy (solo MemoryGame)
  const accStats = stats.filter(stat => stat.accuracy !== null && stat.accuracy !== undefined);
  const avgAccuracy = accStats.length && gameType === 'memoryGame'
    ? (accStats.reduce((sum, stat) => sum + (stat.accuracy || 0), 0) / accStats.length).toFixed(2)
    : 'N/A';

  return { avgMistakes, avgWpm, avgAccuracy };
};

export default Statistics; 