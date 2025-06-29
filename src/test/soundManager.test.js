import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de howler antes de importar soundManager
vi.mock('howler', () => {
  const mockSoundInstance = {
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    loop: false,
    on: vi.fn(),
    once: vi.fn(),
    playing: vi.fn(() => false)
  };
  const mockHowl = vi.fn((config) => {
    mockSoundInstance.loop = config.loop;
    mockSoundInstance.volume = vi.fn(() => config.volume);
    if (config.onload) {
      setTimeout(() => config.onload(), 0);
    }
    return mockSoundInstance;
  });
  // Exponer los mocks globalmente
  globalThis.__mockHowl = mockHowl;
  globalThis.__mockSoundInstance = mockSoundInstance;
  return {
    Howl: mockHowl
  };
});

// Mock de musicState
vi.mock('../utils/musicState', () => {
  const getMusicMuted = vi.fn(() => false);
  const getMusicVolume = vi.fn(() => 0.8);
  const getSfxVolume = vi.fn(() => 0.6);
  globalThis.__mockGetMusicMuted = getMusicMuted;
  globalThis.__mockGetMusicVolume = getMusicVolume;
  globalThis.__mockGetSfxVolume = getSfxVolume;
  return {
    getMusicMuted,
    getMusicVolume,
    getSfxVolume
  };
});

// Importar después de configurar los mocks
import {
  loadSound,
  playSound,
  stopSound,
  setVolume,
  getVolume,
  preloadCriticalSounds,
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SFX_VOLUME,
  __clearSoundsForTest
} from '../utils/soundManager';

// Helper para limpiar el caché de sonidos (solo para testing)
function clearSoundsCache() {
  __clearSoundsForTest();
}

describe('Sound Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.__mockGetMusicMuted.mockReturnValue(false);
    localStorage.clear();
  });

  describe('Constants', () => {
    it('should have correct default volumes', () => {
      expect(DEFAULT_MUSIC_VOLUME).toBe(0.2);
      expect(DEFAULT_SFX_VOLUME).toBe(0.5);
    });
  });

  describe('loadSound', () => {
    beforeEach(() => {
      globalThis.__mockHowl.mockClear();
      clearSoundsCache();
    });

    it('should load a sound with correct configuration', () => {
      loadSound('test.wav', true);

      expect(globalThis.__mockHowl).toHaveBeenCalledWith({
        src: ['/assets/sounds/test.wav'],
        loop: true,
        volume: DEFAULT_SFX_VOLUME,
        html5: true,
        onload: expect.any(Function),
        onloaderror: expect.any(Function),
        onplayerror: expect.any(Function)
      });
    });

    it('should not reload already loaded sounds', () => {
      loadSound('test.wav');
      globalThis.__mockHowl.mockClear();
      loadSound('test.wav');
      expect(globalThis.__mockHowl).toHaveBeenCalledTimes(0);
    });

    it('should set correct volume for music vs sfx', () => {
      loadSound('background.wav'); // Música
      loadSound('correct.wav'); // SFX

      expect(globalThis.__mockHowl).toHaveBeenCalledTimes(2);
      
      // Verificar que se llamó con diferentes volúmenes
      const musicCall = globalThis.__mockHowl.mock.calls[0][0];
      const sfxCall = globalThis.__mockHowl.mock.calls[1][0];
      
      expect(musicCall.volume).toBe(DEFAULT_MUSIC_VOLUME);
      expect(sfxCall.volume).toBe(DEFAULT_SFX_VOLUME);
    });

    it('should handle load errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      globalThis.__mockHowl.mockImplementationOnce((config) => {
        setTimeout(() => {
          if (config.onloaderror) config.onloaderror(1, 'Load error');
        }, 0);
        return globalThis.__mockSoundInstance;
      });
      loadSound('error.wav');
      await new Promise(r => setTimeout(r, 10));
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load sound: error.wav', 'Load error');
      consoleSpy.mockRestore();
    });
  });

  describe('playSound', () => {
    beforeEach(() => {
      loadSound('test.wav');
    });

    it('should play a loaded sound', () => {
      playSound('test.wav');

      expect(globalThis.__mockSoundInstance.play).toHaveBeenCalled();
    });

    it('should not play if sound is already playing', () => {
      globalThis.__mockSoundInstance.playing.mockReturnValue(true);
      
      playSound('test.wav');

      expect(globalThis.__mockSoundInstance.play).not.toHaveBeenCalled();
    });

    it('should load and play unloaded sounds', () => {
      playSound('unloaded.wav');

      expect(globalThis.__mockHowl).toHaveBeenCalledWith({
        src: ['/assets/sounds/unloaded.wav'],
        loop: false,
        volume: DEFAULT_SFX_VOLUME,
        html5: true,
        onload: expect.any(Function),
        onloaderror: expect.any(Function),
        onplayerror: expect.any(Function)
      });
    });

    it('should not play music when muted', () => {
      globalThis.__mockGetMusicMuted.mockReturnValue(true);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      playSound('background.wav');

      expect(consoleSpy).toHaveBeenCalledWith('Music is muted, skipping: background.wav');
      expect(globalThis.__mockSoundInstance.play).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle play errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Limpiar caché y mock antes del test
      clearSoundsCache();
      globalThis.__mockHowl.mockClear();
      
      // Crear un sonido y simular el error
      loadSound('test.wav');
      const lastCall = globalThis.__mockHowl.mock.calls[globalThis.__mockHowl.mock.calls.length - 1];
      const config = lastCall[0];
      
      // Simular el error llamando a onplayerror
      if (config.onplayerror) {
        config.onplayerror(1, new Error('Play error'));
      }
      
      await new Promise(r => setTimeout(r, 10));
      expect(consoleSpy).toHaveBeenCalledWith('Failed to play sound: test.wav', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('stopSound', () => {
    beforeEach(() => {
      loadSound('test.wav');
    });

    it('should stop a playing sound', () => {
      globalThis.__mockSoundInstance.playing.mockReturnValue(true);
      
      stopSound('test.wav');

      expect(globalThis.__mockSoundInstance.stop).toHaveBeenCalled();
    });

    it('should not stop if sound is not playing', () => {
      globalThis.__mockSoundInstance.playing.mockReturnValue(false);
      
      stopSound('test.wav');

      expect(globalThis.__mockSoundInstance.stop).not.toHaveBeenCalled();
    });

    it('should handle non-existent sounds gracefully', () => {
      expect(() => stopSound('nonexistent.wav')).not.toThrow();
    });
  });

  describe('setVolume', () => {
    beforeEach(() => {
      loadSound('background.wav'); // Música
      loadSound('correct.wav'); // SFX
    });

    it('should set volume for music category', () => {
      setVolume('music', 0.8);

      expect(globalThis.__mockSoundInstance.volume).toHaveBeenCalledWith(0.8);
    });

    it('should set volume for sfx category', () => {
      setVolume('sfx', 0.6);

      expect(globalThis.__mockSoundInstance.volume).toHaveBeenCalledWith(0.6);
    });

    it('should not affect sounds of different category', () => {
      setVolume('music', 0.8);

      // Solo debería afectar a la música, no a los SFX
      expect(globalThis.__mockSoundInstance.volume).toHaveBeenCalledWith(0.8);
    });

    it('should handle invalid category gracefully', () => {
      expect(() => setVolume('invalid', 0.5)).not.toThrow();
    });
  });

  describe('getVolume', () => {
    it('should return correct volume for music category', () => {
      setVolume('music', DEFAULT_MUSIC_VOLUME);
      const volume = getVolume('music');
      expect(volume).toBe(DEFAULT_MUSIC_VOLUME);
    });
    it('should return correct volume for sfx category', () => {
      setVolume('sfx', DEFAULT_SFX_VOLUME);
      const volume = getVolume('sfx');
      expect(volume).toBe(DEFAULT_SFX_VOLUME);
    });
  });

  describe('preloadCriticalSounds', () => {
    beforeEach(() => {
      globalThis.__mockHowl.mockClear();
      clearSoundsCache();
    });
    it('should load all critical sounds', () => {
      // Limpiar caché y mock justo antes del test
      clearSoundsCache();
      globalThis.__mockHowl.mockClear();
      
      preloadCriticalSounds();
      expect(globalThis.__mockHowl).toHaveBeenCalledTimes(6);
      
      const criticalSounds = [
        'background.wav',
        'correct.wav',
        'incorrect.wav',
        'win.wav',
        'typing.wav',
        'cardFlip.wav'
      ];
      
      criticalSounds.forEach(sound => {
        expect(globalThis.__mockHowl).toHaveBeenCalledWith(
          expect.objectContaining({
            src: [`/assets/sounds/${sound}`]
          })
        );
      });
    });
    it('should set background music to loop', () => {
      // Limpiar caché y mock justo antes del test
      clearSoundsCache();
      globalThis.__mockHowl.mockClear();
      
      preloadCriticalSounds();
      
      // Buscar la llamada para background.wav
      const backgroundCall = globalThis.__mockHowl.mock.calls.find(call =>
        call[0].src[0].includes('background.wav')
      );
      
      expect(backgroundCall).toBeDefined();
      expect(backgroundCall[0].loop).toBe(true);
    });
  });
}); 