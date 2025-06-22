import { setVolume, getVolume, DEFAULT_MUSIC_VOLUME } from './soundManager';

const listeners = new Set();
// Inicializamos como 'false' para romper la dependencia circular en la carga inicial.
// El estado real se sincronizará con la interacción del usuario.
let isMuted = false;

const notifyListeners = () => {
  listeners.forEach(listener => listener(isMuted));
};

export const getMusicMuted = () => isMuted;

export const toggleMusicMuted = () => {
  const currentVolume = getVolume('music');
  if (currentVolume > 0) {
    setVolume('music', 0);
    isMuted = true;
  } else {
    setVolume('music', DEFAULT_MUSIC_VOLUME); // Usar el volumen por defecto
    isMuted = false;
  }
  notifyListeners();
  return isMuted;
};

export const setMusicMuted = (value) => {
  const shouldMute = !!value;
  if (isMuted !== shouldMute) {
    if (shouldMute) {
      setVolume('music', 0);
    } else {
      setVolume('music', DEFAULT_MUSIC_VOLUME); // Usar el volumen por defecto
    }
    isMuted = shouldMute;
    notifyListeners();
  }
};

export const subscribe = (listener) => {
  listeners.add(listener);
  // Devuelve una función para desuscribirse
  return () => {
    listeners.delete(listener);
  };
};
