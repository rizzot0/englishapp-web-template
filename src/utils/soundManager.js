// src/utils/soundManager.js
import { Howl, Howler } from 'howler';
import { getMusicMuted } from './musicState';

export const DEFAULT_MUSIC_VOLUME = 0.2;
export const DEFAULT_SFX_VOLUME = 0.5;

const sounds = {};
const soundConfig = {
  music: { volume: DEFAULT_MUSIC_VOLUME },
  sfx: { volume: DEFAULT_SFX_VOLUME },
};

const getSoundCategory = (name) => {
  return name.includes('background') ? 'music' : 'sfx';
};

export const loadSound = (name, loop = false) => {
  if (sounds[name]) return;

  const category = getSoundCategory(name);
  const sound = new Howl({
    src: [`/assets/sounds/${name}`],
    loop: loop,
    volume: soundConfig[category].volume,
    html5: true,
  });
  sounds[name] = sound;
};

export const playSound = (name) => {
  if (getMusicMuted() && getSoundCategory(name) === 'music') {
    return;
  }

  let sound = sounds[name];
  if (sound) {
    if (!sound.playing()) {
      sound.play();
    }
  } else {
    // Si no está cargado, lo cargamos y reproducimos
    loadSound(name);
    sound = sounds[name];
    sound.play();
  }
};

export const stopSound = (name) => {
  const sound = sounds[name];
  if (sound && sound.playing()) {
    sound.stop();
  }
};

export const setVolume = (category, volume) => {
  if (soundConfig[category]) {
    soundConfig[category].volume = volume;
    Object.keys(sounds).forEach(name => {
      if (getSoundCategory(name) === category) {
        sounds[name].volume(volume);
      }
    });
  }
};

export const getVolume = (category) => {
  return soundConfig[category] ? soundConfig[category].volume : 0;
};

// Cargar sonido de fondo por defecto
loadSound('background.wav', true);
