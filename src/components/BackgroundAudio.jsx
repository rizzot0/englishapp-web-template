import { useEffect } from 'react';
import { playSound } from '../utils/soundManager';
import { getMusicMuted } from '../utils/musicState';

export default function BackgroundAudio() {
  useEffect(() => {
    // El sonido de fondo ya se precarga en soundManager.js

    const handleFirstInteraction = () => {
      // Si la música no está muteada, la reproducimos.
      // playSound se encarga de no hacer nada si ya está sonando.
      if (!getMusicMuted()) {
        playSound('background.wav');
      }
      
      // Removemos los listeners después de la primera interacción
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return null;
}
