// src/utils/speechSynthesis.js

// Almacena las voces disponibles para no tener que cargarlas cada vez.
let voices = [];

/**
 * Carga las voces del navegador. Es necesario hacerlo una vez,
 * ya que la lista de voces se carga de forma asíncrona.
 */
const loadVoices = () => {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
    };
  }
  voices = window.speechSynthesis.getVoices();
};

loadVoices();

/**
 * Pronuncia un texto utilizando la API de Síntesis de Voz del navegador.
 * @param {string} text - El texto que se va a pronunciar.
 * @param {object} options - Opciones de configuración para la voz.
 * @param {string} options.lang - El idioma de la voz (ej. 'en-US').
 * @param {number} options.rate - La velocidad de la pronunciación (0.1 - 10).
 * @param {number} options.pitch - El tono de la voz (0 - 2).
 */
export const speak = (text, { lang = 'en-US', rate = 0.9, pitch = 1.2 } = {}) => {
  if (!('speechSynthesis' in window)) {
    console.error('Tu navegador no soporta la síntesis de voz.');
    return;
  }

  // Detiene cualquier locución anterior para evitar solapamientos.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Intenta encontrar una voz de alta calidad en inglés.
  // Las voces de Google suelen ser de las mejores.
  const aGoodVoice = voices.find(
    (voice) => voice.lang === lang && voice.name.includes('Google')
  );
  
  utterance.voice = aGoodVoice || voices.find((voice) => voice.lang === lang);

  window.speechSynthesis.speak(utterance);
}; 