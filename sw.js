const CACHE_NAME = 'physlab-10-offline-v3';

const ASSETS_TO_CACHE = new Array(
    './',
    './index.html',
    './style.css',
    './lab-tools.js',
    './manifest.json',
    './banner-physlab.png',
    './parabola.html',
    './parabola.js',
    './pegas.html',
    './pegas.js',
    './bidang-miring.html',
    './bidang-miring.js',
    './bandul.html',
    './bandul.js',
    './energi.html',
    './energi.js'
);

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cache) {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            return cachedResponse || fetch(event.request);
        })
    );
});
