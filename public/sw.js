// SW mínimo para instalabilidad. No cachear datos de Firebase bajo ningún concepto.

const CACHE_VERSION = "v1";
const STATIC_CACHE = `cofound-static-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/CoFoundUE_logo.png",
  "/CoFoundUE_banner.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo interceptar peticiones GET
  if (request.method !== "GET") {
    return;
  }

  // NUNCA cachear Firebase, Google APIs, ni rutas de API
  const isExcluded =
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("firestore") ||
    url.hostname.includes("identitytoolkit") ||
    url.hostname.includes("securetoken") ||
    url.pathname.startsWith("/api/");

  if (isExcluded) {
    return;
  }

  // Cache-first SOLO para estáticos propios definidos
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname === "/CoFoundUE_logo.png" ||
      url.pathname === "/CoFoundUE_banner.png" ||
      url.pathname.startsWith("/icons/"));

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first para todo lo demás
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
