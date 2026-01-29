// Service Worker Registration for I Ching del Benessere
// Handles PWA installation and updates

export function register(config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost()) {
        // Development: check if SW exists
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('[SW Registration] App is being served from cache by a service worker.');
        });
      } else {
        // Production: register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function isLocalhost() {
  return Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW Registration] Service Worker registered:', registration.scope);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available; show update notification
              console.log('[SW Registration] New content available; will refresh on reload.');
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
              
              // Show update toast
              showUpdateNotification();
            } else {
              // Content cached for offline use
              console.log('[SW Registration] Content is cached for offline use.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Every hour

      // Register periodic background sync
      registerPeriodicSync(registration);
    })
    .catch((error) => {
      console.error('[SW Registration] Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW Registration] No internet connection. App is running in offline mode.');
    });
}

function showUpdateNotification() {
  // Dispatch custom event for React components to handle
  window.dispatchEvent(new CustomEvent('sw-update-available'));
}

async function registerPeriodicSync(registration) {
  try {
    // Check if periodic sync is supported
    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync',
      });

      if (status.state === 'granted') {
        // Register daily advice sync
        await registration.periodicSync.register('daily-advice', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
        console.log('[SW Registration] Periodic sync registered for daily advice');

        // Register daily hexagram sync
        await registration.periodicSync.register('daily-hexagram', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
        console.log('[SW Registration] Periodic sync registered for daily hexagram');
      }
    }
  } catch (error) {
    console.warn('[SW Registration] Periodic sync registration failed:', error);
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW Registration] Error unregistering service worker:', error);
      });
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[SW Registration] Notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push notifications
export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Get VAPID public key from environment
      const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      
      if (!vapidKey) {
        console.warn('[SW Registration] VAPID key not configured');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
    }

    console.log('[SW Registration] Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('[SW Registration] Push subscription failed:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[SW Registration] Push unsubscribed');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[SW Registration] Push unsubscription failed:', error);
    return false;
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if app is installed (PWA)
export function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Get installation state
export function getInstallationState() {
  return {
    isInstalled: isAppInstalled(),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    isChrome: /Chrome/.test(navigator.userAgent),
    canInstall: 'BeforeInstallPromptEvent' in window || 
                (/iPad|iPhone|iPod/.test(navigator.userAgent) && !isAppInstalled())
  };
}