# I Ching del Benessere — Guida pubblicazione App

Documento operativo per portare l'app su **App Store** e **Google Play**.
La parte engineering è già fatta nel codice; restano solo gli step che
richiedono account / certificati personali (cosa che lo sviluppatore non
può fare al posto tuo).

---

## Stato attuale

✅ **Già fatto** nel repo:
- Dipendenze Capacitor v6 installate (15 plugin)
- Configurazione `capacitor.config.ts` pulita (bundle ID `com.ichingbenessere.app`)
- Cartelle native `frontend/ios/` e `frontend/android/` generate
- Icone in tutti i tagli iOS + Android (script `frontend/scripts/generate-app-icons.sh`)
- `AndroidManifest.xml` con permessi push, vibrazione, network
- `Info.plist` con background modes + URL scheme per OAuth
- Service worker PWA registrato (cache v3)
- Capacitor bridge nel frontend (haptic, splash, status bar dinamica)
- Workflow Codemagic (`codemagic.yaml`) per build cloud iOS+Android
- `.gitignore` aggiornato per non committare Pods/, build/, etc.

🔴 **Cosa richiede azione tua** (3-5 giorni totali):

1. **Account developer** (€124 totali)
2. **Codemagic** (cloud build, gratuito 500 min/mese)
3. **Push notifications** (Firebase, gratuito)
4. **Store listings** (descrizioni, screenshot, classificazione)

---

## 1. Account developer

### Apple Developer Program — €99/anno
1. Vai su [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
2. Login con il tuo Apple ID
3. Scegli **Organization** se hai partita IVA / **Individual** se ditta individuale
4. Per Organization serve **DUNS Number** (gratuito ma richiede ~7 gg)
5. Paga €99
6. Aspetta verifica (24-72h normalmente)

### Google Play Console — €25 una tantum
1. Vai su [play.google.com/console](https://play.google.com/console)
2. Login con un Google Workspace o personale
3. Paga €25, account attivo subito
4. Verifica identità (passaporto/CI) — 1-3 giorni

---

## 2. Servizi cloud per build

### Codemagic (consigliato — pre-configurato)
1. Vai su [codemagic.io](https://codemagic.io), signup con GitHub
2. Connetti il repo `innovatexbiomedica-png/I-ching`
3. Codemagic legge `codemagic.yaml` dal repo (già pronto)
4. Devi solo configurare le **Environment Groups**:
   - `appstore_credentials` (per iOS, dopo aver creato l'app su App Store Connect)
   - `keystore_credentials` (per Android, generato a step 3)
   - `google_play` (Service Account JSON, vedi sotto)

### Alternativa: build locale
Se preferisci buildare sul Mac, ti servono:
```bash
# iOS
brew install cocoapods
# + Xcode.app completo da Mac App Store (~15 GB)

# Android
brew install --cask zulu@17
# + Android Studio da developer.android.com/studio (~6 GB)
```

---

## 3. Firma Android (keystore)

Una sola volta nella vita dell'app — il keystore va custodito gelosamente:
se lo perdi NON puoi più aggiornare l'app sullo store.

```bash
# Su un Mac/Linux con Java installato:
keytool -genkey -v -keystore iching-release.keystore \
  -alias iching-release \
  -keyalg RSA -keysize 2048 -validity 10000

# Ti chiederà:
#  - Password keystore (es. una passphrase forte)
#  - Password chiave (può essere uguale)
#  - I tuoi dati: nome, organizzazione, città
```

Custodisci `iching-release.keystore` (NON committarlo!) e annotati password.

In Codemagic:
1. Convertilo in base64: `base64 -i iching-release.keystore | pbcopy`
2. Aggiungi al gruppo `keystore_credentials`:
   - `CM_KEYSTORE` (incolla base64)
   - `CM_KEYSTORE_PASSWORD`
   - `CM_KEY_ALIAS` = `iching-release`
   - `CM_KEY_PASSWORD`

---

## 4. Push notifications (Firebase)

Necessario per: notifiche consigli giornalieri, promemoria stese, badge.

### Setup Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Nome: `I Ching del Benessere`
3. Add app **Android**: package name `com.ichingbenessere.app`
   - Scarica `google-services.json` → mettilo in `frontend/android/app/google-services.json`
   - **NON committarlo** — è nel `.gitignore`
4. Add app **iOS**: bundle ID `com.ichingbenessere.app`
   - Scarica `GoogleService-Info.plist` → mettilo in `frontend/ios/App/App/GoogleService-Info.plist`
5. In Firebase: **Cloud Messaging** → annotati il **Server Key** e il **Sender ID**

### Configurazione iOS APNs
1. [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers)
2. Seleziona il bundle `com.ichingbenessere.app`
3. Abilita capability **Push Notifications**
4. Sotto **Keys** → crea una **APNs Auth Key** (.p8)
5. Carica la .p8 + Key ID + Team ID dentro Firebase iOS app settings

---

## 5. Creare il record App Store / Play Store

### App Store Connect
1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps** → **+**
2. Compila:
   - Platform: iOS
   - Name: **I Ching del Benessere**
   - Primary language: Italian
   - Bundle ID: scegli `com.ichingbenessere.app` (lo vedrai in lista se hai creato l'identifier al passaggio 4)
   - SKU: `iching-benessere-001`
3. Salva. Ora puoi compilare:
   - Descrizione (massimo 4000 caratteri)
   - Keyword (max 100 char comma-separated): `i ching, oracolo, meditazione, taoismo, benessere, divinazione, esagrammi, wilhelm`
   - Screenshots: serve almeno **6.7"** (1290×2796) e **6.5"** (1242×2688). Vedi sezione 7.
   - Privacy policy URL: `https://www.chingbenessere.it/privacy`
   - Support URL: `https://www.chingbenessere.it/contatti` (da creare se manca)
   - **In-app purchases**: configura prodotti (`trial_pack_199`, `base_monthly_999`, ecc.) — vedi sezione 6.

### Google Play Console
1. [play.google.com/console](https://play.google.com/console) → **Create app**
2. Compila:
   - App name: **I Ching del Benessere**
   - Default language: Italian
   - App or game: App
   - Free or paid: Free (acquisti in-app)
3. Compila i questionari obbligatori:
   - **App content** → policy, target age, ads (no), content rating, news (no), COVID-19 (no), data safety
   - **Store presence** → graphic assets, screenshots (almeno 2 phone + 1 tablet)
   - **Pricing & distribution** → paesi di distribuzione, tax categories

---

## 6. Acquisti in-app (CRITICO)

Sia Apple che Google **non permettono** di gestire pagamenti via Stripe nelle
app native: pretendono che tutti i prodotti digitali consumati nell'app
passino attraverso il loro sistema, **trattenendo il 15-30% di commissione**.

**Tre strategie possibili**:

### A. Doppio binario (consigliato)
- **Sul sito web**: paga via Stripe (commissioni Stripe ~2-3%)
- **Nelle app native**: paga via StoreKit (iOS) / Play Billing (Android) — 15-30%
- L'utente vede prezzi UGUALI ma il margine cambia in funzione del canale

Implementazione: Capacitor plugin [@revenuecat/purchases-capacitor](https://www.revenuecat.com/) — gestisce entrambi i canali con una sola API. RevenueCat è gratuito fino a $2.500/mese di MTR.

### B. App "lettore" senza acquisti
Apple permette app "reader" (Spotify, Netflix, Kindle) che non offrono
acquisti nell'app. L'utente deve aver pagato altrove (sul tuo sito).
**Restrizioni**: niente link/CTA verso il pagamento esterno. Solo dopo
login l'app sblocca i contenuti.

### C. Web View che punta al sito
L'app è solo un "browser ottimizzato" che carica `https://www.chingbenessere.it`.
Possibile, ma Apple negli ultimi 2 anni rigetta molte app così — devono
avere valore aggiuntivo rispetto al sito (push, offline, ecc.).

**Consiglio operativo**: vai con la strategia A. Posso integrare
`@revenuecat/purchases-capacitor` quando hai gli account dev attivi.

---

## 7. Screenshot per gli store

Apple e Google richiedono screenshot in formati specifici:

### iOS
- 6.7" (iPhone 15 Pro Max): 1290 × 2796 px
- 6.5" (iPhone 14 Plus): 1242 × 2688 px
- 5.5" (iPhone 8 Plus): 1242 × 2208 px
- 12.9" iPad Pro: 2048 × 2732 px

### Android
- Phone: 1080 × 1920 px minimo (16:9)
- Tablet 7": 1024 × 600 minimo
- Tablet 10": 1920 × 1200 minimo
- Feature graphic: 1024 × 500 px

Una volta che l'app gira su un simulatore (Codemagic o locale), scatti gli
screenshot delle schermate chiave: Landing, Consultazione, Riassunto stesa,
Esagramma, Storico, Profilo. Servono **5-10 screenshot** per store.

Tools utili:
- [appstorescreenshot.com](https://appstorescreenshot.com)
- [previewed.app](https://previewed.app)

---

## 8. Comandi di build (riferimento rapido)

### Localmente (dopo aver installato Xcode + Android Studio + JDK + CocoaPods)
```bash
cd frontend

# 1) Aggiorna bundle React
yarn build

# 2) Sincronizza con Capacitor
npx cap sync

# 3) Apri in IDE nativo
npx cap open ios       # Xcode → build IPA
npx cap open android   # Android Studio → build AAB

# 4) Run su simulatore/emulatore
npx cap run ios
npx cap run android
```

### Via Codemagic (consigliato)
1. Pusha su `main` → Codemagic costruisce automaticamente
2. Su Codemagic dashboard vedi le build, scarichi l'IPA / l'AAB
3. Con `publishing.app_store_connect` + `publishing.google_play` configurati,
   l'upload sugli store è **automatico** dopo build

---

## 9. Submit & review

### App Store
1. Su App Store Connect → seleziona la build appena uploadata
2. Compila tutte le sezioni (in rosso le obbligatorie)
3. **Submit for Review**
4. Tempo di review: **24-72h** (a volte 1 settimana per app nuove)
5. Possibili rejection comuni:
   - "App offers in-app purchases but doesn't use StoreKit" → strategia 6.A
   - "Demo account required" → fornisci `amministrazione@innovatex.it` / password nei Notes
   - "Privacy policy incomplete" → assicurati che `/privacy` copra tutto (GDPR + Apple privacy nutrition labels)

### Google Play
1. Su Play Console → l'AAB è già in **Internal testing**
2. Verifica che tutto sia verde nei questionari
3. Sposta su **Production** quando pronto
4. Tempo di review: **2-24h** (più veloce di Apple)

---

## 10. Aggiornamenti futuri

Ogni nuova versione:
1. Cambia `versionName` in `frontend/android/app/build.gradle` (es. `1.0.1`)
2. Cambia `CFBundleShortVersionString` in `frontend/ios/App/App/Info.plist`
   (il `versionCode` Android e `CFBundleVersion` iOS li gestisce Codemagic
   in automatico da `$BUILD_NUMBER`)
3. Pusha su `main`
4. Codemagic builda e uploada sugli store
5. Su App Store Connect / Play Console → invia in review

---

## TL;DR — Ordine cronologico

```
[Tu]      Iscriviti Apple Developer (€99) + Google Play (€25)
[Tu]      Crea bundle ID com.ichingbenessere.app su Apple
[Tu]      Crea app records su App Store Connect + Play Console
[Tu]      Crea Firebase project, scarica config files
[Tu]      Genera keystore Android e custodiscilo
[Tu]      Iscriviti Codemagic e configura environment groups
[Dev]     Integra @revenuecat/purchases-capacitor per acquisti
[Dev]     Genera screenshot per gli store
[Tu]      Compila descrizioni, classifica contenuti, privacy
[CI]      Push su main → Codemagic builda + uploada
[Tu]      Submit for review su entrambi gli store
[Tempo]   24-72h Apple, 2-24h Google
[Live]    🎉 App pubblicata
```

Tempo realistico: **5-10 giorni** dal go (dipende molto dai tempi di
verifica account Apple Developer + DUNS).

---

🌊 **I Ching del Benessere** — L'antica saggezza ora anche su iPhone e Android
