/*
 * Offline!  —  service worker
 *
 * De app zelf komt uit de cache, zodat hij ook werkt zonder verbinding.
 * Het weerbericht en de zoeklinks hebben internet nodig; die proberen we
 * eerst online en vallen daarna terug op wat we hebben.
 */

const CACHE = 'offline-app-v3';
const SCHIL = [
  './', './index.html', './styles.css', './manifest.json',
  './js/data.js', './js/engine.js', './js/weer.js', './js/buurt.js',
  './js/betaling.js', './js/advertenties.js', './js/samen.js',
  './js/dagboek.js', './js/app.js',
  './icons/icoon-192.png', './icons/icoon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SCHIL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Alles van buiten (weerbericht, plaatsnamen, licenties) niet cachen.
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const kopie = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, kopie));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
