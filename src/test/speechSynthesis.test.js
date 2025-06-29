import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de window.speechSynthesis antes de cualquier importación
const mockSpeechSynthesis = {
  cancel: vi.fn(),
  speak: vi.fn(),
  getVoices: vi.fn(() => [
    {
      name: 'Google US English',
      lang: 'en-US',
      default: false
    },
    {
      name: 'Microsoft David',
      lang: 'en-US',
      default: true
    },
    {
      name: 'Google UK English',
      lang: 'en-GB',
      default: false
    }
  ]),
  onvoiceschanged: null
};

const mockSpeechSynthesisUtterance = vi.fn();

// Mock de window
Object.defineProperty(global, 'window', {
  value: {
    speechSynthesis: mockSpeechSynthesis,
    SpeechSynthesisUtterance: mockSpeechSynthesisUtterance
  },
  writable: true
});

// Importar después del mock
import { speak } from '../utils/speechSynthesis';

describe('Speech Synthesis', () => {
  let mockUtterance;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de la instancia de SpeechSynthesisUtterance
    mockUtterance = {
      lang: '',
      rate: 1,
      pitch: 1,
      voice: null,
      text: ''
    };

    mockSpeechSynthesisUtterance.mockImplementation((text) => {
      mockUtterance.text = text;
      return mockUtterance;
    });

    // Resetear el mock de voces al estado por defecto
    mockSpeechSynthesis.getVoices.mockReturnValue([
      {
        name: 'Google US English',
        lang: 'en-US',
        default: false
      },
      {
        name: 'Microsoft David',
        lang: 'en-US',
        default: true
      },
      {
        name: 'Google UK English',
        lang: 'en-GB',
        default: false
      }
    ]);
  });

  describe('speak function', () => {
    it('should speak text with default options', () => {
      speak('Hello world');

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('Hello world');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
      expect(mockUtterance.lang).toBe('en-US');
      expect(mockUtterance.rate).toBe(0.9);
      expect(mockUtterance.pitch).toBe(1.2);
    });

    it('should speak text with custom options', () => {
      speak('Hello world', {
        lang: 'en-GB',
        rate: 1.2,
        pitch: 0.8
      });

      expect(mockUtterance.lang).toBe('en-GB');
      expect(mockUtterance.rate).toBe(1.2);
      expect(mockUtterance.pitch).toBe(0.8);
    });

    it('should select Google voice when available', () => {
      speak('Hello world');

      expect(mockUtterance.voice).toEqual({
        name: 'Google US English',
        lang: 'en-US',
        default: false
      });
    });

    it('should fallback to any available voice when Google voice not found', () => {
      // Mock sin voces de Google
      mockSpeechSynthesis.getVoices.mockReturnValue([
        {
          name: 'Microsoft David',
          lang: 'en-US',
          default: true
        }
      ]);

      speak('Hello world');

      expect(mockUtterance.voice).toEqual({
        name: 'Microsoft David',
        lang: 'en-US',
        default: true
      });
    });

    it('should handle different languages', () => {
      speak('Hola mundo', { lang: 'es-ES' });

      expect(mockUtterance.lang).toBe('es-ES');
    });

    it('should handle empty text', () => {
      speak('');

      expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
    });

    it('should handle special characters in text', () => {
      speak('Hello & World! @#$%');

      expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('Hello & World! @#$%');
    });
  });

  describe('Voice Selection', () => {
    it('should prioritize Google voices', () => {
      const voices = [
        { name: 'System Voice', lang: 'en-US', default: true },
        { name: 'Google US English', lang: 'en-US', default: false },
        { name: 'Microsoft David', lang: 'en-US', default: false }
      ];

      mockSpeechSynthesis.getVoices.mockReturnValue(voices);

      speak('Hello world');

      expect(mockUtterance.voice).toEqual({
        name: 'Google US English',
        lang: 'en-US',
        default: false
      });
    });

    it('should select voice matching the specified language', () => {
      const voices = [
        { name: 'Google US English', lang: 'en-US', default: false },
        { name: 'Google UK English', lang: 'en-GB', default: false },
        { name: 'Google Spanish', lang: 'es-ES', default: false }
      ];

      mockSpeechSynthesis.getVoices.mockReturnValue(voices);

      speak('Hello world', { lang: 'en-GB' });

      expect(mockUtterance.voice).toEqual({
        name: 'Google UK English',
        lang: 'en-GB',
        default: false
      });
    });

    it('should fallback to any voice in the specified language', () => {
      const voices = [
        { name: 'System Voice', lang: 'en-US', default: true },
        { name: 'Microsoft David', lang: 'en-US', default: false }
      ];

      mockSpeechSynthesis.getVoices.mockReturnValue(voices);

      speak('Hello world', { lang: 'en-US' });

      expect(mockUtterance.voice).toEqual({
        name: 'System Voice',
        lang: 'en-US',
        default: true
      });
    });

    it('should handle no voices available', () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);

      speak('Hello world');

      expect(mockUtterance.voice).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle browsers without speech synthesis support', () => {
      // Simular navegador sin soporte
      const originalSpeechSynthesis = global.window.speechSynthesis;
      global.window.speechSynthesis = undefined;

      expect(() => speak('Hello world')).not.toThrow();

      // Restaurar
      global.window.speechSynthesis = originalSpeechSynthesis;
    });

    it('should handle speech synthesis errors gracefully', () => {
      mockSpeechSynthesis.speak.mockImplementation(() => {
        throw new Error('Speech synthesis error');
      });

      expect(() => speak('Hello world')).not.toThrow();
    });

    it('should handle utterance creation errors', () => {
      mockSpeechSynthesisUtterance.mockImplementation(() => {
        throw new Error('Utterance creation error');
      });

      expect(() => speak('Hello world')).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should cancel previous speech before starting new one', () => {
      speak('First text');
      speak('Second text');

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 5; i++) {
        speak(`Text ${i}`);
      }

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(5);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null text', () => {
      expect(() => speak(null)).not.toThrow();
    });

    it('should handle undefined text', () => {
      expect(() => speak(undefined)).not.toThrow();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(10000);
      
      expect(() => speak(longText)).not.toThrow();
      expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith(longText);
    });

    it('should handle text with only whitespace', () => {
      speak('   \n\t   ');

      expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('   \n\t   ');
    });
  });
}); 