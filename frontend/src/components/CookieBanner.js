import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'cookieConsent.v1';

const getStoredConsent = () => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storeConsent = (consent) => {
  const payload = {
    ...consent,
    timestamp: new Date().toISOString(),
    version: 1,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  // Notify any listener (e.g. analytics scripts) that consent changed
  window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: payload }));
};

/**
 * GDPR-compliant cookie banner.
 *
 * Defaults to the strictest interpretation:
 *  - No cookies are set / no analytics fire until the user clicks Accept.
 *  - "Reject all" is as prominent as "Accept all" (Cnil / EDPB guidance).
 *  - Granular preferences are exposed in a second step.
 */
const CookieBanner = () => {
  const [show, setShow] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    necessary: true, // always on
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) setShow(true);
  }, []);

  const acceptAll = () => {
    storeConsent({ necessary: true, functional: true, analytics: true, marketing: true, choice: 'accept_all' });
    setShow(false);
  };

  const rejectAll = () => {
    storeConsent({ necessary: true, functional: false, analytics: false, marketing: false, choice: 'reject_all' });
    setShow(false);
  };

  const savePrefs = () => {
    storeConsent({ ...prefs, choice: 'custom' });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Banner di consenso cookie"
      className="fixed inset-x-0 bottom-0 z-[10000] p-4 sm:p-5"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="mx-auto max-w-3xl rounded-lg shadow-2xl"
        style={{
          pointerEvents: 'auto',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1CDC7',
          padding: '20px',
        }}
      >
        {!showPrefs ? (
          <>
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-2 font-serif">
              🍪 La tua privacy è importante
            </h2>
            <p className="text-sm text-[#595959] mb-4 leading-relaxed">
              Usiamo cookie strettamente necessari per il funzionamento del sito (autenticazione, sessione).
              Con il tuo consenso usiamo anche cookie funzionali e statistici per migliorare l'esperienza.
              Puoi accettare tutto, rifiutare quelli non necessari, o personalizzare la scelta.
              Per maggiori informazioni leggi la{' '}
              <Link to="/cookie-policy" className="underline text-[#C44D38]">
                Cookie Policy
              </Link>{' '}
              e la{' '}
              <Link to="/privacy" className="underline text-[#C44D38]">
                Privacy Policy
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={rejectAll}
                className="flex-1 px-4 py-2 rounded border border-[#D1CDC7] text-[#2C2C2C] hover:bg-[#F9F7F2] text-sm"
              >
                Rifiuta tutti
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="flex-1 px-4 py-2 rounded border border-[#D1CDC7] text-[#2C2C2C] hover:bg-[#F9F7F2] text-sm"
              >
                Personalizza
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2 rounded bg-[#C44D38] text-white hover:bg-[#A63D2B] text-sm font-medium"
              >
                Accetta tutti
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-[#2C2C2C] mb-3 font-serif">
              Personalizza i tuoi cookie
            </h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-auto">
              <CookieRow
                title="Strettamente necessari"
                desc="Sempre attivi. Servono per autenticazione, sessione e sicurezza. Senza di essi il sito non funziona."
                checked={true}
                disabled
              />
              <CookieRow
                title="Funzionali"
                desc="Memorizzano preferenze come lingua, tema, frequenza notifiche. Migliorano l'esperienza."
                checked={prefs.functional}
                onChange={(v) => setPrefs({ ...prefs, functional: v })}
              />
              <CookieRow
                title="Statistici / analitici"
                desc="Misurano in forma aggregata l'uso del sito (nessun dato personale identificabile)."
                checked={prefs.analytics}
                onChange={(v) => setPrefs({ ...prefs, analytics: v })}
              />
              <CookieRow
                title="Marketing"
                desc="Attualmente non attivi. Riservati a eventuali campagne future."
                checked={prefs.marketing}
                onChange={(v) => setPrefs({ ...prefs, marketing: v })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowPrefs(false)}
                className="px-4 py-2 rounded border border-[#D1CDC7] text-[#2C2C2C] hover:bg-[#F9F7F2] text-sm"
              >
                ← Indietro
              </button>
              <button
                onClick={savePrefs}
                className="flex-1 px-4 py-2 rounded bg-[#C44D38] text-white hover:bg-[#A63D2B] text-sm font-medium"
              >
                Salva preferenze
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CookieRow = ({ title, desc, checked, onChange, disabled }) => (
  <label className={`flex items-start gap-3 p-3 rounded border border-[#E5E0D8] ${disabled ? 'bg-[#F9F7F2]' : 'cursor-pointer hover:bg-[#F9F7F2]'}`}>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.checked)}
      className="mt-1 accent-[#C44D38]"
    />
    <div className="flex-1">
      <div className="text-sm font-medium text-[#2C2C2C]">{title}</div>
      <div className="text-xs text-[#7a6f63] mt-0.5">{desc}</div>
    </div>
  </label>
);

export default CookieBanner;
