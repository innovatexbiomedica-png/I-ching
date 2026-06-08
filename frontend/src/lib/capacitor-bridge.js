// Capacitor bridge — comportamenti nativi per iOS/Android
// =========================================================
// Quando il codice React gira dentro l'app nativa (WebView Capacitor),
// questo modulo abilita features che il browser non offre:
//   • back-button Android che torna al routing React invece di chiudere
//     l'app
//   • StatusBar coerente con il tema scelto dall'utente
//   • Splash screen che si chiude appena React monta
//   • Haptic feedback al lancio delle monete (UX rituale)
//   • Push notifications per i consigli giornalieri (FCM/APNs)
//
// Sul sito web (chingbenessere.it) tutto è no-op: i plugin importati
// dinamicamente non vengono caricati se `Capacitor.isNativePlatform()`
// è false.

let _initialised = false;

export async function initCapacitorBridge() {
  if (_initialised) return;
  _initialised = true;

  // Caricamento dinamico: se non siamo dentro l'app nativa, evita
  // di importare l'intero peso dei plugin sul bundle del sito web.
  let isNative = false;
  try {
    const { Capacitor } = await import('@capacitor/core');
    isNative = Capacitor.isNativePlatform();
  } catch {
    return; // libreria non disponibile (build pre-cap-sync), no-op
  }
  if (!isNative) return;

  // Splash auto-hide quando React ha finito di renderizzare la home
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    // delay micro perché lo splash deve sovrapporsi al primo paint
    setTimeout(() => SplashScreen.hide().catch(() => {}), 300);
  } catch {}

  // Status bar: chiara su tema giorno/osaka, scura su tema notte
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    const theme = document.documentElement.getAttribute('data-bg-theme') || 'day';
    await StatusBar.setStyle({ style: theme === 'night' ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({
      color: theme === 'night' ? '#070B22' : '#F9F7F2',
    }).catch(() => {});
    // Re-applicare quando il tema cambia
    new MutationObserver(async () => {
      const t = document.documentElement.getAttribute('data-bg-theme') || 'day';
      try {
        await StatusBar.setStyle({ style: t === 'night' ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: t === 'night' ? '#070B22' : '#F9F7F2' });
      } catch {}
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-bg-theme'] });
  } catch {}

  // Back-button Android: in radice esce, altrove fa indietro
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch {}

  // Network status: log iniziale; un'UI lo userà più avanti se serve
  try {
    const { Network } = await import('@capacitor/network');
    const s = await Network.getStatus();
    console.log('[Capacitor] Network:', s.connected ? 'online' : 'offline', s.connectionType);
  } catch {}
}

// Haptic per il lancio delle monete (chiamato da InteractiveCoinToss)
export async function hapticImpact() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

// Share nativo (per ShareButton consultazione)
export async function shareNative({ title, text, url }) {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      // Web: fallback al Web Share API se disponibile
      if (navigator.share) return navigator.share({ title, text, url });
      return null;
    }
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text, url, dialogTitle: title });
  } catch {}
}

// Push notifications setup (chiamato dopo che l'utente accetta)
export async function setupPushNotifications(onToken) {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return null;
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return null;
    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      console.log('[Capacitor] FCM/APNs token:', token.value);
      if (onToken) onToken(token.value);
    });
    PushNotifications.addListener('registrationError', (err) => {
      console.warn('[Capacitor] Push registration error:', err);
    });
    return true;
  } catch {
    return null;
  }
}
