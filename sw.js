const CACHE_NAME = 'the-journey-cache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@100..900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use non-blocking addAll
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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Check if the request is for a CDN resource. If so, it will be an opaque response.
            if (response.type === 'opaque' || response.type === 'cors' || response.type === 'basic') {
                // Clone the response because it's also a stream.
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        ).catch(err => {
            console.error('Fetch failed; returning offline page instead.', err);
            // Optionally, return a fallback offline page here
            // For example: return caches.match('/offline.html');
        });
      })
    );
});