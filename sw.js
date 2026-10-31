// Bump the version whenever index.html changes, so phones pick up the new version.
const CACHE = 'worktimer-v11';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // cache: 'reload' bypasses the browser's HTTP cache, so an update never stores stale files
  const fresh = FILES.map(f => new Request(f, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first: works fully offline; updates arrive via a new CACHE version.
self.addEventListener('fetch', e => {
  // only our own files; Google sign-in and API calls go straight to the network
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request))
  );
});
