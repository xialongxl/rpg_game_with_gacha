const CACHE_NAME = 'static-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/css/styles.css',
        '/js/main.js',
        '/img/favicon.png'
      ]))
  );
});