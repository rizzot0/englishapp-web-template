let isMuted = false;

export const getMusicMuted = () => isMuted;

export const toggleMusicMuted = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const setMusicMuted = (value) => {
  isMuted = value;
};
