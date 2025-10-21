const CACHE_VERSION = 'aboelo-sw-v1';
const PRECACHE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  // pass-through for now; no custom responses yet
  return;
});

self.addEventListener('push', (event) => {
  const defaultData = {
    title: 'aboelo-fitness Aktivpause',
    body: 'Zeit für eine kurze Bewegungspause! 🎉',
    url: self.location.origin,
    tag: 'aboelo-activity-reminder',
  };

  let payload = defaultData;
  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        ...defaultData,
        ...parsed,
        data: {
          url: parsed?.data?.url || parsed?.url || defaultData.url,
        },
      };
    } catch (error) {
      console.error('[ServiceWorker] Failed to parse push payload', error);
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || payload.icon || '/icons/icon-96.png',
    tag: payload.tag,
    data: payload.data,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existingClient = clientList.find((client) => client.url.includes(targetUrl));
      if (existingClient && 'focus' in existingClient) {
        return existingClient.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
