const CACHE_VERSION = "v2";
const cacheName = `pomodoro-${CACHE_VERSION}`;
const contentToCache = [
	"./",
	"./index.html",
	"./index.css",
	"./index.js",
	"./worker.js",
	"./sw.js",
	"./icons/icon192.png",
	"./icons/icon512.png",
	"./icons/maskable192.png",
	"./icons/maskable512.png",
	"./site.webmanifest",
	"./icons/favicon.png",
	"./icons/appletouch.png",
	"./GitHub-Mark-64px.png"
];

self.addEventListener("install", (e) => {
	console.log("Service Worker installed");
	e.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			await cache.addAll(contentToCache).catch(err => console.error("Cache install error:", err));
		})()
	);
	// Force the waiting service worker to become the active service worker
	self.skipWaiting();
});

self.addEventListener("activate", (e) => {
	console.log("Service Worker activated");
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== cacheName) {
						console.log("Removing old cache:", key);
						return caches.delete(key);
					}
				})
			);
		})
	);
	// Take control of all pages immediately
	return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
	event.respondWith(
		// Try cache first for static assets
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				// Return cached version and update cache in background
				fetch(event.request).then((res) => {
					if (res && res.status === 200) {
						caches.open(cacheName).then((cache) => {
							cache.put(event.request, res.clone());
						});
					}
				}).catch(() => {
					// Network failed, but we have cache
				});
				return cachedResponse;
			}

			// Not in cache, fetch from network
			return fetch(event.request).then((res) => {
				if (!res || res.status !== 200 || res.type === 'error') {
					return res;
				}

				let response = res.clone();
				caches.open(cacheName).then((cache) => {
					cache.put(event.request, response);
				});
				return res;
			}).catch((err) => {
				console.error("Fetch failed:", err);
				throw err;
			});
		})
	);
});
