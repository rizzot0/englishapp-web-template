import { useEffect } from 'react';
import { loadSound, playSound } from '../utils/soundManager';
import { getMusicMuted } from '../utils/musicState';

export default function BackgroundAudio() {
  useEffect(() => {
    loadSound('background.wav', 0.2, true);

    const handleFirstInteraction = () => {
      if (!getMusicMuted()) {
        playSound('background.wav');
      }
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
