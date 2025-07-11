// src/utils/progressManager.js

// Estructura de datos para el progreso
const PROGRESS_KEY = 'englishAppProgress';

// Estructura de progreso por defecto
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

// Inicializar estructura de progreso
const initializeProgress = () => {
  if (!localStorage.getItem(PROGRESS_KEY)) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(defaultProgress));
  }
};

// Obtener progreso completo
export const getProgress = () => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) {
      // Devolver estructura por defecto si no hay datos
      return JSON.parse(JSON.stringify(defaultProgress));
    }
    return JSON.parse(data);
  } catch (e) {
    // Si hay error, devolver estructura por defecto
    return JSON.parse(JSON.stringify(defaultProgress));
  }
};

// Guardar puntuación de un juego
export const saveGameScore = (gameName, theme, score, time, additionalData = {}) => {
  const progress = getProgress();

  // Crear estructura de juegos si no existe
  if (!progress.games) progress.games = {};
  if (!progress.games[gameName]) progress.games[gameName] = {};
  if (!progress.games[gameName][theme]) {
    progress.games[gameName][theme] = {
      bestScore: -Infinity,
      bestTime: null,
      gamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      lastPlayed: null,
      history: []
    };
  }

  // Crear estructura de estadísticas si no existe
  if (!progress.statistics) {
    progress.statistics = {
      totalGamesPlayed: 0,
      totalTimePlayed: 0,
      totalScore: 0,
      favoriteGame: null,
      lastPlayed: null,
      streak: 0,
      lastPlayDate: null
    };
  }

  const gameData = progress.games[gameName][theme];

  // Actualizar estadísticas del juego
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
    gameData.history = gameData.history.slice(-10);
  }

  // Actualizar mejor puntuación
  if (score > gameData.bestScore || gameData.bestScore === -Infinity) {
    gameData.bestScore = score;
    gameData.bestTime = time;
  }

  // Actualizar estadísticas globales
  progress.statistics.totalGamesPlayed += 1;
  progress.statistics.totalTimePlayed += time;
  progress.statistics.totalScore += score;
  progress.statistics.lastPlayed = new Date().toISOString();

  // Actualizar juego favorito (el que tiene más partidas)
  const gameCounts = {};
  Object.keys(progress.games).forEach(game => {
    Object.keys(progress.games[game]).forEach(themeKey => {
      gameCounts[game] = (gameCounts[game] || 0) + (progress.games[game][themeKey]?.gamesPlayed || 0);
    });
  });
  let favoriteGame = null;
  let maxCount = 0;
  Object.keys(gameCounts).forEach(game => {
    if (gameCounts[game] > maxCount) {
      favoriteGame = game;
      maxCount = gameCounts[game];
    }
  });
  progress.statistics.favoriteGame = favoriteGame;

  // Actualizar streak
  const today = new Date().toDateString();
  if (progress.statistics.lastPlayDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    if (progress.statistics.lastPlayDate === yesterdayStr) {
      progress.statistics.streak = (progress.statistics.streak || 0) + 1;
    } else {
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
  // Calcular averageScore global
  const totalGames = progress.statistics.totalGamesPlayed;
  const avg = totalGames > 0 ? Math.round(progress.statistics.totalScore / totalGames) : 0;
  return {
    ...progress.statistics,
    averageScore: avg
  };
};

// Obtener resumen de progreso
export const getProgressSummary = () => {
  const progress = getProgress();
  
  // Calcular promedio global
  const totalGames = progress.statistics.totalGamesPlayed;
  const averageScore = totalGames > 0 ? Math.round(progress.statistics.totalScore / totalGames) : 0;
  
  // Crear estructura de juegos con estadísticas agregadas
  const games = {};
  Object.keys(progress.games || {}).forEach(gameName => {
    const gameThemes = progress.games[gameName] || {};
    let totalGamesForGame = 0;
    let totalScoreForGame = 0;
    let bestScoreForGame = 0;
    let totalTimeForGame = 0;
    
    Object.keys(gameThemes).forEach(theme => {
      const themeStats = gameThemes[theme];
      if (themeStats && themeStats.gamesPlayed > 0) {
        totalGamesForGame += themeStats.gamesPlayed;
        totalScoreForGame += themeStats.totalScore || 0;
        bestScoreForGame = Math.max(bestScoreForGame, themeStats.bestScore || 0);
        totalTimeForGame += themeStats.bestTime || 0;
      }
    });
    
    if (totalGamesForGame > 0) {
      games[gameName] = {
        totalGames: totalGamesForGame,
        totalScore: totalScoreForGame,
        bestScore: bestScoreForGame,
        averageScore: Math.round(totalScoreForGame / totalGamesForGame),
        totalTime: totalTimeForGame
      };
    }
  });
  
  return {
    totalGames: progress.statistics.totalGamesPlayed,
    totalTime: progress.statistics.totalTimePlayed,
    totalScore: progress.statistics.totalScore,
    averageScore: averageScore,
    favoriteGame: progress.statistics.favoriteGame,
    currentStreak: progress.statistics.streak,
    lastPlayed: progress.statistics.lastPlayed,
    games: games
  };
};

// Limpiar progreso (para testing)
export const clearProgress = () => {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(defaultProgress));
};

// Exportar funciones de utilidad
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (dateInput) => {
  // Acepta string o Date
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  // Usar UTC para evitar problemas de zona horaria
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}; 