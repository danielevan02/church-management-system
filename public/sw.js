// Member portal service worker.
// Strategy:
//   - Cache the offline shell on install.
//   - Network-first for member-portal navigations, with offline-page fallback.
//   - Stale-while-revalidate for static assets (images, fonts, _next/static).
//   - Bypass: API routes, auth flows, and admin pages — never cache those.

const CACHE_VERSION = "v3";
const SHELL_CACHE = `chms-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `chms-assets-${CACHE_VERSION}`;
const OFFLINE_URL = "/me/offline";

const SHELL_URLS = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/badge-72.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API, auth, admin, or webhooks
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.includes("/admin") ||
    url.pathname.startsWith("/_next/data")
  ) {
    return;
  }

  // Navigation request → network-first with offline fallback (member pages only)
  if (req.mode === "navigate") {
    if (!isMemberPath(url.pathname)) return;
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) => cached || caches.match(OFFLINE_URL),
          ),
        ),
    );
    return;
  }

  // Static assets → stale-while-revalidate
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icon-") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});

function isMemberPath(pathname) {
  // Match /me/* or /<locale>/me/* (we treat any 2-letter prefix as locale)
  return /^\/(?:[a-z]{2}\/)?me(?:\/|$)/.test(pathname);
}

// =====================================================================
// Web Push
// =====================================================================

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Pengumuman baru";
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    tag: payload.tag || "announcement",
    data: { url: payload.url || "/me/announcements" },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/me/announcements";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing /me/* window and navigate it.
        for (const client of clientList) {
          const url = new URL(client.url);
          if (isMemberPath(url.pathname) && "focus" in client) {
            return client.focus().then((c) => {
              if ("navigate" in c) return c.navigate(targetUrl);
              return c;
            });
          }
        }
        // Otherwise open a new window.
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
