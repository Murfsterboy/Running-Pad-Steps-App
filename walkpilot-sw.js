// WalkPilot service worker: network first (so updates show straight away), cached copy when offline.
const CACHE = 'walkpilot-v27';
const FILES = ['walkpilot.html', 'walkpilot.webmanifest', 'wp-icon-192.png', 'wp-icon-512.png', 'wp-icon-maskable-512.png', 'wp-logo.png', 'privacy.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // cache:'no-cache' makes the browser check GitHub for a newer file every time, instead of reusing its own 10-minute copy
  e.respondWith(fetch(e.request, {cache:'no-cache'}).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});
// Tapping a WalkPilot notification opens (or focuses) the app on the right page, e.g. the weekly update.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const go = (e.notification.data && e.notification.data.go) || '';
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    for (const c of cs) { if (c.url.includes('walkpilot')) { c.postMessage({go}); return c.focus(); } }
    return self.clients.openWindow('walkpilot.html' + (go ? '#go=' + go : ''));
  }));
});
