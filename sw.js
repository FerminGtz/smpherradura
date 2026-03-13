const CACHE_NAME = 'smp-cache-v1';
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
        console.log('Archivos en caché guardados');
        return cache.addAll(urlsToCache);
      })
  );
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
