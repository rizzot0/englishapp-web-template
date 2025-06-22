import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  onLoad, 
  onError,
  preload = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (preload) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
    }
  }, [src, preload]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <motion.div
      className={`optimized-image-container ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      {hasError && (
        <div className="image-error">
          <span>⚠️</span>
        </div>
      )}
    </motion.div>
  );
};

export default OptimizedImage; 