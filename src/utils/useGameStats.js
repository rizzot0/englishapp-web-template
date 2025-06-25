import { useState, useEffect } from 'react';
import { gameStatsAPI } from './supabase';

export const useGameStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todas las estadísticas
  const loadStats = async (limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameStatsAPI.getAllStats(limit);
      if (result.success) {
        setStats(result.data || []);
      } else {
        setError('Error al cargar las estadísticas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar estadísticas de un juego
  const saveGameStats = async (gameData) => {
    try {
      const result = await gameStatsAPI.saveGameStats(gameData);
      if (result.success) {
        // Recargar estadísticas después de guardar
        await loadStats();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error guardando estadísticas:', err);
      return { success: false, error: err.message };
    }
  };

  // Obtener estadísticas de un juego específico
  const getGameStats = async (gameType, limit = 50) => {
    try {
      const result = await gameStatsAPI.getGameStats(gameType, limit);
      return result;
    } catch (err) {
      console.error('Error obteniendo estadísticas del juego:', err);
      return { success: false, error: err.message };
    }
  };

  // Obtener mejores puntuaciones
  const getTopScores = async (gameType, limit = 10) => {
    try {
      const result = await gameStatsAPI.getTopScores(gameType, limit);
      return result;
    } catch (err) {
      console.error('Error obteniendo mejores puntuaciones:', err);
      return { success: false, error: err.message };
    }
  };

  // Obtener estadísticas por fecha
  const getStatsByDate = async (startDate, endDate) => {
    try {
      const result = await gameStatsAPI.getStatsByDate(startDate, endDate);
      return result;
    } catch (err) {
      console.error('Error obteniendo estadísticas por fecha:', err);
      return { success: false, error: err.message };
    }
  };

  // Calcular resumen de estadísticas
  const getSummary = () => {
    if (!stats.length) return null;

    const totalGames = stats.length;
    const totalScore = stats.reduce((sum, stat) => sum + (stat.score || 0), 0);
    const totalTime = stats.reduce((sum, stat) => sum + (stat.duration || 0), 0);
    
    // Agrupar por tipo de juego
    const gamesByType = stats.reduce((acc, stat) => {
      const gameType = stat.game_type;
      if (!acc[gameType]) {
        acc[gameType] = {
          totalGames: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          totalTime: 0,
          lastPlayed: null
        };
      }
      acc[gameType].totalGames++;
      acc[gameType].totalScore += stat.score || 0;
      acc[gameType].bestScore = Math.max(acc[gameType].bestScore, stat.score || 0);
      acc[gameType].totalTime += stat.duration || 0;
      
      // Actualizar última vez jugado
      if (!acc[gameType].lastPlayed || new Date(stat.created_at) > new Date(acc[gameType].lastPlayed)) {
        acc[gameType].lastPlayed = stat.created_at;
      }
      
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

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    loadStats,
    saveGameStats,
    getGameStats,
    getTopScores,
    getStatsByDate,
    getSummary
  };
}; 