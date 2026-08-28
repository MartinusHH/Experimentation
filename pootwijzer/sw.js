// Service worker: de app zelf komt uit de cache, zodat Pootwijzer ook zonder
// verbinding opent. Het weerbericht gaat altijd via het netwerk (en heeft zijn
// eigen bewaartermijn van een half uur in de app).

const CACHE = 'pootwijzer-v1';
const KERN = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  'js/app.js',
  'js/rassen.js',
  'js/leeftijd.js',
  'js/weer.js',
  'js/kennis.js',
  'js/medicatie.js',
  'js/rasgok.js',
  'js/puzzel.js',
  'js/fotostudio.js',
  'js/opslag.js',
  'js/ai.js',
  'icons/icoon.svg',
  'icons/icoon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(KERN)).then(() => self.skipWaiting()));
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
  // Weer en plaatsnamen nooit uit de cache serveren.
  if (url.hostname.endsWith('open-meteo.com') || url.hostname.endsWith('openstreetmap.org')) return;
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then((gevonden) => gevonden || fetch(e.request).then((res) => {
      const kopie = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, kopie)).catch(() => {});
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
