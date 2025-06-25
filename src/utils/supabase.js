import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones para manejar los datos de los juegos
export const gameStatsAPI = {
  // Guardar estadísticas de un juego
  async saveGameStats(gameData) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .insert([gameData])
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error guardando estadísticas:', error)
      return { success: false, error }
    }
  },

  // Obtener estadísticas de un juego específico
  async getGameStats(gameType, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('game_type', gameType)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { success: false, error }
    }
  },

  // Obtener todas las estadísticas
  async getAllStats(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error obteniendo todas las estadísticas:', error)
      return { success: false, error }
    }
  },

  // Obtener estadísticas por fecha
  async getStatsByDate(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error obteniendo estadísticas por fecha:', error)
      return { success: false, error }
    }
  },

  // Obtener mejores puntuaciones
  async getTopScores(gameType, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('game_type', gameType)
        .order('score', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error obteniendo mejores puntuaciones:', error)
      return { success: false, error }
    }
  }
} 