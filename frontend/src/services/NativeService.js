// I Ching del Benessere - Native Capacitor Wrapper
// Handles native device features: haptics, share, device info, storage

class NativeService {
  constructor() {
    this.isNative = this.detectNative();
    this.platform = this.detectPlatform();
    this.deviceInfo = null;
  }

  // Detect if running in native app
  detectNative() {
    return typeof window !== 'undefined' && window.Capacitor && !window.Capacitor.isNativePlatform?.() === false;
  }

  // Detect platform
  detectPlatform() {
    if (typeof window !== 'undefined' && window.Capacitor) {
      return window.Capacitor.getPlatform();
    }
    return 'web';
  }

  // Initialize native services
  async initialize() {
    if (!this.isNative) return;

    try {
      await this.getDeviceInfo();
      await this.setupStatusBar();
      await this.setupKeyboard();
      await this.setupBackButton();
      console.log('[NativeService] Initialized for platform:', this.platform);
    } catch (error) {
      console.error('[NativeService] Initialization failed:', error);
    }
  }

  // Get device information
  async getDeviceInfo() {
    try {
      const { Device } = await import('@capacitor/device');
      this.deviceInfo = await Device.getInfo();
      return this.deviceInfo;
    } catch (error) {
      console.warn('[NativeService] Device info unavailable:', error);
      return null;
    }
  }

  // Setup status bar (iOS/Android)
  async setupStatusBar() {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#F9F7F2' });
    } catch (error) {
      console.warn('[NativeService] StatusBar setup failed:', error);
    }
  }

  // Setup keyboard behavior
  async setupKeyboard() {
    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      
      // Hide accessory bar on iOS
      Keyboard.setAccessoryBarVisible({ isVisible: false });
      
      // Listen for keyboard events
      Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.classList.add('keyboard-open');
        document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      });
      
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
        document.body.style.removeProperty('--keyboard-height');
      });
    } catch (error) {
      console.warn('[NativeService] Keyboard setup failed:', error);
    }
  }

  // Setup Android back button
  async setupBackButton() {
    if (this.platform !== 'android') return;

    try {
      const { App } = await import('@capacitor/app');
      
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          // Show exit confirmation or minimize
          this.showExitConfirmation();
        }
      });
    } catch (error) {
      console.warn('[NativeService] Back button setup failed:', error);
    }
  }

  // Show exit confirmation dialog
  async showExitConfirmation() {
    try {
      const { Dialog } = await import('@capacitor/dialog');
      const { value } = await Dialog.confirm({
        title: 'Esci dall\'app',
        message: 'Vuoi uscire da I Ching del Benessere?',
        okButtonTitle: 'Esci',
        cancelButtonTitle: 'Annulla'
      });

      if (value) {
        const { App } = await import('@capacitor/app');
        App.exitApp();
      }
    } catch (error) {
      console.warn('[NativeService] Exit dialog failed:', error);
    }
  }

  // Haptic feedback
  async haptic(type = 'medium') {
    try {
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
      
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          await Haptics.selectionEnd();
          break;
        default:
          await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch (error) {
      // Fallback to web vibration
      if ('vibrate' in navigator) {
        const patterns = {
          light: [30],
          medium: [50],
          heavy: [100],
          success: [50, 50, 50],
          warning: [100, 50, 100],
          error: [150, 50, 150],
          selection: [10]
        };
        navigator.vibrate(patterns[type] || [50]);
      }
    }
  }

  // Share content
  async share(options) {
    const { title, text, url, dialogTitle } = options;

    try {
      if (this.isNative) {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title,
          text,
          url,
          dialogTitle: dialogTitle || 'Condividi'
        });
      } else if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        // Fallback: copy to clipboard
        await this.copyToClipboard(url || text);
        return { shared: false, method: 'clipboard' };
      }
      return { shared: true };
    } catch (error) {
      console.error('[NativeService] Share failed:', error);
      return { shared: false, error };
    }
  }

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      if (this.isNative) {
        const { Clipboard } = await import('@capacitor/clipboard');
        await Clipboard.write({ string: text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      return true;
    } catch (error) {
      console.error('[NativeService] Clipboard failed:', error);
      return false;
    }
  }

  // Read from clipboard
  async readFromClipboard() {
    try {
      if (this.isNative) {
        const { Clipboard } = await import('@capacitor/clipboard');
        const { value } = await Clipboard.read();
        return value;
      } else {
        return await navigator.clipboard.readText();
      }
    } catch (error) {
      console.error('[NativeService] Clipboard read failed:', error);
      return null;
    }
  }

  // Open URL in browser
  async openBrowser(url) {
    try {
      if (this.isNative) {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url });
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('[NativeService] Browser open failed:', error);
      window.open(url, '_blank');
    }
  }

  // Get network status
  async getNetworkStatus() {
    try {
      if (this.isNative) {
        const { Network } = await import('@capacitor/network');
        return await Network.getStatus();
      } else {
        return {
          connected: navigator.onLine,
          connectionType: navigator.onLine ? 'wifi' : 'none'
        };
      }
    } catch (error) {
      return { connected: navigator.onLine, connectionType: 'unknown' };
    }
  }

  // Listen for network changes
  onNetworkChange(callback) {
    if (this.isNative) {
      import('@capacitor/network').then(({ Network }) => {
        Network.addListener('networkStatusChange', callback);
      }).catch(() => {
        // Fallback to web events
        window.addEventListener('online', () => callback({ connected: true }));
        window.addEventListener('offline', () => callback({ connected: false }));
      });
    } else {
      window.addEventListener('online', () => callback({ connected: true }));
      window.addEventListener('offline', () => callback({ connected: false }));
    }
  }

  // Secure storage
  async secureStore(key, value) {
    try {
      if (this.isNative) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value: JSON.stringify(value) });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('[NativeService] Store failed:', error);
      return false;
    }
  }

  // Secure retrieve
  async secureRetrieve(key) {
    try {
      if (this.isNative) {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error('[NativeService] Retrieve failed:', error);
      return null;
    }
  }

  // Secure remove
  async secureRemove(key) {
    try {
      if (this.isNative) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('[NativeService] Remove failed:', error);
      return false;
    }
  }

  // App state listener
  onAppStateChange(callback) {
    if (this.isNative) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('appStateChange', callback);
      }).catch(() => {
        // Web fallback
        document.addEventListener('visibilitychange', () => {
          callback({ isActive: !document.hidden });
        });
      });
    } else {
      document.addEventListener('visibilitychange', () => {
        callback({ isActive: !document.hidden });
      });
    }
  }

  // Screen orientation
  async lockOrientation(orientation = 'portrait') {
    try {
      if (this.isNative) {
        const { ScreenOrientation } = await import('@capacitor/screen-orientation');
        await ScreenOrientation.lock({ orientation });
      } else if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock(orientation);
      }
    } catch (error) {
      console.warn('[NativeService] Orientation lock failed:', error);
    }
  }

  // Keep screen awake
  async keepAwake(enable = true) {
    try {
      const { KeepAwake } = await import('@capacitor-community/keep-awake');
      if (enable) {
        await KeepAwake.keepAwake();
      } else {
        await KeepAwake.allowSleep();
      }
    } catch (error) {
      console.warn('[NativeService] Keep awake failed:', error);
    }
  }

  // Get safe area insets
  getSafeAreaInsets() {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
    };
  }
}

// Export singleton
export const nativeService = new NativeService();
export default nativeService;