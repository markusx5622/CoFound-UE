// SW de producción para instalabilidad PWA y degradación elegante offline.
// Nunca cachea datos de Firebase Auth, Firestore ni rutas de API.

const CACHE_VERSION = "v3";
const STATIC_CACHE = `cofound-static-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/CoFoundUE_logo.png",
  "/CoFoundUE_banner.png",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#E60000" />
  <title>CoFound UE — Sin conexión</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      background-color: #09090b;
      color: #ffffff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 400px;
      width: 100%;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    }
    .logo {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      margin: 0 auto 20px;
      display: block;
      object-fit: cover;
      border: 1px solid #27272a;
    }
    h1 { font-size: 1.35rem; font-weight: 800; margin-bottom: 10px; }
    p { font-size: 0.9rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
    button {
      width: 100%;
      background: #E60000;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 14px 20px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
    }
    button:active { transform: scale(0.98); }
  </style>
</head>
<body>
  <div class="card">
    <img src="/CoFoundUE_logo.png" alt="CoFound UE" class="logo" />
    <h1>Sin conexión a Internet</h1>
    <p>CoFound UE necesita conexión para sincronizar los proyectos y mensajes del campus en tiempo real. Comprueba tu red y vuelve a intentarlo.</p>
    <button onclick="window.location.reload()">Reintentar conexión</button>
  </div>
</body>
</html>`;

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
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE) {
              return caches.delete(key);
            }
          })
        )
      )
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
      url.pathname === "/favicon.ico" ||
      url.pathname.startsWith("/icons/"));

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => new Response("", { status: 503, statusText: "Offline" }));
      })
    );
    return;
  }

  // Network-first con fallback elegante para navegación offline
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      if (request.mode === "navigate") {
        return new Response(OFFLINE_HTML, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      return new Response("", { status: 503, statusText: "Offline" });
    })
  );
});
