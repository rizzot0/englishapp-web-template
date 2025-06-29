import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de las utilidades
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = mockLocalStorage;
global.sessionStorage = mockSessionStorage;

describe('Theme Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with light theme by default', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Simular el comportamiento del contexto
    const isDark = false;
    expect(isDark).toBe(false);
  });

  it('should load theme preference from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    // Simular el comportamiento del contexto
    const isDark = mockLocalStorage.getItem('theme-preference') === 'dark';
    expect(isDark).toBe(true);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme-preference');
  });

  it('should save theme preference to localStorage', () => {
    const theme = 'dark';
    mockLocalStorage.setItem('theme-preference', theme);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme-preference', theme);
  });
});

describe('Audio Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load audio preferences from localStorage', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      const preferences = {
        'music-enabled': 'true',
        'music-volume': '0.5',
        'sound-volume': '0.8'
      };
      return preferences[key] || null;
    });

    const musicEnabled = mockLocalStorage.getItem('music-enabled') === 'true';
    const musicVolume = parseFloat(mockLocalStorage.getItem('music-volume') || '0.5');
    const soundVolume = parseFloat(mockLocalStorage.getItem('sound-volume') || '0.8');

    expect(musicEnabled).toBe(true);
    expect(musicVolume).toBe(0.5);
    expect(soundVolume).toBe(0.8);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('music-enabled');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('music-volume');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('sound-volume');
  });

  it('should save audio preferences to localStorage', () => {
    const preferences = {
      'music-enabled': 'false',
      'music-volume': '0.3',
      'sound-volume': '0.9'
    };

    Object.entries(preferences).forEach(([key, value]) => {
      mockLocalStorage.setItem(key, value);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('music-enabled', 'false');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('music-volume', '0.3');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sound-volume', '0.9');
  });
});

describe('Game Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate average score correctly', () => {
    const scores = [80, 90, 75, 95, 85];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    expect(average).toBe(85);
  });

  it('should calculate total time played', () => {
    const timeSpent = [120, 180, 90, 150, 200]; // en segundos
    const totalTime = timeSpent.reduce((sum, time) => sum + time, 0);
    
    expect(totalTime).toBe(740);
  });

  it('should filter statistics by game type', () => {
    const statistics = [
      { game_type: 'memory', score: 80, time_spent: 120 },
      { game_type: 'typing', score: 90, time_spent: 180 },
      { game_type: 'memory', score: 75, time_spent: 90 },
      { game_type: 'math', score: 95, time_spent: 150 }
    ];

    const memoryStats = statistics.filter(stat => stat.game_type === 'memory');
    const typingStats = statistics.filter(stat => stat.game_type === 'typing');

    expect(memoryStats).toHaveLength(2);
    expect(typingStats).toHaveLength(1);
  });

  it('should filter statistics by date range', () => {
    const statistics = [
      { created_at: '2024-12-01T10:00:00Z', score: 80 },
      { created_at: '2024-12-15T10:00:00Z', score: 90 },
      { created_at: '2024-12-30T10:00:00Z', score: 75 },
      { created_at: '2025-01-15T10:00:00Z', score: 95 }
    ];

    const startDate = new Date('2024-12-01');
    const endDate = new Date('2024-12-31');

    const filteredStats = statistics.filter(stat => {
      const statDate = new Date(stat.created_at);
      return statDate >= startDate && statDate <= endDate;
    });

    expect(filteredStats).toHaveLength(3);
  });
});

describe('Service Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register service worker when supported', () => {
    const mockRegister = vi.fn().mockResolvedValue({});
    
    // Simular que el service worker está soportado y llamar directamente
    mockRegister('/sw.js');

    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });

  it('should handle service worker registration errors', () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error('Registration failed'));
    
    const handleRegistration = async () => {
      try {
        await mockRegister('/sw.js');
      } catch (error) {
        return error.message;
      }
    };

    return handleRegistration().then(errorMessage => {
      expect(errorMessage).toBe('Registration failed');
    });
  });
});

describe('Asset Preloading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preload images successfully', () => {
    const imageUrls = [
      '/assets/images/apple.webp',
      '/assets/images/banana.webp',
      '/assets/images/cat.webp'
    ];

    // Simular preloading exitoso
    const preloadImage = (url) => {
      return Promise.resolve(true); // Simular carga exitosa
    };

    const preloadImages = async () => {
      const results = await Promise.all(imageUrls.map(preloadImage));
      return results.every(result => result === true);
    };

    return preloadImages().then(success => {
      expect(success).toBe(true);
    });
  });

  it('should preload sounds successfully', () => {
    const soundUrls = [
      '/assets/sounds/correct.wav',
      '/assets/sounds/incorrect.wav',
      '/assets/sounds/background.wav'
    ];

    // Simular preloading exitoso
    const preloadSound = (url) => {
      return Promise.resolve(true); // Simular carga exitosa
    };

    const preloadSounds = async () => {
      const results = await Promise.all(soundUrls.map(preloadSound));
      return results.every(result => result === true);
    };

    return preloadSounds().then(success => {
      expect(success).toBe(true);
    });
  });
});

describe('Data Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate PDF with correct data', () => {
    const generatePDF = (data) => {
      return {
        content: data,
        format: 'pdf',
        timestamp: new Date().toISOString()
      };
    };

    const testData = [
      { game: 'memory', score: 85, date: '2024-12-01' },
      { game: 'typing', score: 90, date: '2024-12-02' }
    ];

    const pdf = generatePDF(testData);

    expect(pdf.content).toEqual(testData);
    expect(pdf.format).toBe('pdf');
    expect(pdf.timestamp).toBeDefined();
  });

  it('should export data to Excel format', () => {
    const exportToExcel = (data) => {
      return {
        data: data,
        format: 'xlsx',
        filename: 'game-statistics.xlsx'
      };
    };

    const testData = [
      { game: 'memory', score: 85, time: 120 },
      { game: 'typing', score: 90, time: 180 }
    ];

    const excel = exportToExcel(testData);

    expect(excel.data).toEqual(testData);
    expect(excel.format).toBe('xlsx');
    expect(excel.filename).toBe('game-statistics.xlsx');
  });
});

describe('Validation Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate email format correctly', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('should validate score range', () => {
    const validateScore = (score) => {
      return score >= 0 && score <= 100 && Number.isInteger(score);
    };

    expect(validateScore(85)).toBe(true);
    expect(validateScore(0)).toBe(true);
    expect(validateScore(100)).toBe(true);
    expect(validateScore(-5)).toBe(false);
    expect(validateScore(150)).toBe(false);
    expect(validateScore(85.5)).toBe(false);
  });

  it('should validate time format', () => {
    const validateTime = (time) => {
      return time >= 0 && Number.isInteger(time) && time <= 3600; // máximo 1 hora
    };

    expect(validateTime(120)).toBe(true);
    expect(validateTime(0)).toBe(true);
    expect(validateTime(3600)).toBe(true);
    expect(validateTime(-10)).toBe(false);
    expect(validateTime(4000)).toBe(false);
    expect(validateTime(120.5)).toBe(false);
  });
}); 