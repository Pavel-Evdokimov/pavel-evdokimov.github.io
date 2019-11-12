// Files to cache
let cacheName = "pcouchdb-v1";
let appShellFiles = [
  "/",
  "/index.html",
  "/beacon.js",
  "/main.js",
  "/style.css",
  "/fonts/graduate.eot",
  "/fonts/graduate.ttf",
  "/fonts/graduate.woff",
  "/favicon.ico",
  "/img/aslogo.png",
  "/img/bg.png",
  "/icons/icon-32.png",
  "/icons/icon-64.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-168.png",
  "/icons/icon-192.png",
  "/icons/icon-256.png",
  "/icons/icon-512.png",
  "/pwa.webmanifest"
];

// Installing Service Worker
self.addEventListener("install", function(e) {
  console.log("[Service Worker] Install");
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("[Service Worker] Caching all: app shell and content");
      return cache.addAll(appShellFiles);
    })
  );
});

// Fetching content using Service Worker
self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      console.log("[Service Worker] Fetching resource: " + e.request.url);
      return (
        r ||
        fetch(e.request).then(function(response) {
          return caches.open(cacheName).then(function(cache) {
            console.log(
              "[Service Worker] Caching new resource: " + e.request.url
            );
            // cache.put(e.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
