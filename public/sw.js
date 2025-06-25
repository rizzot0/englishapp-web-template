const CACHE_NAME = 'englishapp-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/sounds/background.wav',
  '/assets/sounds/correct.wav',
  '/assets/sounds/incorrect.wav',
  '/assets/sounds/win.wav',
  '/assets/sounds/typing.wav',
  '/assets/sounds/cardFlip.wav',
  '/assets/images/icon_memory.png',
  '/assets/images/icon_typing.png',
  '/assets/images/icon_math.png',
  '/assets/images/icon_order.png',
  '/assets/images/icon_sound.png',
  '/assets/images/eye.png'
];

// Evento de instalación: se dispara cuando el SW se instala.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento fetch: se dispara con cada petición de red.
// Este es el paso CRUCIAL que faltaba.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la petición está en caché, la devolvemos. Si no, la buscamos en la red.
        return response || fetch(event.request);
      })
  );
});

// Evento de activación: se dispara cuando el SW se activa.
// Útil para limpiar cachés antiguos.
self.addEventListener('activate', event => {
  clients.claim();
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 