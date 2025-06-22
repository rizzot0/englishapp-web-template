import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

import { ThemeProvider } from './utils/themeContext.jsx';
import { useServiceWorker } from './utils/useServiceWorker';
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
import BackgroundAudio from './components/BackgroundAudio.jsx';
import MusicToggle from './components/MusicToggle.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import FloatingParticles from './components/FloatingParticles.jsx';
import VolumeControls from './components/VolumeControls.jsx';
import SoundMatchingThemeSelector from './pages/SoundMatchingThemeSelector.jsx';
import SoundMatchingGame from './games/SoundMatching/SoundMatchingGame.jsx';
import IdentificationThemeSelector from './pages/IdentificationThemeSelector.jsx';
import IdentificationGame from './games/IdentificationGame/IdentificationGame.jsx';
import Statistics from './pages/Statistics.jsx';
import AssetPreloader from './components/AssetPreloader.jsx';

// Componente para registrar el service worker
const ServiceWorkerRegistration = () => {
  useServiceWorker();
  return null;
};

const App = () => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  if (!assetsLoaded) {
    return <AssetPreloader onComplete={() => setAssetsLoaded(true)} />;
  }

  return (
    <ThemeProvider>
      <ServiceWorkerRegistration />
      <BackgroundAudio />
      <MusicToggle />
      <ThemeToggle />
      <VolumeControls />
      <FloatingParticles />

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
          <Route path="/sound-matching-theme" element={<SoundMatchingThemeSelector />} />
          <Route path="/sound-matching" element={<SoundMatchingGame />} />
          <Route path="/identification-theme" element={<IdentificationThemeSelector />} />
          <Route path="/identification-game" element={<IdentificationGame />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
