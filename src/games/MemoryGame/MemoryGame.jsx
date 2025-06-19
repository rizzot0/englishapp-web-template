// src/games/MemoryGame/MemoryGame.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './MemoryGame.css';
import { loadSound, playSound } from '../../utils/soundManager';

const themes = {
  fruits: [
    { word: 'apple', image: 'apple.png' },
    { word: 'banana', image: 'banana.png' },
    { word: 'grapes', image: 'grape.png' },
    { word: 'pear', image: 'pear.png' }
  ],
  colors: [
    { word: 'red', image: 'red.png' },
    { word: 'blue', image: 'blue.png' },
    { word: 'green', image: 'green.png' },
    { word: 'yellow', image: 'yellow.png' }
  ],
  shapes: [
    { word: 'circle', image: 'circle.png' },
    { word: 'square', image: 'square.png' },
    { word: 'star', image: 'star.png' },
    { word: 'triangle', image: 'triangle.png' }
  ],
  emotions: [
    { word: 'happy', image: 'happy.png' },
    { word: 'angry', image: 'angry.png' },
    { word: 'sad', image: 'sad.png' },
    { word: 'surprised', image: 'surprised.png' }
  ]
};

const MemoryGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedTheme = params.get('theme') || 'fruits';

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [showWin, setShowWin] = useState(false);

  const totalPairs = (themes[selectedTheme] || []).length;

  useEffect(() => {
    loadSound('cardFlip.wav');
    loadSound('correct.wav');
    loadSound('win.wav');

    const pairs = themes[selectedTheme] || themes.fruits;
    const mixed = pairs.flatMap(({ word, image }) => [
      { id: word, type: 'word', value: word },
      { id: word, type: 'image', value: image }
    ]);

    const shuffled = [...mixed].sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, uid: i }));
    setCards(shuffled);
    setMatched([]);
    setFlipped([]);
    setScore(0);
    setShowWin(false);
  }, [selectedTheme]);

  const handleClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) return;

    playSound('cardFlip.wav');

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      const c1 = cards[i1];
      const c2 = cards[i2];

      if (c1.id === c2.id && c1.type !== c2.type) {
        setMatched((prev) => {
          const updated = [...prev, c1.id];
          playSound('correct.wav');

          if (updated.length === totalPairs) {
            setTimeout(() => {
              playSound('win.wav');
              setShowWin(true);
            }, 800);
          }

          return updated;
        });

        setScore(prev => prev + 1);
      }

      setTimeout(() => setFlipped([]), 1000);
    }
  };

  return (
    <div className="memory-game">
      <h2>Puntaje: {score}</h2>
      <div className="grid">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.id);
          return (
            <div
              key={card.uid}
              className={`card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleClick(index)}
            >
              <div className="card-inner">
                <div className="card-front"></div>
                <div className="card-back">
                  {card.type === 'image' ? (
                    <img src={`/assets/images/${card.value}`} alt={card.id} />
                  ) : (
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0081A7' }}>
                      {card.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔁 Solo mostrar reiniciar si aún no se gana */}
      {!showWin && (
        <button className="play-btn" onClick={() => window.location.reload()}>
          Reiniciar juego
        </button>
      )}

      {/* 🎉 Animación de victoria */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            className="win-popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>🎉 ¡Ganaste!</h2>
            <p>Has encontrado todos los pares</p>
            <button onClick={() => navigate('/')}>Volver al menú</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryGame;
