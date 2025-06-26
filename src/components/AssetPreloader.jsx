import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AssetPreloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Lista de assets críticos para precargar
  const criticalAssets = [
    // Sonidos principales
    '/assets/sounds/background.wav',
    '/assets/sounds/correct.wav',
    '/assets/sounds/incorrect.wav',
    '/assets/sounds/win.wav',
    
    // Imágenes de iconos principales
    '/assets/images/icon_memory.webp',
    '/assets/images/icon_typing.webp',
    '/assets/images/icon_math.webp',
    '/assets/images/icon_order.webp',
    '/assets/images/icon_soundmatching.webp',
    '/assets/images/eye.webp',
    
    // Imágenes de frutas (más usadas)
    '/assets/images/apple.webp',
    '/assets/images/banana.webp',
    '/assets/images/orange.webp',
    '/assets/images/grape.webp',
  ];

  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = criticalAssets.length;

    const loadAsset = (url) => {
      return new Promise((resolve, reject) => {
        if (url.includes('.wav')) {
          // Cargar audio
          const audio = new Audio();
          audio.oncanplaythrough = () => {
            loadedCount++;
            setProgress((loadedCount / totalAssets) * 100);
            resolve();
          };
          audio.onerror = reject;
          audio.src = url;
        } else {
          // Cargar imagen
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            setProgress((loadedCount / totalAssets) * 100);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        }
      });
    };

    const loadAllAssets = async () => {
      try {
        await Promise.allSettled(criticalAssets.map(loadAsset));
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      } catch (error) {
        console.warn('Some assets failed to preload:', error);
        setIsComplete(true);
        onComplete?.();
      }
    };

    loadAllAssets();
  }, [onComplete]);

  if (isComplete) return null;

  return (
    <motion.div
      className="asset-preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="preloader-content">
        <motion.div
          className="preloader-logo"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎓
        </motion.div>
        <h2>EnglishApp</h2>
        <p>Cargando recursos...</p>
        
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    </motion.div>
  );
};

export default AssetPreloader; 