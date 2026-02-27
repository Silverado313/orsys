const CACHE_NAME = 'orsys-ary-v4.0';
const STATIC_CACHE_NAME = 'orsys-ary-static-v4.0';
const DYNAMIC_CACHE_NAME = 'orsys-ary-dynamic-v4.0';

// Static files that rarely change
const staticUrlsToCache = [
  // Root and Manifest files
  '/',
  '/index.html',
  '/clearcache.html',
  '/app.webmanifest',
  
  // Pages (from src/pages)
  '/src/pages/dashboard.html',
  '/src/pages/index.html',
  '/src/pages/admin/index.html',
  '/src/pages/admin/add-head.html',
  '/src/pages/admin/dv/edit.html',
  '/src/pages/admin/dv/update.html',
  '/src/pages/admin/cv/update.html',
  '/src/pages/dashboard4dv/index.html',
  '/src/pages/dv/index.html',
  '/src/pages/dv/dashboard.html',
  '/src/pages/dv/print.html',
  '/src/pages/vouchers/index.html',
  '/src/pages/vouchers/print.html',
  '/src/pages/vouchers/receipt.html',
  '/src/pages/vouchers/verify.html',
  
  // CSS files
  '/assets/css/navbar.css',
  '/src/styles/crv.css',
  '/src/styles/main.css',
  '/src/styles/new.css',
  '/src/styles/voucher.css',
  
  // JavaScript files
  '/assets/js/navbar.js',
  '/src/scripts/config/configLoader.js',
  '/src/scripts/config/validation.js',
  '/src/scripts/auth/sign-in.js',
  '/src/scripts/admin/addhead.js',
  '/src/scripts/dashboard/dashboard.js',
  '/src/scripts/dashboard/enhanced_dashboard_datatables.js',
  '/src/scripts/dashboard/enhanced_dashboard_datatables_dv.js',
  '/src/scripts/dv/appdvreport.js',
  '/src/scripts/dv/drslipverify.js',
  '/src/scripts/dv/dvprnt.js',
  '/src/scripts/dv/insertdv.js',
  '/src/scripts/shared/appreport.js',
  '/src/scripts/shared/share.js',
  '/src/scripts/vouchers/calc.js',
  '/src/scripts/vouchers/insert.js',
  '/src/scripts/vouchers/prntcrvwithqr.js',
  '/src/scripts/vouchers/prntwithqr.js',
  '/src/scripts/vouchers/report.js',
  '/src/scripts/vouchers/slipverify.js',
  
  // Images
  '/image/ARY_Digital_Logo_2.png',
  '/image/qrcode_orsys-ary.web.app.png',
  '/image/qrcode_dr_orsys-ary.web.app.png',
  
  // Favicon files
  '/favicon_io/android-chrome-192x192.png',
  '/favicon_io/android-chrome-512x512.png',
  '/favicon_io/apple-touch-icon.png',
  '/favicon_io/favicon-16x16.png',
  '/favicon_io/favicon-32x32.png',
  '/favicon_io/favicon.ico',
  '/favicon_io/site.webmanifest',
  
  // External CDN resources
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css',
  'https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css',
  'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js',
  'https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js',
  'https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js',
  'https://cdn.datatables.net/responsive/2.5.0/js/responsive.bootstrap5.min.js'
];

// Network-first resources (Firebase, API calls)
const networkFirstUrls = [
  'https://www.gstatic.com/firebasejs/',
  'https://firebase.googleapis.com/',
  'https://firestore.googleapis.com/',
  'https://identitytoolkit.googleapis.com/',
  'https://securetoken.googleapis.com/',
  'https://apis.google.com/'
];

// Cache name versioning helper
const CACHE_VERSION = {
  static: 'v4.0',
  dynamic: 'v4.0',
  timestamp: new Date().toISOString()
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW v4.0] Installing Service Worker with new navbar system');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files (including navbar.js and navbar.css)');
        
        // Cache files in batches to avoid timeout
        const batchSize = 10;
        const batches = [];
        
        for (let i = 0; i < staticUrlsToCache.length; i += batchSize) {
          batches.push(staticUrlsToCache.slice(i, i + batchSize));
        }
        
        return batches.reduce((promise, batch) => {
          return promise.then(() => {
            return cache.addAll(batch).catch(err => {
              console.warn('[SW] Failed to cache batch:', batch, err);
            });
          });
        }, Promise.resolve());
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW v4.0] Activating Service Worker - cleaning old caches');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete all caches that don't match current version
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated - v4.0 with navbar system');
        return self.clients.claim();
      })
      .then(() => {
        // Notify clients about update
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: '4.0',
              timestamp: CACHE_VERSION.timestamp
            });
          });
        });
      })
  );
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (requestUrl.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip data URIs
  if (requestUrl.protocol === 'data:') {
    return;
  }
  
  // Network-first strategy for Firebase and API calls
  if (networkFirstUrls.some(url => event.request.url.includes(url))) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // Cache-first strategy for static resources (including navbar files)
  event.respondWith(cacheFirst(event.request));
});

// Cache-first strategy (optimized for navbar system)
async function cacheFirst(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if it's a navbar file and log for debugging
      if (request.url.includes('navbar')) {
        console.log('[SW] Serving navbar file from cache:', request.url);
      }
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    console.log('[SW] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      
      // Clone and cache the response
      cache.put(request, networkResponse.clone());
      
      // Log navbar files being cached
      if (request.url.includes('navbar')) {
        console.log('[SW] Cached navbar file from network:', request.url);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed for:', request.url, error);
    
    // Return offline fallback for HTML pages
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/index.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Return a basic offline response
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'voucher-sync') {
    event.waitUntil(syncVouchers());
  }
});

// Sync offline voucher submissions
async function syncVouchers() {
  try {
    console.log('[SW] Syncing offline vouchers...');
    // Implementation for offline voucher sync
    // This would integrate with your Firebase backend
  } catch (error) {
    console.error('[SW] Voucher sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let title = 'ORSYS-ARY';
  let body = 'New notification';
  let data = { url: '/dashboard.html' };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      body = payload.body || body;
      data = payload.data || data;
    } catch (e) {
      body = event.data.text();
    }
  }
  
  const options = {
    body: body,
    icon: '/favicon_io/android-chrome-192x192.png',
    badge: '/favicon_io/favicon-32x32.png',
    data: data,
    vibrate: [200, 100, 200],
    tag: 'orsys-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/dashboard.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0].postMessage(info);
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
  
  if (event.data && event.data.type === 'UPDATE_NAVBAR_CACHE') {
    // Force update navbar files in cache
    updateNavbarCache().then(() => {
      event.ports[0].postMessage({ success: true, message: 'Navbar cache updated' });
    });
  }
});

// Get cache information
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const cacheInfo = {
    caches: {},
    version: CACHE_VERSION,
    totalSize: 0
  };
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheInfo.caches[cacheName] = {
      count: keys.length,
      urls: keys.map(req => req.url)
    };
  }
  
  return cacheInfo;
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// Force update navbar files in cache
async function updateNavbarCache() {
  try {
    const navbarFiles = [
      '/assets/css/navbar.css',
      '/assets/js/navbar.js'
    ];
    
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    for (const url of navbarFiles) {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) {
          await cache.put(url, response);
          console.log('[SW] Updated navbar file in cache:', url);
        }
      } catch (error) {
        console.warn('[SW] Failed to update navbar file:', url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Failed to update navbar cache:', error);
  }
}

// Periodic cache cleanup (run every 24 hours)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCache());
  }
});

// Clean up old cache entries
async function cleanupOldCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 1 day
    
    let deletedCount = 0;
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;
      
      const cacheDate = response.headers.get('date');
      
      if (cacheDate && (now - new Date(cacheDate).getTime()) > maxAge) {
        await cache.delete(request);
        deletedCount++;
        console.log('[SW] Deleted old cache entry:', request.url);
      }
    }
    
    console.log(`[SW] Cache cleanup complete. Deleted ${deletedCount} entries.`);
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

// Error handler
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

console.log('[SW v4.0] Service Worker script loaded with navbar system support');

// Developed by: TechPeer | Updated: December 2024 | Version: 4.0 | Navbar System Integrated