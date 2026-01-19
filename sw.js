const CACHE_NAME = 'ghetto-attendance-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

// Install the service worker and cache the static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache API requests.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(request).then(networkResponse => {
          // Clone the response and cache it for next time
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return networkResponse;
        });
      }).catch(error => {
        // As a fallback for navigation requests, serve the main index page
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        console.error('Service Worker fetch error:', error);
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', event => {
  if (event.data.action === 'signIn') {
    const { session } = event.data;
    const now = new Date();
    const hour = now.getHours();

    const morningSessionEnd = 12;
    const afternoonSessionEnd = 18;

    let currentSession;
    if (hour < morningSessionEnd) {
      currentSession = 'morning';
    } else if (hour < afternoonSessionEnd) {
      currentSession = 'afternoon';
    } else {
      currentSession = 'night';
    }

    if (session !== currentSession) {
      let message;
      if (
        (session === 'afternoon' && currentSession === 'morning') ||
        (session === 'night' && (currentSession === 'morning' || currentSession === 'afternoon'))
      ) {
        message = `You can't sign in for a future session. Please wait until the ${session} session.`;
      } else {
        message = `You can only sign in for the ${currentSession} session at this time.`;
      }
      event.ports[0].postMessage({ success: false, message });
      return;
    }

    hasSignedIn(session).then(signedIn => {
      if (signedIn) {
        event.ports[0].postMessage({ success: false, message: `You have already signed in for the ${session} session.` });
      } else {
        addSignIn(session).then(() => {
          event.ports[0].postMessage({ success: true, message: `Successfully signed in for the ${session} session.` });
        });
      }
    });
  } else if (event.data.action === 'testPush') {
    const options = {
      body: 'This is a test push notification!',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg'
    };
    self.registration.showNotification('Ghetto Attendance', options);
  }
});

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('attendance-db', 1);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('signIns', { keyPath: 'session' });
    };
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function addSignIn(session) {
  return openDb().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['signIns'], 'readwrite');
      const store = transaction.objectStore('signIns');
      store.add({ session, timestamp: new Date() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = event => reject(event.target.error);
    });
  });
}

self.addEventListener('push', event => {
  const options = {
    body: 'Time to sign in for your session!',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg'
  };

  event.waitUntil(
    self.registration.showNotification('Ghetto Attendance', options)
  );
});

function hasSignedIn(session) {
  return openDb().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['signIns'], 'readonly');
      const store = transaction.objectStore('signIns');
      const request = store.get(session);
      request.onsuccess = event => {
        resolve(!!event.target.result);
      };
      request.onerror = event => reject(event.target.error);
    });
  });
}
