import React, { useState } from 'react';
import { setVolume, getVolume } from '../utils/soundManager';
import './VolumeControls.css';

const VolumeControls = () => {
  const [musicVolume, setMusicVolume] = useState(getVolume('music'));
  const [sfxVolume, setSfxVolume] = useState(getVolume('sfx'));

  const handleMusicVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    setVolume('music', newVolume);
  };

  const handleSfxVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setSfxVolume(newVolume);
    setVolume('sfx', newVolume);
  };

  return (
    <div className="volume-controls-container">
      <div className="volume-slider">
        <label>Music</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicVolume}
          onChange={handleMusicVolumeChange}
          aria-label="Music volume"
        />
      </div>
      <div className="volume-slider">
        <label>Sound Effects</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sfxVolume}
          onChange={handleSfxVolumeChange}
          aria-label="Sound effects volume"
        />
      </div>
    </div>
  );
};

export default VolumeControls; 