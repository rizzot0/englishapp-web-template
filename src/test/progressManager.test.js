import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Progress Manager', () => {
  beforeEach(() => {
    // Configurar localStorage real para los tests
    const localStorageMock = {
      data: {},
      getItem: function(key) {
        return this.data[key] || null;
      },
      setItem: function(key, value) {
        this.data[key] = value;
      },
      removeItem: function(key) {
        delete this.data[key];
      },
      clear: function() {
        this.data = {};
      }
    };
    
    // Reemplazar localStorage global
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getProgress', () => {
    it('should initialize default progress structure when none exists', async () => {
      const { getProgress } = await import('../utils/progressManager');
      const progress = getProgress();
      expect(progress).toEqual({
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
      });
    });

    it('should return existing progress when available', async () => {
      const { getProgress } = await import('../utils/progressManager');
      const existingProgress = {
        games: { memoryGame: { fruits: { bestScore: 100 } } },
        statistics: { totalGamesPlayed: 5 }
      };
      localStorage.setItem('englishAppProgress', JSON.stringify(existingProgress));
      const progress = getProgress();
      expect(progress).toEqual(existingProgress);
    });

    it('debug test - should show what is actually in localStorage', async () => {
      const { getProgress } = await import('../utils/progressManager');
      const testData = {
        games: { memoryGame: { fruits: { bestScore: 100 } } },
        statistics: { totalGamesPlayed: 5 }
      };
      localStorage.setItem('englishAppProgress', JSON.stringify(testData));
      console.log('localStorage after setItem:', localStorage.getItem('englishAppProgress'));
      const progress = getProgress();
      console.log('getProgress result:', JSON.stringify(progress, null, 2));
      expect(progress).toEqual(testData);
    });
  });

  describe('saveGameScore', () => {
    it('should save first game score correctly', async () => {
      const { saveGameScore } = await import('../utils/progressManager');
      const result = saveGameScore('memoryGame', 'fruits', 100, 120);
      expect(result.games.memoryGame.fruits).toEqual({
        bestScore: 100,
        bestTime: 120,
        gamesPlayed: 1,
        totalScore: 100,
        averageScore: 100,
        lastPlayed: expect.any(String),
        history: [{
          score: 100,
          time: 120,
          date: expect.any(String)
        }]
      });
      expect(result.statistics.totalGamesPlayed).toBe(1);
      expect(result.statistics.totalTimePlayed).toBe(120);
      expect(result.statistics.totalScore).toBe(100);
      expect(result.statistics.favoriteGame).toBe('memoryGame');
      expect(result.statistics.streak).toBe(1);
    });

    it('should update best score when new score is higher', async () => {
      const { saveGameScore } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 80, 100);
      const result = saveGameScore('memoryGame', 'fruits', 120, 90);
      expect(result.games.memoryGame.fruits.bestScore).toBe(120);
      expect(result.games.memoryGame.fruits.bestTime).toBe(90);
      expect(result.games.memoryGame.fruits.gamesPlayed).toBe(2);
      expect(result.games.memoryGame.fruits.averageScore).toBe(100);
    });

    it('should maintain best score when new score is lower', async () => {
      const { saveGameScore } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 120, 90);
      const result = saveGameScore('memoryGame', 'fruits', 80, 100);
      expect(result.games.memoryGame.fruits.bestScore).toBe(120);
      expect(result.games.memoryGame.fruits.bestTime).toBe(90);
    });

    it('should limit history to 10 entries', async () => {
      const { saveGameScore, getProgress } = await import('../utils/progressManager');
      for (let i = 0; i < 12; i++) {
        saveGameScore('memoryGame', 'fruits', 100 + i, 100);
      }
      const progress = getProgress();
      expect(progress.games.memoryGame.fruits.history).toHaveLength(10);
      expect(progress.games.memoryGame.fruits.history[0].score).toBe(102);
    });

    it('should update favorite game based on play count', async () => {
      const { saveGameScore, getProgress } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 100, 120);
      saveGameScore('typingGame', 'animals', 80, 90);
      saveGameScore('typingGame', 'colors', 90, 100);
      const progress = getProgress();
      expect(progress.statistics.favoriteGame).toBe('typingGame');
    });

    it('should handle streak correctly', async () => {
      const { saveGameScore, getProgress } = await import('../utils/progressManager');
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      const existingProgress = {
        games: {},
        statistics: {
          totalGamesPlayed: 0,
          totalTimePlayed: 0,
          totalScore: 0,
          favoriteGame: null,
          lastPlayed: null,
          streak: 3,
          lastPlayDate: yesterdayStr
        }
      };
      localStorage.setItem('englishAppProgress', JSON.stringify(existingProgress));
      const result = saveGameScore('memoryGame', 'fruits', 100, 100);
      expect(result.statistics.streak).toBe(4);
      expect(result.statistics.lastPlayDate).toBe(today);
    });

    it('should reset streak when missing a day', async () => {
      const { saveGameScore, getProgress } = await import('../utils/progressManager');
      const today = new Date().toDateString();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toDateString();
      const existingProgress = {
        games: {},
        statistics: {
          totalGamesPlayed: 0,
          totalTimePlayed: 0,
          totalScore: 0,
          favoriteGame: null,
          lastPlayed: null,
          streak: 5,
          lastPlayDate: twoDaysAgoStr
        }
      };
      localStorage.setItem('englishAppProgress', JSON.stringify(existingProgress));
      const result = saveGameScore('memoryGame', 'fruits', 100, 100);
      expect(result.statistics.streak).toBe(1);
      expect(result.statistics.lastPlayDate).toBe(today);
    });

    it('should include additional data in history', async () => {
      const { saveGameScore } = await import('../utils/progressManager');
      const additionalData = { difficulty: 'hard', theme: 'fruits' };
      const result = saveGameScore('memoryGame', 'fruits', 100, 120, additionalData);
      expect(result.games.memoryGame.fruits.history[0]).toEqual({
        score: 100,
        time: 120,
        date: expect.any(String),
        difficulty: 'hard',
        theme: 'fruits'
      });
    });
  });

  describe('getGameStats', () => {
    it('should return game stats for existing game and theme', async () => {
      const { saveGameScore, getGameStats } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 100, 120);
      saveGameScore('memoryGame', 'fruits', 150, 90);
      const stats = getGameStats('memoryGame', 'fruits');
      expect(stats).toEqual({
        bestScore: 150,
        bestTime: 90,
        gamesPlayed: 2,
        totalScore: 250,
        averageScore: 125,
        lastPlayed: expect.any(String),
        history: expect.arrayContaining([
          expect.objectContaining({ score: 100, time: 120 }),
          expect.objectContaining({ score: 150, time: 90 })
        ])
      });
    });

    it('should return null for non-existent game', async () => {
      const { getGameStats } = await import('../utils/progressManager');
      const stats = getGameStats('nonExistentGame', 'fruits');
      expect(stats).toBeNull();
    });

    it('should return null for non-existent theme', async () => {
      const { saveGameScore, getGameStats } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 100, 120);
      const stats = getGameStats('memoryGame', 'nonExistentTheme');
      expect(stats).toBeNull();
    });
  });

  describe('getGlobalStats', () => {
    it('should return global statistics', async () => {
      const { saveGameScore, getGlobalStats } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 100, 120);
      saveGameScore('typingGame', 'animals', 80, 90);
      saveGameScore('mathGame', 'addition', 150, 60);
      const stats = getGlobalStats();
      expect(stats).toEqual({
        totalGamesPlayed: 3,
        totalTimePlayed: 270,
        totalScore: 330,
        averageScore: 110,
        favoriteGame: 'memoryGame',
        streak: 1,
        lastPlayed: expect.any(String),
        lastPlayDate: expect.any(String)
      });
    });
  });

  describe('getProgressSummary', () => {
    it('should return progress summary', async () => {
      const { saveGameScore, getProgressSummary } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 100, 120);
      saveGameScore('typingGame', 'animals', 80, 90);
      const summary = getProgressSummary();
      expect(summary).toEqual({
        totalGames: 2,
        totalTime: 210,
        totalScore: 180,
        averageScore: 90,
        favoriteGame: 'memoryGame',
        currentStreak: 1,
        lastPlayed: expect.any(String)
      });
    });
  });

  describe('clearProgress', () => {
    it('should clear progress and reinitialize', async () => {
      const { saveGameScore, clearProgress, getProgress } = await import('../utils/progressManager');
      saveGameScore('memoryGame', 'fruits', 100, 120);
      clearProgress();
      const progress = getProgress();
      expect(progress).toEqual({
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
      });
    });
  });

  describe('Utility Functions', () => {
    describe('formatTime', () => {
      it('should format time correctly', async () => {
        const { formatTime } = await import('../utils/progressManager');
        expect(formatTime(65)).toBe('1:05');
        expect(formatTime(125)).toBe('2:05');
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(3600)).toBe('60:00');
      });
    });

    describe('formatDate', () => {
      it('should format date correctly', async () => {
        const { formatDate } = await import('../utils/progressManager');
        const date = new Date('2023-12-25');
        expect(formatDate(date)).toBe('25/12/2023');
      });

      it('should handle current date', async () => {
        const { formatDate } = await import('../utils/progressManager');
        const today = new Date();
        const formatted = formatDate(today);
        expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage errors gracefully', async () => {
      const { getProgress } = await import('../utils/progressManager');
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      const progress = getProgress();
      expect(progress).toEqual({
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
      });
    });

    it('should handle invalid JSON in localStorage', async () => {
      const { getProgress } = await import('../utils/progressManager');
      vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid json');
      const progress = getProgress();
      expect(progress).toEqual({
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
      });
    });

    it('should handle negative scores and times', async () => {
      const { saveGameScore } = await import('../utils/progressManager');
      const result = saveGameScore('memoryGame', 'fruits', -50, -30);
      expect(result.games.memoryGame.fruits.bestScore).toBe(-50);
      expect(result.games.memoryGame.fruits.bestTime).toBe(-30);
      expect(result.statistics.totalScore).toBe(-50);
      expect(result.statistics.totalTimePlayed).toBe(-30);
    });
  });
}); 