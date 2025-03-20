const CACHE_NAME = 'boutique-cache-v1';
const CACHED_URLS = [
  '/api/products',
  '/api/products/new-collection'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHED_URLS))
  );
});

// Cache first, then network strategy with proper response cloning
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache GET requests for images, videos, and API calls
  if (event.request.method === 'GET' && 
      (url.pathname.startsWith('/api/') || 
       event.request.url.startsWith('data:image/') || 
       event.request.url.startsWith('data:video/'))) {

    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request).then((networkResponse) => {
            // Only cache successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              // Only cache smaller responses (< 50MB)
              responseToCache.blob().then(blob => {
                if (blob.size < 50 * 1024 * 1024) {
                  cache.put(event.request, responseToCache);
                }
              });
            });

            return networkResponse;
          });
        })
    );
  }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});