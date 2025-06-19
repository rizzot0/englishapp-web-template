import { useState } from 'react';
import { stopSound, playSound } from '../utils/soundManager';
import { toggleMusicMuted, getMusicMuted } from '../utils/musicState';
import './MusicToggle.css'; // lo crearemos después

export default function MusicToggle() {
  const [muted, setMuted] = useState(getMusicMuted());

  const handleClick = () => {
    const isNowMuted = toggleMusicMuted();
    setMuted(isNowMuted);

    if (isNowMuted) {
      stopSound('background.wav');
    } else {
      playSound('background.wav');
    }
  };

  return (
    <button className="music-toggle" onClick={handleClick}>
      {muted ? '🔇' : '🎵'}
    </button>
  );
}
