// src/games/MemoryGame/MemoryGame.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MemoryGame.css';

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

  useEffect(() => {
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
  }, [selectedTheme]);

  const handleClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      const c1 = cards[i1];
      const c2 = cards[i2];

      if (c1.id === c2.id && c1.type !== c2.type) {
        setMatched((prev) => [...prev, c1.id]);
        setScore(prev => prev + 1);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  };

  const totalPairs = (themes[selectedTheme] || []).length;
  const isGameOver = matched.length === totalPairs;

  return (
    <div className="memory-game">
      <h2>Puntaje: {score}</h2>
      <div className="grid">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.id);
          return (
            <div key={card.uid} className="card" onClick={() => handleClick(index)}>
              <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                <div className="card-front"></div>
                <div className="card-back">
                  {card.type === 'image' ? (
                    <img src={`/assets/images/${card.value}`} alt={card.id} />
                  ) : (
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0081A7' }}>{card.value}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="play-btn" onClick={() => window.location.reload()}>Reiniciar juego</button>
      {isGameOver && (
        <button className="play-btn" onClick={() => navigate('/')}>Volver al menú</button>
      )}
    </div>
  );
};

export default MemoryGame;
