const CACHE_NAME = "lasued-v4";

const ASSETS = [
  "/",
  "/index.html",
  "/COS121.html",
  "/LASUED-CSC124.html",
  "/Practice-csc124.html",
  "/LASUED-CSC125.html",
  "/lasued.png",
  "/student.jpg",
  "/manifest.json"
];

// 📦 Install — Cache all core assets
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Caching app shell");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 🧹 Activate — Clean old caches
self.addEventListener("activate", (event) => {
  console.log("🧹 Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🌐 Fetch — Cache-first with network fallback (full offline support)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache the new response for later
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both cache and network fail, return the homepage
          return caches.match("/index.html");
        });
    })
  );
});