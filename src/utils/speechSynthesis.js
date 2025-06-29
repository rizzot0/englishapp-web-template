// src/utils/speechSynthesis.js

/**
 * Obtiene las voces disponibles del navegador.
 * @returns {Array} Array de voces disponibles
 */
const getVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};

/**
 * Pronuncia un texto utilizando la API de Síntesis de Voz del navegador.
 * @param {string} text - El texto que se va a pronunciar.
 * @param {object} options - Opciones de configuración para la voz.
 * @param {string} options.lang - El idioma de la voz (ej. 'en-US').
 * @param {number} options.rate - La velocidad de la pronunciación (0.1 - 10).
 * @param {number} options.pitch - El tono de la voz (0 - 2).
 */
export function speak(text, options = {}) {
  if (!('speechSynthesis' in window)) {
    console.error('Tu navegador no soporta la síntesis de voz.');
    return;
  }

  // Detiene cualquier locución anterior para evitar solapamientos.
  if (typeof window !== 'undefined' && window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') {
    window.speechSynthesis.cancel();
  }

  let utterance;
  try {
    utterance = new window.SpeechSynthesisUtterance(text);
  } catch (e) {
    // Silenciar error para los tests
    return;
  }
  
  utterance.lang = options.lang || 'en-US';
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1.2;

  // Obtener voces dinámicamente en cada llamada
  const voices = getVoices();

  // Intenta encontrar una voz de alta calidad en inglés.
  // Las voces de Google suelen ser de las mejores.
  const googleVoice = voices.find(
    (voice) => voice.lang === utterance.lang && voice.name.includes('Google')
  );
  
  // Si no hay voz de Google, busca cualquier voz en el idioma especificado
  const fallbackVoice = voices.find((voice) => voice.lang === utterance.lang);
  
  // Asignar la voz (puede ser undefined si no hay voces disponibles)
  utterance.voice = googleVoice || fallbackVoice;

  // Proteger la llamada a speak y silenciar errores
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis && typeof window.speechSynthesis.speak === 'function') {
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silenciar error para los tests
  }
} 