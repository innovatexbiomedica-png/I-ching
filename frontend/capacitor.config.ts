// Capacitor v6 configuration — I Ching del Benessere
// =====================================================
// L'app nativa è un WebView Capacitor che carica il bundle React buildato
// in `frontend/build/`. La logica di business è la stessa del sito
// (chingbenessere.it) — UI, AI, pagamenti via Stripe, autenticazione.
//
// Bundle ID (appId) deve restare INVARIATO una volta pubblicato sugli
// store: cambiarlo significa pubblicare un'app diversa. Tieni
// `com.ichingbenessere.app` come canonico.
//
// Riferimenti file di build:
//   - npx cap sync      → copia frontend/build → ios/App/App/public e
//                          android/app/src/main/assets/public
//   - npx cap open ios  → apre il progetto in Xcode
//   - npx cap open android → apre in Android Studio
//
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ichingbenessere.app',
  appName: 'I Ching del Benessere',
  webDir: 'build',

  // NOTA: NIENTE `server.url` né `server.hostname`. Lasciandolo vuoto,
  // l'app carica il bundle locale (offline-capable, recensione store
  // più semplice). Se vuoi una "live-update app" che punta sempre a
  // chingbenessere.it, scommentare il blocco sotto — ma il vecchio
  // capacitor.config.json puntava a app.ichingbenessere.com che NON
  // RISOLVE (era un typo: .com invece di .it).

  // server: {
  //   url: 'https://www.chingbenessere.it',
  //   cleartext: false,
  // },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#F9F7F2',
    limitsNavigationsToAppBoundDomains: true,
    allowsLinkPreview: false,
    scheme: 'I Ching del Benessere',
  },

  android: {
    backgroundColor: '#F9F7F2',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    useLegacyBridge: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#F9F7F2',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F9F7F2',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      // Iconi badge nativi; suono di sistema
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#C44D38',
      sound: 'beep.wav',
    },
    Haptics: {},
    App: {},
    Share: {},
  },
};

export default config;
