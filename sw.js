// Offline shell: the page opens without network; data always comes live from Supabase.
const CACHE = "zendo-v3";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("supabase.co")) return; // never cache API/auth
  const isPage = req.mode === "navigate";
  if (isPage || url.origin === location.origin) {
    // network first, so updates show up right away; fall back to cache offline
    e.respondWith(fetch(req, {cache: "no-cache"}).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(isPage ? "index.html" : req, copy)); return r; })
      .catch(() => caches.match(isPage ? "index.html" : req)));
    return;
  }
  e.respondWith(caches.match(req).then(m => m || fetch(req)));
});
