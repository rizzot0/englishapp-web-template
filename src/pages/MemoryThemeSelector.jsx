// src/pages/MemoryThemeSelector.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemoryThemeSelector.css';

export default function MemoryThemeSelector() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('');

  const themes = [
    { name: 'Colors', value: 'colors' },
    { name: 'Shapes', value: 'shapes' },
    { name: 'Emotions', value: 'emotions' },
    { name: 'Fruits', value: 'fruits' }
  ];

  const handlePlay = () => {
    if (theme) {
      navigate(`/memory?theme=${theme}`);
    }
  };

  return (
    <div className="theme-selector">
      <h2>Selecciona una temática:</h2>
      {themes.map((t) => (
        <button
          key={t.value}
          className={`theme-btn ${theme === t.value ? 'active' : ''}`}
          onClick={() => setTheme(t.value)}
        >
          {t.name}
        </button>
      ))}
      <button className="play-btn" onClick={handlePlay}>Jugar</button>
    </div>
  );
}
