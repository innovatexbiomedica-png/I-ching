// I Ching del Benessere - Push Notification Service
// Supports Web Push, iOS, Android, and WearOS

const API_URL = (process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com");

class NotificationService {
  constructor() {
    this.isNative = this.detectPlatform();
    this.pushToken = null;
    this.isInitialized = false;
  }

  // Detect platform (Web, iOS, Android, WearOS)
  detectPlatform() {
    if (typeof window !== 'undefined' && window.Capacitor) {
      return window.Capacitor.getPlatform(); // 'ios', 'android', 'web'
    }
    return 'web';
  }

  // Initialize notification service
  async initialize() {
    if (this.isInitialized) return;

    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      this.isInitialized = true;
      console.log('[NotificationService] Initialized for platform:', this.isNative);
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
    }
  }

  // Initialize native push notifications (Capacitor)
  async initializeNative() {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register with APNs/FCM
        await PushNotifications.register();
        
        // Listen for registration success
        PushNotifications.addListener('registration', (token) => {
          console.log('[NotificationService] Push token:', token.value);
          this.pushToken = token.value;
          this.sendTokenToServer(token.value);
        });
        
        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('[NotificationService] Registration error:', error);
        });
        
        // Listen for push notifications received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('[NotificationService] Push received:', notification);
          this.handleNotificationReceived(notification);
        });
        
        // Listen for notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('[NotificationService] Action performed:', action);
          this.handleNotificationAction(action);
        });
      }
    } catch (error) {
      console.error('[NotificationService] Native init failed:', error);
    }
  }

  // Initialize web push notifications
  async initializeWeb() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[NotificationService] Push not supported in this browser');
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Register service worker
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
        });
        
        this.pushToken = JSON.stringify(subscription);
        await this.sendTokenToServer(this.pushToken, 'web');
        console.log('[NotificationService] Web push subscription:', subscription);
      }
    } catch (error) {
      console.error('[NotificationService] Web push init failed:', error);
    }
  }

  // Send push token to backend
  async sendTokenToServer(token, platform = this.isNative) {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) return;

      const response = await fetch(`${API_URL}/api/notifications/register-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          push_token: token,
          platform: platform,
          device_info: this.getDeviceInfo()
        })
      });

      if (response.ok) {
        console.log('[NotificationService] Token registered with server');
      }
    } catch (error) {
      console.error('[NotificationService] Failed to register token:', error);
    }
  }

  // Get device info
  getDeviceInfo() {
    const info = {
      platform: this.isNative,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (typeof window !== 'undefined' && window.Capacitor) {
      // Add Capacitor device info if available
      import('@capacitor/device').then(({ Device }) => {
        Device.getInfo().then(deviceInfo => {
          Object.assign(info, deviceInfo);
        });
      }).catch(() => {});
    }

    return info;
  }

  // Handle notification received (foreground)
  handleNotificationReceived(notification) {
    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent('iching-notification', {
      detail: notification
    }));

    // Show in-app notification if supported
    this.showInAppNotification(notification);
  }

  // Handle notification action
  handleNotificationAction(action) {
    const { notification, actionId } = action;
    
    // Navigate based on notification data
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }

    // Handle specific actions
    switch (actionId) {
      case 'consult':
        window.location.href = '/consult';
        break;
      case 'view':
        window.location.href = notification.data?.url || '/dashboard';
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    // This will be handled by React component via event listener
    console.log('[NotificationService] In-app notification:', notification);
  }

  // Schedule local notification
  async scheduleLocalNotification(options) {
    const { title, body, schedule, data = {} } = options;

    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title,
            body,
            schedule,
            extra: data,
            smallIcon: 'ic_stat_icon',
            iconColor: '#C44D38',
            sound: 'notification.wav'
          }]
        });
      } else {
        // Web: Use service worker for scheduling
        if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          setTimeout(() => {
            registration.showNotification(title, {
              body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              data
            });
          }, schedule.at ? schedule.at - Date.now() : 0);
        }
      }
    } catch (error) {
      console.error('[NotificationService] Schedule failed:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      }
    } catch (error) {
      console.error('[NotificationService] Cancel failed:', error);
    }
  }

  // Get notification permission status
  async getPermissionStatus() {
    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const status = await PushNotifications.checkPermissions();
        return status.receive;
      } else {
        return Notification.permission;
      }
    } catch (error) {
      console.error('[NotificationService] Permission check failed:', error);
      return 'denied';
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const status = await PushNotifications.requestPermissions();
        return status.receive === 'granted';
      } else {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
    } catch (error) {
      console.error('[NotificationService] Request permission failed:', error);
      return false;
    }
  }

  // Utility: Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    if (!base64String) return new Uint8Array();
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

  // Badge management (for app icon)
  async setBadgeCount(count) {
    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        const { Badge } = await import('@capawesome/capacitor-badge');
        await Badge.set({ count });
      } else if ('setAppBadge' in navigator) {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      }
    } catch (error) {
      console.error('[NotificationService] Badge update failed:', error);
    }
  }

  // Vibration feedback
  async vibrate(pattern = [100, 50, 100]) {
    try {
      if (this.isNative === 'ios' || this.isNative === 'android') {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      // Silently fail - not critical
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;