// src/utils/progressManager.js

// Estructura de datos para el progreso
const PROGRESS_KEY = 'englishAppProgress';

// Inicializar estructura de progreso
const initializeProgress = () => {
  const defaultProgress = {
    games: {
      memoryGame: {},
      typingGame: {},
      mathGame: {},
      sortingGame: {},
      soundMatchingGame: {},
      identificationGame: {}
    },
    statistics: {
      totalGamesPlayed: 0,
      totalTimePlayed: 0,
      totalScore: 0,
      favoriteGame: null,
      lastPlayed: null,
      streak: 0,
      lastPlayDate: null
    }
  };

  if (!localStorage.getItem(PROGRESS_KEY)) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(defaultProgress));
  }
};

// Obtener progreso completo
export const getProgress = () => {
  initializeProgress();
  return JSON.parse(localStorage.getItem(PROGRESS_KEY));
};

// Guardar puntuación de un juego
export const saveGameScore = (gameName, theme, score, time, additionalData = {}) => {
  const progress = getProgress();
  
  if (!progress.games[gameName]) {
    progress.games[gameName] = {};
  }
  
  if (!progress.games[gameName][theme]) {
    progress.games[gameName][theme] = {
      bestScore: 0,
      bestTime: null,
      gamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      lastPlayed: null,
      history: []
    };
  }

  const gameData = progress.games[gameName][theme];
  
  // Actualizar estadísticas
  gameData.gamesPlayed += 1;
  gameData.totalScore += score;
  gameData.averageScore = Math.round(gameData.totalScore / gameData.gamesPlayed);
  gameData.lastPlayed = new Date().toISOString();
  
  // Guardar en historial (últimos 10 juegos)
  gameData.history.push({
    score,
    time,
    date: new Date().toISOString(),
    ...additionalData
  });
  
  if (gameData.history.length > 10) {
    gameData.history.shift();
  }

  // Actualizar mejor puntuación
  if (score > gameData.bestScore) {
    gameData.bestScore = score;
    gameData.bestTime = time;
  }

  // Actualizar estadísticas globales
  progress.statistics.totalGamesPlayed += 1;
  progress.statistics.totalTimePlayed += time;
  progress.statistics.totalScore += score;
  progress.statistics.lastPlayed = new Date().toISOString();
  
  // Actualizar juego favorito
  const gameCounts = {};
  Object.keys(progress.games).forEach(game => {
    Object.keys(progress.games[game]).forEach(theme => {
      gameCounts[game] = (gameCounts[game] || 0) + progress.games[game][theme].gamesPlayed;
    });
  });
  
  const favoriteGame = Object.keys(gameCounts).reduce((a, b) => 
    gameCounts[a] > gameCounts[b] ? a : b
  );
  progress.statistics.favoriteGame = favoriteGame;

  // Actualizar streak
  const today = new Date().toDateString();
  if (progress.statistics.lastPlayDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (progress.statistics.lastPlayDate === yesterdayStr) {
      progress.statistics.streak += 1;
    } else if (progress.statistics.lastPlayDate !== today) {
      progress.statistics.streak = 1;
    }
    progress.statistics.lastPlayDate = today;
  }

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
};

// Obtener estadísticas de un juego específico
export const getGameStats = (gameName, theme) => {
  const progress = getProgress();
  return progress.games[gameName]?.[theme] || null;
};

// Obtener estadísticas globales
export const getGlobalStats = () => {
  const progress = getProgress();
  return progress.statistics;
};

// Obtener resumen de progreso
export const getProgressSummary = () => {
  const progress = getProgress();
  const summary = {
    totalGames: progress.statistics.totalGamesPlayed,
    totalTime: progress.statistics.totalTimePlayed,
    totalScore: progress.statistics.totalScore,
    favoriteGame: progress.statistics.favoriteGame,
    streak: progress.statistics.streak,
    games: {}
  };

  // Resumen por juego
  Object.keys(progress.games).forEach(gameName => {
    const gameData = progress.games[gameName];
    const themes = Object.keys(gameData);
    
    summary.games[gameName] = {
      totalGames: themes.reduce((sum, theme) => sum + gameData[theme].gamesPlayed, 0),
      bestScore: Math.max(...themes.map(theme => gameData[theme].bestScore || 0)),
      averageScore: Math.round(
        themes.reduce((sum, theme) => sum + gameData[theme].totalScore, 0) /
        themes.reduce((sum, theme) => sum + gameData[theme].gamesPlayed, 0)
      ) || 0
    };
  });

  return summary;
};

// Limpiar progreso (para testing)
export const clearProgress = () => {
  localStorage.removeItem(PROGRESS_KEY);
  initializeProgress();
};

// Exportar funciones de utilidad
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 