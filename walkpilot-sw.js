// WalkPilot service worker: network first (so updates show straight away), cached copy when offline.
const CACHE = 'walkpilot-v15';
const FILES = ['walkpilot.html', 'walkpilot.webmanifest', 'walkpilot-192.png', 'walkpilot-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // cache:'no-cache' makes the browser check GitHub for a newer file every time, instead of reusing its own 10-minute copy
  e.respondWith(fetch(e.request, {cache:'no-cache'}).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});
