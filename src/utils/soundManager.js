// src/utils/soundManager.js
import { getMusicMuted } from './musicState';

const sounds = {};
export const loadSound = (name, volume = 1, loop = false) => {
  const audio = new Audio(`/src/assets/sounds/${name}`);
  audio.volume = volume;
  audio.loop = loop;
  sounds[name] = audio;
};

export const playSound = (name) => {
  if (getMusicMuted()) return;
  const sound = sounds[name];
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
};


export const stopSound = (name) => {
  const sound = sounds[name];
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
  }
};

export const stopAllSounds = () => {
  Object.values(sounds).forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
};
