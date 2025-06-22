import { useState, useEffect } from 'react';
import { stopSound, playSound } from '../utils/soundManager';
import { toggleMusicMuted, getMusicMuted, subscribe } from '../utils/musicState';
import { motion } from 'framer-motion';
import './MusicToggle.css'; // lo crearemos después

export default function MusicToggle() {
  const [muted, setMuted] = useState(getMusicMuted());

  useEffect(() => {
    // Nos suscribimos a los cambios del estado de la música
    const unsubscribe = subscribe((newMutedState) => {
      setMuted(newMutedState);
    });

    // Nos desuscribimos al desmontar el componente para evitar fugas de memoria
    return () => {
      unsubscribe();
    };
  }, []); // El array vacío asegura que esto solo se ejecute una vez

  const handleClick = () => {
    const isNowMuted = toggleMusicMuted();
    // setMuted(isNowMuted); // Ya no es necesario, el listener lo hará

    if (isNowMuted) {
      stopSound('background.wav');
    } else {
      playSound('background.wav');
    }
  };

  return (
    <motion.button 
      className={`music-toggle ${muted ? 'muted' : ''}`} 
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.5 
      }}
    >
      <motion.span
        animate={{ 
          rotate: muted ? 0 : [0, 10, -10, 0],
          scale: muted ? 1 : [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: muted ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        {muted ? '🔇' : '🎵'}
      </motion.span>
    </motion.button>
  );
}
