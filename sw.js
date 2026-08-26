const CACHE_NAME = 'smp-cache-v7';

const urlsToCache = [
  './index.html',
  './SMP Circular.png'
];

/* =====================================================
   INSTALACIÓN
   Guarda una copia básica para poder abrir el portal
   incluso si temporalmente no hay conexión.
   ===================================================== */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );

  // El nuevo Service Worker se activa inmediatamente
  self.skipWaiting();
});


/* =====================================================
   ACTIVACIÓN
   Elimina automáticamente todas las versiones
   anteriores del caché.
   ===================================================== */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Toma control inmediato de las pestañas abiertas
  self.clients.claim();
});


/* =====================================================
   PETICIONES
   Para las páginas HTML:
   primero consulta Internet.
   Si hay una versión nueva, la muestra y actualiza caché.
   Si no hay Internet, utiliza la copia guardada.
   ===================================================== */
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') {
    return;
  }

  // Las navegaciones siempre buscan primero
  // la versión más reciente en Internet.
  if (event.request.mode === 'navigate') {

    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {

          const copia = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put('./index.html', copia);
            });

          return response;
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );

    return;
  }


  /* ===================================================
     Otros archivos (imágenes, etc.)
     Se pueden utilizar desde caché para mantener
     rapidez, pero se actualizan en segundo plano.
     =================================================== */
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        const networkFetch = fetch(event.request)
          .then(networkResponse => {

            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              const copia = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, copia);
                });
            }

            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
  );
});
