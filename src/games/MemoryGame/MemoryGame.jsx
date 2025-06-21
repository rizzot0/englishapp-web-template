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
  const [isChecking, setIsChecking] = useState(false);

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
    if (isChecking || flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return;
    }

    playSound('cardFlip.wav');

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
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
          
          setFlipped([]);
          setIsChecking(false);
          return updated;
        });
        setScore(prev => prev + 1);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  return (
    <div className="memory-game">
      <h2>Puntaje: {score}</h2>
      <div className="grid">
        {cards.map((card, index) => {
          const isFlipping = flipped.includes(index);
          const isMatched = matched.includes(card.id);
          const isFlipped = isFlipping || isMatched;

          return (
            <div
              key={card.uid}
              className="card"
              onClick={() => handleClick(index)}
            >
              <motion.div
                className="card-inner"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="card-face card-front">
                  <span>❓</span>
                </div>

                <div className={`card-face card-back ${isMatched ? 'matched' : ''} ${isFlipping && !isMatched ? 'flipping' : ''}`}>
                  {card.type === 'image' ? (
                    <img src={`/assets/images/${card.value}`} alt={card.id} />
                  ) : (
                    <span>{card.value}</span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {!showWin && (
        <button className="play-btn" onClick={() => window.location.reload()}>
          Reiniciar juego
        </button>
      )}

      <AnimatePresence>
        {showWin && (
          <motion.div
            className="win-popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div>
              <h2>🎉 ¡Ganaste!</h2>
              <p>Has encontrado todos los pares</p>
              <button onClick={() => navigate('/')}>Volver al menú</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryGame;
