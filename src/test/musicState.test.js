import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Importar directamente sin mock de soundManager
import {
  getMusicMuted,
  toggleMusicMuted,
  setMusicMuted,
  subscribe
} from '../utils/musicState';

describe('Music State', () => {
  let mockListener;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockListener = vi.fn();
    
    // Resetear el estado a false antes de cada prueba
    setMusicMuted(false);
  });

  describe('getMusicMuted', () => {
    it('should return current muted state', () => {
      // Estado inicial debería ser false
      expect(getMusicMuted()).toBe(false);
      
      setMusicMuted(true);
      expect(getMusicMuted()).toBe(true);
    });
  });

  describe('toggleMusicMuted', () => {
    it('should mute music when currently unmuted', () => {
      const result = toggleMusicMuted();

      expect(result).toBe(true);
      expect(getMusicMuted()).toBe(true);
    });

    it('should unmute music when currently muted', () => {
      setMusicMuted(true);
      const result = toggleMusicMuted();

      expect(result).toBe(false);
      expect(getMusicMuted()).toBe(false);
    });

    it('should notify listeners when toggling', () => {
      const unsubscribe = subscribe(mockListener);
      
      toggleMusicMuted();

      expect(mockListener).toHaveBeenCalledWith(true);
      
      unsubscribe();
    });
  });

  describe('setMusicMuted', () => {
    it('should mute music when setting to true', () => {
      setMusicMuted(true);

      expect(getMusicMuted()).toBe(true);
    });

    it('should unmute music when setting to false', () => {
      setMusicMuted(false);

      expect(getMusicMuted()).toBe(false);
    });

    it('should not change state if already in desired state', () => {
      // Estado inicial es false
      setMusicMuted(false);

      expect(getMusicMuted()).toBe(false);
    });

    it('should notify listeners when changing state', () => {
      const unsubscribe = subscribe(mockListener);
      
      setMusicMuted(true);

      expect(mockListener).toHaveBeenCalledWith(true);
      
      unsubscribe();
    });

    it('should handle boolean conversion correctly', () => {
      setMusicMuted(1); // Truthy value
      expect(getMusicMuted()).toBe(true);

      setMusicMuted(0); // Falsy value
      expect(getMusicMuted()).toBe(false);

      setMusicMuted('true'); // String truthy
      expect(getMusicMuted()).toBe(true);

      setMusicMuted(''); // String falsy
      expect(getMusicMuted()).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('should add listener to subscription list', () => {
      const unsubscribe = subscribe(mockListener);
      
      setMusicMuted(true);

      expect(mockListener).toHaveBeenCalledWith(true);
      
      unsubscribe();
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = subscribe(mockListener);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });

    it('should remove listener when unsubscribe is called', () => {
      const unsubscribe = subscribe(mockListener);
      
      // Primera notificación
      setMusicMuted(true);
      expect(mockListener).toHaveBeenCalledTimes(1);
      
      // Desuscribirse
      unsubscribe();
      
      // Segunda notificación (no debería ser llamada)
      setMusicMuted(false);
      expect(mockListener).toHaveBeenCalledTimes(1); // Sigue siendo 1
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      const unsubscribe1 = subscribe(listener1);
      const unsubscribe2 = subscribe(listener2);
      
      setMusicMuted(true);

      expect(listener1).toHaveBeenCalledWith(true);
      expect(listener2).toHaveBeenCalledWith(true);
      
      unsubscribe1();
      unsubscribe2();
    });

    it('should handle removing non-existent listeners gracefully', () => {
      const unsubscribe = subscribe(mockListener);
      
      unsubscribe(); // Primera vez
      unsubscribe(); // Segunda vez (no debería fallar)
      
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should handle multiple unsubscribes for same listener', () => {
      const unsubscribe1 = subscribe(mockListener);
      const unsubscribe2 = subscribe(mockListener);
      
      unsubscribe1();
      unsubscribe2();
      
      setMusicMuted(true);
      
      // El listener no debería haber sido llamado porque ambas suscripciones fueron canceladas
      expect(mockListener).toHaveBeenCalledTimes(0);
    });
  });

  describe('State Management', () => {
    it('should maintain state across multiple calls', () => {
      setMusicMuted(true);
      expect(getMusicMuted()).toBe(true);
      
      setMusicMuted(false);
      expect(getMusicMuted()).toBe(false);
      
      setMusicMuted(true);
      expect(getMusicMuted()).toBe(true);
    });

    it('should handle rapid state changes', () => {
      setMusicMuted(true);
      setMusicMuted(false);
      setMusicMuted(true);
      setMusicMuted(false);
      
      expect(getMusicMuted()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined listeners gracefully', () => {
      expect(() => subscribe(null)).not.toThrow();
      expect(() => subscribe(undefined)).not.toThrow();
      expect(() => subscribe('not a function')).not.toThrow();
    });

    it('should handle listeners that throw errors', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      
      const unsubscribe = subscribe(errorListener);
      
      // No debería fallar
      expect(() => setMusicMuted(true)).not.toThrow();
      
      unsubscribe();
    });

    it('should handle multiple rapid subscriptions and unsubscriptions', () => {
      const listeners = [];
      const unsubscribes = [];
      
      // Crear múltiples listeners
      for (let i = 0; i < 10; i++) {
        const listener = vi.fn();
        listeners.push(listener);
        unsubscribes.push(subscribe(listener));
      }
      
      // Cambiar estado
      setMusicMuted(true);
      
      // Verificar que todos fueron notificados
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledWith(true);
      });
      
      // Desuscribir todos
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when listeners are unsubscribed', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);
      
      setMusicMuted(true);
      expect(listener).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      
      // Cambiar estado múltiples veces
      for (let i = 0; i < 10; i++) {
        setMusicMuted(i % 2 === 0);
      }
      
      // El listener no debería haber sido llamado más veces
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
}); 