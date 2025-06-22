import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registrado exitosamente:', registration.scope);
          })
          .catch((error) => {
            console.log('Error al registrar SW:', error);
          });
      });
    }
  }, []);
}; 