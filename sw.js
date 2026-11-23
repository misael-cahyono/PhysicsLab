const CACHE_NAME = 'physlab-10-v1';

// Daftar seluruh file proyek yang akan disimpan agar bisa berjalan offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './lab-tools.js',
    './manifest.json',
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
];

// 1. Tahap Install: Menyimpan semua file ke dalam cache browser
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Tahap Activate: Menghapus cache versi lama jika ada pembaruan kode
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Tahap Fetch: Mengambil file dari memori offline jika tidak ada internet
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Gunakan file dari cache jika tersedia, jika tidak ambil dari internet
            return cachedResponse || fetch(event.request);
        })
    );
});
