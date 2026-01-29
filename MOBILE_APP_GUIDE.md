# I Ching del Benessere - Guida Conversione Mobile

## 📱 Panoramica

Questa app è stata convertita per funzionare come:
1. **PWA (Progressive Web App)** - Installabile direttamente dal browser
2. **App Nativa iOS/Android** - Tramite Capacitor
3. **Smartwatch** - Supporto WearOS e Apple Watch

## 🚀 PWA - Installazione Rapida

### Per gli utenti:
1. Aprire il sito dal browser
2. Cliccare su "Aggiungi alla schermata home" (comparirà automaticamente dopo 30 secondi)
3. L'app verrà installata e funzionerà anche offline

### Funzionalità PWA:
- ✅ Installazione su dispositivo
- ✅ Funzionamento offline (contenuti cached)
- ✅ Notifiche push (web)
- ✅ Shortcut rapidi (Nuova Consultazione, Storico, Biblioteca)
- ✅ Share target (condividi con I Ching)
- ✅ Badge aggiornamento

## 📦 Build App Native (Capacitor)

### Prerequisiti:
```bash
# Per iOS (solo Mac)
xcode-select --install
brew install cocoapods

# Per Android
# Installa Android Studio da: https://developer.android.com/studio
```

### Setup Iniziale:
```bash
cd frontend

# Inizializza Capacitor
npx cap init "I Ching del Benessere" "com.ichingbenessere.app"

# Aggiungi piattaforme
npx cap add ios
npx cap add android
```

### Build e Deploy:
```bash
# 1. Build del frontend
yarn build

# 2. Sincronizza con Capacitor
npx cap sync

# 3. Apri in IDE nativo
npx cap open ios     # Apre Xcode
npx cap open android # Apre Android Studio
```

### Configurazione iOS (Xcode):
1. Apri il progetto con `npx cap open ios`
2. Seleziona il team di sviluppo
3. Configura i capability:
   - Push Notifications
   - Background Modes (fetch, remote-notifications)
4. Aggiungi le icone in `Assets.xcassets`

### Configurazione Android (Android Studio):
1. Apri il progetto con `npx cap open android`
2. Configura `google-services.json` per FCM
3. Aggiungi le icone in `res/mipmap-*`
4. Configura il signing per release

## 🔔 Notifiche Push

### Setup Firebase Cloud Messaging:
1. Crea progetto su [Firebase Console](https://console.firebase.google.com)
2. Aggiungi app iOS e Android
3. Scarica i file di configurazione:
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`
4. Aggiungi la chiave VAPID per Web Push nell'env:
   ```
   REACT_APP_VAPID_PUBLIC_KEY=your_key_here
   ```

### Backend Setup (opzionale per push server-side):
```python
# Aggiungi in backend/.env
FCM_SERVER_KEY=your_server_key
FCM_SENDER_ID=your_sender_id
```

## ⌚ Supporto Smartwatch

### WearOS:
1. Installa l'app companion su telefono Android
2. L'app sincronizzerà automaticamente con WearOS
3. Funzionalità disponibili:
   - Esagramma del giorno sul quadrante
   - Consultazione rapida
   - Consigli giornalieri

### Apple Watch:
1. Installa l'app su iPhone
2. L'app Watch verrà installata automaticamente
3. Complicazioni disponibili:
   - Esagramma del giorno
   - Calendario cinese

## 📁 Struttura File Mobile

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service Worker per offline
│   ├── offline.html           # Pagina offline fallback
│   └── icons/                 # Icone PWA
├── src/
│   ├── services/
│   │   ├── NotificationService.js  # Push notifications
│   │   ├── NativeService.js       # Funzionalità native
│   │   └── WearOSService.js       # Smartwatch support
│   ├── components/
│   │   ├── MobileNavigation.js    # Bottom nav, install prompt
│   │   └── InAppNotification.js   # Notifiche in-app
│   └── serviceWorkerRegistration.js  # SW registration
├── capacitor.config.json    # Configurazione Capacitor
├── ios/                     # Progetto Xcode (dopo cap add)
└── android/                 # Progetto Android Studio (dopo cap add)
```

## 🎯 Funzionalità Mobile

### UI Ottimizzata:
- ✅ Bottom navigation bar per mobile
- ✅ Pull-to-refresh
- ✅ Gesti touch ottimizzati
- ✅ Animazioni fluide
- ✅ Safe area support (notch, Dynamic Island)
- ✅ Keyboard handling

### Funzionalità Native:
- ✅ Haptic feedback
- ✅ Share nativo
- ✅ Clipboard
- ✅ Network status
- ✅ Device info
- ✅ Secure storage
- ✅ Status bar customization
- ✅ Back button handling (Android)

### Offline Support:
- ✅ Caching intelligente (static assets, API)
- ✅ Background sync per consultazioni offline
- ✅ Pagina offline dedicata
- ✅ Periodic sync per esagramma del giorno

## 🛠️ Troubleshooting

### PWA non si installa:
1. Verifica che HTTPS sia attivo
2. Controlla manifest.json sia valido
3. Verifica service worker registrato

### Notifiche non funzionano:
1. Controlla permessi nel browser/device
2. Verifica chiave VAPID configurata
3. Controlla console per errori

### App nativa crash:
1. Controlla log in Xcode/Android Studio
2. Verifica `capacitor.config.json`
3. Esegui `npx cap sync` dopo modifiche

## 📄 Comandi Utili

```bash
# Sviluppo
yarn start                    # Dev server
yarn build                    # Build produzione

# Capacitor
npx cap sync                  # Sincronizza build
npx cap run ios               # Run su simulatore iOS
npx cap run android           # Run su emulatore Android
npx cap open ios              # Apri Xcode
npx cap open android          # Apri Android Studio

# Debug
npx cap serve                 # Live reload per native
npx cap doctor                # Diagnostica problemi
```

## 🌟 Pubblicazione

### App Store (iOS):
1. Configura Apple Developer Account
2. Crea App Store Connect record
3. Archive da Xcode
4. Upload con Transporter

### Google Play (Android):
1. Configura Google Play Console
2. Genera signed APK/AAB
3. Upload su Play Console
4. Completa store listing

---

🌊 **I Ching del Benessere** - L'antica saggezza per il mondo moderno