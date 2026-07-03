const CACHE_NAME = "meteo-pwa-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./home.html",
  "./qr.html",
  "./event.html",
  "./news.html",
  "./contact.html",
  "./about.html",
  "./terms.html",
  "./privacy.html",
  "./settings.html",

  "./manifest.json",

  "./css/style.css",
  "./css/login.css",
  "./css/news.css",
  "./css/event.css",
  "./css/contact.css",
  "./css/about.css",
  "./css/terms.css",
  "./css/settings.css",

  "./js/login.js",
  "./js/home.js",
  "./js/news.js",
  "./js/event.js",
  "./js/contact.js",
  "./js/about.js",
  "./js/terms.js",
  "./js/settings.js",
  "./js/qr.js",
  "./js/qrcode.min.js",
  "./js/install-guide.js",

  "./images/logo.png",
  "./images/logo-horizontal.png",
  "./images/icon-192.png",
  "./images/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => caches.match("./index.html"))
      );
    })
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});