const STATIC_CACHE = 'el-jasser-static-v1';
const PRODUCT_IMAGE_CACHE = 'el-jasser-product-images-v1';
const PAGE_CACHE = 'el-jasser-pages-v1';
const CACHE_PREFIX = 'el-jasser-';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, PRODUCT_IMAGE_CACHE, PAGE_CACHE].includes(name))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const trimCache = async (cache, maxEntries) => {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
  }
};

const cacheFirst = async (event, name, maxEntries) => {
  const cache = await caches.open(name);
  const cached = await cache.match(event.request);
  if (cached) return cached;

  const response = await fetch(event.request);
  if (response.ok || response.type === 'opaque') {
    const copy = response.clone();
    event.waitUntil(cache.put(event.request, copy).then(() => trimCache(cache, maxEntries)).catch(() => {}));
  }
  return response;
};

const freshPageWithOfflineFallback = async (event) => {
  const cache = await caches.open(PAGE_CACHE);
  const cachedPage = () => cache.match(event.request).then(async (match) => {
    if (match) return match;
    const keys = await cache.keys();
    return keys.length ? cache.match(keys[0]) : null;
  });
  try {
    const response = await fetch(event.request, { cache: 'no-store' });
    if (response.ok
      && new URL(response.url).origin === self.location.origin
      && response.headers.get('content-type')?.includes('text/html')) {
      const copy = response.clone();
      event.waitUntil(cache.put(event.request, copy).then(() => trimCache(cache, 8)).catch(() => {}));
      return response;
    }
    return response.status >= 500 ? (await cachedPage()) || response : response;
  } catch {
    return (await cachedPage()) || Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate' && url.origin === self.location.origin && !url.pathname.startsWith('/api/')) {
    event.respondWith(freshPageWithOfflineFallback(event));
    return;
  }

  // Vite filenames contain their content hash, so keeping them cannot stale
  // a newer deployment. HTML and API responses always go to the network.
  if (url.origin === self.location.origin
    && url.pathname.startsWith('/assets/')
    && ['script', 'style', 'font', 'image'].includes(request.destination)) {
    event.respondWith(cacheFirst(event, STATIC_CACHE, 160));
    return;
  }

  if (request.destination === 'image'
    && /\/uploads\/(?:products?|categories|target-apps|apps)\//i.test(url.pathname)) {
    event.respondWith(cacheFirst(event, PRODUCT_IMAGE_CACHE, 120));
  }
});
