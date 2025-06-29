import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de supabase-js usando globalThis para exponer los mocks
vi.mock('@supabase/supabase-js', () => {
  const mockFrom = vi.fn();
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();
  const mockEq = vi.fn();
  const mockGte = vi.fn();
  const mockLte = vi.fn();

  globalThis.__mockFrom = mockFrom;
  globalThis.__mockInsert = mockInsert;
  globalThis.__mockSelect = mockSelect;
  globalThis.__mockOrder = mockOrder;
  globalThis.__mockLimit = mockLimit;
  globalThis.__mockEq = mockEq;
  globalThis.__mockGte = mockGte;
  globalThis.__mockLte = mockLte;

  return {
    createClient: vi.fn(() => ({
      from: mockFrom,
    })),
  };
});

// Mock de las variables de entorno
vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
}));

// Importar después del mock
import * as supabaseApi from '../utils/supabase';

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.__mockFrom.mockReturnValue({
    insert: globalThis.__mockInsert,
    select: globalThis.__mockSelect,
    order: globalThis.__mockOrder,
    limit: globalThis.__mockLimit,
    eq: globalThis.__mockEq,
    gte: globalThis.__mockGte,
    lte: globalThis.__mockLte,
  });
  globalThis.__mockInsert.mockResolvedValue({ data: [{ id: 1 }], error: null });
  globalThis.__mockSelect.mockResolvedValue({ data: [{ id: 1 }], error: null });
  globalThis.__mockOrder.mockReturnThis();
  globalThis.__mockLimit.mockReturnThis();
  globalThis.__mockEq.mockReturnThis();
  globalThis.__mockGte.mockReturnThis();
  globalThis.__mockLte.mockReturnThis();
});

describe('Supabase Client', () => {
  it('should create Supabase client with correct configuration', () => {
    expect(supabaseApi.supabase).toBeDefined();
    expect(supabaseApi.supabase.from).toBeDefined();
  });

  it('should have gameStatsAPI object with all required methods', () => {
    expect(supabaseApi.gameStatsAPI).toBeDefined();
    expect(typeof supabaseApi.gameStatsAPI.saveGameStats).toBe('function');
    expect(typeof supabaseApi.gameStatsAPI.getGameStats).toBe('function');
    expect(typeof supabaseApi.gameStatsAPI.getAllStats).toBe('function');
    expect(typeof supabaseApi.gameStatsAPI.getStatsByDate).toBe('function');
    expect(typeof supabaseApi.gameStatsAPI.getTopScores).toBe('function');
  });
});

describe('gameStatsAPI', () => {
  describe('saveGameStats', () => {
    it('should save game statistics successfully', async () => {
      globalThis.__mockInsert.mockResolvedValueOnce({
        data: { id: 1, game_type: 'memory', score: 100 },
        error: null
      });
      const gameData = { game_type: 'memory', score: 100 };
      const result = await supabaseApi.gameStatsAPI.saveGameStats(gameData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, game_type: 'memory', score: 100 });
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
    it('should handle errors when saving game statistics', async () => {
      globalThis.__mockInsert.mockResolvedValueOnce({ data: null, error: new Error('Error de prueba') });
      const gameData = { game_type: 'memory', score: 100 };
      const result = await supabaseApi.gameStatsAPI.saveGameStats(gameData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getGameStats', () => {
    it('should get game statistics for specific game type', async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [
          { id: 1, game_type: 'memory', score: 100, created_at: '2024-01-01' },
          { id: 2, game_type: 'memory', score: 90, created_at: '2024-01-02' }
        ],
        error: null
      });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: mockLimit,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      const result = await supabaseApi.gameStatsAPI.getGameStats('memory', 10);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].game_type).toBe('memory');
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
    it('should use default limit when not specified', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: mockLimit,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      await supabaseApi.gameStatsAPI.getGameStats('memory');
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
  });

  describe('getAllStats', () => {
    it('should get all statistics with default limit', async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [
          { id: 1, game_type: 'memory', score: 100 },
          { id: 2, game_type: 'typing', score: 90 }
        ],
        error: null
      });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: mockLimit,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      const result = await supabaseApi.gameStatsAPI.getAllStats();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
    it('should get all statistics with custom limit', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: mockLimit,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      await supabaseApi.gameStatsAPI.getAllStats(20);
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
  });

  describe('getStatsByDate', () => {
    it('should get statistics within date range', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          { id: 1, game_type: 'memory', score: 100, created_at: '2024-01-01' }
        ],
        error: null
      });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: mockOrder,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const result = await supabaseApi.gameStatsAPI.getStatsByDate(startDate, endDate);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
  });

  describe('getTopScores', () => {
    it('should get top scores for specific game type', async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [
          { id: 1, game_type: 'memory', score: 100 },
          { id: 2, game_type: 'memory', score: 90 }
        ],
        error: null
      });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: mockLimit,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      const result = await supabaseApi.gameStatsAPI.getTopScores('memory', 5);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
    it('should use default limit when not specified', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockSelectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: mockLimit,
      };
      globalThis.__mockFrom.mockReturnValue(mockSelectChain);
      await supabaseApi.gameStatsAPI.getTopScores('memory');
      expect(globalThis.__mockFrom).toHaveBeenCalledWith('game_stats');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock error response for all methods
      const errorResponse = {
        data: null,
        error: { message: 'Connection failed' }
      };

      globalThis.__mockFrom.mockReturnValueOnce({
        insert: vi.fn(() => errorResponse),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => errorResponse)
            }))
          }))
        }))
      });

      const result = await supabaseApi.gameStatsAPI.saveGameStats({ game_type: 'memory', score: 100 });

      expect(result.success).toBe(false);
      expect(result.error).toEqual({ message: 'Connection failed' });
    });
  });
}); 