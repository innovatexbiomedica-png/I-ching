// Sentry initialization (React side)
// ====================================
// Si attiva SOLO se REACT_APP_SENTRY_DSN e' settato a build-time
// (Vercel → Environment variables). Se non c'e', tutto questo file
// e' un no-op runtime: nessuna richiesta in uscita, nessun payload
// extra nel bundle (l'import dinamico evita anche di portarci dietro
// il peso del client @sentry/react se DSN non e' configurato).
//
// Privacy:
//   • send_default_pii=false → niente email/IP nei breadcrumb di default
//   • masking sui campi form (password, code, JWT)
//   • i webhook Stripe non passano dal browser quindi safe

import { lazy } from 'react';

const DSN = process.env.REACT_APP_SENTRY_DSN;
const ENV = process.env.REACT_APP_SENTRY_ENVIRONMENT || 'production';

export function initSentry() {
  if (!DSN) return; // graceful no-op
  // Dynamic import: il bundle Sentry (~30KB gz) viene scaricato solo se
  // l'utente ha effettivamente il DSN attivo.
  import('@sentry/react').then(({ init, browserTracingIntegration, replayIntegration }) => {
    init({
      dsn: DSN,
      environment: ENV,
      release: process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
      sendDefaultPii: false,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,     // niente session replay di default
      replaysOnErrorSampleRate: 0.1,   // 10% delle sessioni con errori
      integrations: [
        browserTracingIntegration(),
        replayIntegration({
          // Mascheriamo TUTTI gli input — protegge password, codici reset,
          // dati di carta in caso (Stripe Elements li mostra in iframe,
          // ma per sicurezza estendiamo il masking).
          maskAllInputs: true,
          maskAllText: false,
          blockAllMedia: true,
        }),
      ],
      // Errori "rumore" che non vogliamo nei conteggi
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Gli abort di fetch quando l'utente naviga
        'AbortError',
        // Stripe Checkout redirect: il browser cancella le richieste pendenti
        'NetworkError when attempting to fetch resource',
      ],
    });
  }).catch(() => {
    // Sentry non si carica? Pazienza, non blocchiamo l'app.
  });
}
