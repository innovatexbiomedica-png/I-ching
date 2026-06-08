import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { register as registerServiceWorker } from "@/serviceWorkerRegistration";

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
