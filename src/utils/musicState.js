let isMuted = false;
const listeners = [];

/**
 * Obtiene el estado actual de silencio de la música
 * @returns {boolean} true si la música está silenciada, false en caso contrario
 */
export const getMusicMuted = () => {
  return isMuted;
};

/**
 * Cambia el estado de silencio de la música
 * @returns {boolean} El nuevo estado de silencio
 */
export const toggleMusicMuted = () => {
  isMuted = !isMuted;
  notifyListeners();
  return isMuted;
};

/**
 * Establece el estado de silencio de la música
 * @param {boolean} muted - true para silenciar, false para activar
 */
export const setMusicMuted = (muted) => {
  const newMuted = Boolean(muted);
  if (newMuted !== isMuted) {
    isMuted = newMuted;
    notifyListeners();
  }
};

/**
 * Suscribe un listener para cambios en el estado de la música
 * @param {Function} listener - Función a llamar cuando cambie el estado
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribe = (listener) => {
  if (typeof listener === 'function') {
    listeners.push(listener);
    
    // Retornar función para cancelar suscripción
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  // Retornar función vacía si el listener no es válido
  return () => {};
};

/**
 * Notifica a todos los listeners sobre cambios en el estado
 */
const notifyListeners = () => {
  listeners.forEach(listener => {
    try {
      listener(isMuted);
    } catch (error) {
      console.error('Error en listener de música:', error);
    }
  });
};
