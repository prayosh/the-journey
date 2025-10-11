const CACHE_NAME = 'the-journey-cache-v2';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  // External dependencies
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@100..900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use non-blocking addAll and handle potential CORS issues with CDN resources
        const promises = URLS_TO_CACHE.map(url => {
            return cache.add(new Request(url, { mode: 'no-cors' })).catch(err => {
                console.warn('Failed to cache:', url, err);
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // For navigation requests, always try network first, then cache, for freshest content.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For other requests (CSS, JS, images), use cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            if (response.type === 'opaque' || response.type === 'cors' || response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        ).catch(err => {
            console.error('Fetch failed; resource not in cache.', err);
        });
      })
    );
});
