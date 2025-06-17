import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

import Home from './pages/Home.jsx';
import MemoryGame from './games/MemoryGame/MemoryGame.jsx';
import MemoryThemeSelector from './pages/MemoryThemeSelector.jsx';
import TypingThemeSelector from './pages/TypingThemeSelector.jsx';
import TypingGame from './games/TypingGame/TypingGame.jsx';
import MathThemeSelector from './pages/MathThemeSelector.jsx';
import MathGame from './games/MathGame/MathGame.jsx';
import SortingThemeSelector from './pages/SortingThemeSelector.jsx';
import SortingGame from './games/SortingGame/SortingGame.jsx';
import Instructions from './pages/Instructions.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memory-theme" element={<MemoryThemeSelector />} />
        <Route path="/memory" element={<MemoryGame />} />
        <Route path="/typing-theme" element={<TypingThemeSelector />} />
        <Route path="/typing" element={<TypingGame />} />
        <Route path="/math-theme" element={<MathThemeSelector />} />
        <Route path="/math" element={<MathGame />} />
        <Route path="/sorting-theme" element={<SortingThemeSelector />} />
        <Route path="/sorting" element={<SortingGame />} />
        <Route path="/instructions" element={<Instructions />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
