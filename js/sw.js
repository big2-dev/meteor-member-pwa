const CACHE_NAME = "meteo-pwa-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./home.html",
  "./qr.html",
  "./event.html",
  "./news.html",
  "./point.html",
  "./contact.html",
  "./about.html",
  "./terms.html",
  "./privacy.html",
  "./settings.html",

  "./css/style.css",
  "./css/login.css",
  "./css/news.css",
  "./css/event.css",
  "./css/point.css",
  "./css/contact.css",
  "./css/about.css",
  "./css/terms.css",
  "./css/settings.css",

  "./js/login.js",
  "./js/home.js",
  "./js/news.js",
  "./js/event.js",
  "./js/point.js",
  "./js/contact.js",
  "./js/about.js",
  "./js/terms.js",
  "./js/settings.js",
  "./js/qr.js",

  "./images/logo.png",
  "./images/logo-horizontal.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
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
});