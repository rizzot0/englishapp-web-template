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
  const soundUrl = `/assets/sounds/${name}`;
  
  console.log(`Loading sound: ${name} from ${soundUrl}`);
  
  const sound = new Howl({
    src: [soundUrl],
    loop: loop,
    volume: soundConfig[category].volume,
    html5: true,
    onload: () => {
      console.log(`Sound loaded successfully: ${name}`);
    },
    onloaderror: (id, error) => {
      console.error(`Failed to load sound: ${name}`, error);
    },
    onplayerror: (id, error) => {
      console.error(`Failed to play sound: ${name}`, error);
      // Intentar cargar de nuevo
      sound.once('unlock', () => {
        sound.play();
      });
    }
  });
  
  sounds[name] = sound;
};

export const playSound = (name) => {
  if (getMusicMuted() && getSoundCategory(name) === 'music') {
    console.log(`Music is muted, skipping: ${name}`);
    return;
  }

  let sound = sounds[name];
  if (sound) {
    if (!sound.playing()) {
      console.log(`Playing sound: ${name}`);
      sound.play();
    }
  } else {
    // Si no está cargado, lo cargamos y reproducimos
    console.log(`Sound not loaded, loading and playing: ${name}`);
    loadSound(name);
    sound = sounds[name];
    if (sound) {
      sound.once('load', () => {
        sound.play();
      });
    }
  }
};

export const stopSound = (name) => {
  const sound = sounds[name];
  if (sound && sound.playing()) {
    console.log(`Stopping sound: ${name}`);
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

// Precargar sonidos críticos
export const preloadCriticalSounds = () => {
  const criticalSounds = [
    'background.wav',
    'correct.wav',
    'incorrect.wav',
    'win.wav',
    'typing.wav',
    'cardFlip.wav'
  ];
  
  criticalSounds.forEach(sound => {
    loadSound(sound, sound === 'background.wav');
  });
};

// Inicializar sonidos
preloadCriticalSounds();
