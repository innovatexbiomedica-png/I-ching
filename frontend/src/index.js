import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { register as registerServiceWorker } from "@/serviceWorkerRegistration";
import { initCapacitorBridge } from "@/lib/capacitor-bridge";
import { initSentry } from "@/lib/sentry";

// Sentry deve partire PRIMA di renderizzare React per catturare anche
// eventuali errori nel primo render. Se REACT_APP_SENTRY_DSN non e'
// settato a build-time, e' completamente no-op.
initSentry();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA service worker — abilita:
//   • prompt "Aggiungi alla schermata Home" su mobile
//   • cache offline (asset statici + ultime consultazioni)
//   • push notifications + periodic sync per consigli giornalieri
// In dev viene comunque registrato ma il dev server CRA non serve
// /service-worker.js, quindi il modulo gestisce graceful fallback.
registerServiceWorker();

// Inizializza i plugin nativi quando l'app gira dentro Capacitor (iOS/Android).
// Sul sito web è un no-op: i moduli @capacitor/* sono import dinamici e
// nemmeno entrano nel bundle se non richiesti.
initCapacitorBridge();
