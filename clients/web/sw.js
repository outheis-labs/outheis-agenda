// Offline shell: the app itself is cached; API requests always go to the network.
const CACHE = "agenda-shell-0.9.6-034f9033";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const isShell = e.request.method === "GET" && url.origin === location.origin &&
    (url.pathname === "/" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/manifest.webmanifest") || url.pathname.endsWith(".png") || url.pathname.endsWith(".ico"));
  if (!isShell) return;
  // Network first, cache as fallback, so updates arrive when online.
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
