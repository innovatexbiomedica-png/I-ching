// Backend warmup helpers
// -----------------------
// Il backend gira su Render free tier che mette il processo in sleep
// dopo ~15 minuti di inattività. La prima richiesta a freddo impiega
// 30-50 secondi. Per il login e per le consultazioni questa attesa
// è inaccettabile, quindi:
//
//   1) GitHub Actions cron pinga /ping ogni 10 minuti (vedi
//      .github/workflows/keepwarm.yml) — keep-warm 24/7 di base.
//   2) Quando l'utente apre /login, /register o sta per inviare una
//      stesa, chiamiamo warmupBackend() che spara un fetch fire-and-forget
//      — se per qualche motivo il keep-warm ha fallito (rete, GitHub
//      down, repo privato), almeno mentre l'utente digita il backend si
//      risveglia in parallelo.
//
// Deduplicazione: il warmup è idempotente entro WARMUP_DEDUP_MS così
// componenti che montano vicini (es. AuthLayout + GoogleSignIn) non
// generano richieste duplicate.

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://iching-backend-ac3n.onrender.com';

const WARMUP_DEDUP_MS = 30_000; // 30s di cache: un solo ping ogni mezzo minuto
let _lastPing = 0;
let _pendingPromise = null;

/**
 * Sveglia il backend senza bloccare l'UI.
 * Sicuro da chiamare in qualunque punto (Effect, click handler, …):
 *   - se già pingato di recente, no-op silenzioso;
 *   - eventuali errori sono ignorati (è solo un warmup, non c'è UX da rovinare).
 *
 * @returns {Promise<void>}
 */
export function warmupBackend() {
  const now = Date.now();
  if (now - _lastPing < WARMUP_DEDUP_MS && _pendingPromise) {
    return _pendingPromise;
  }
  _lastPing = now;
  _pendingPromise = fetch(`${BACKEND_URL}/ping`, {
    mode: 'cors',
    cache: 'no-store',
    keepalive: true, // sopravvive a un eventuale unload subito dopo
  })
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      // libero il riferimento dopo la finestra di dedup
      setTimeout(() => { _pendingPromise = null; }, WARMUP_DEDUP_MS);
    });
  return _pendingPromise;
}

/**
 * Variante "now" che ignora la cache e forza un ping immediato.
 * Da usare quando si SA che il backend potrebbe essersi addormentato
 * (es. utente tornato in pagina dopo molto tempo).
 */
export function warmupBackendForce() {
  _lastPing = 0;
  _pendingPromise = null;
  return warmupBackend();
}
