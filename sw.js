const CACHE_NAME = 'smp-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './SMP Circular.png'
];

// Instalar el motor y guardar los archivos básicos en el celular
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché guardados versión 2');
        return cache.addAll(urlsToCache);
      })
  );
  // Fuerza a que el nuevo Service Worker tome el control inmediatamente
  self.skipWaiting();
});

// Interceptar peticiones para que cargue ultra rápido
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si lo encuentra en la memoria del celular, lo muestra al instante. Si no, lo baja de internet.
        return response || fetch(event.request);
      })
  );
});

// Limpiar cachés viejos cuando se activa una nueva versión
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
