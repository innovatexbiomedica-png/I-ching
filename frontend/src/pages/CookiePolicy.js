import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  useEffect(() => {
    document.title = 'Cookie Policy — I Ching del Benessere';
  }, []);

  const clearConsent = () => {
    localStorage.removeItem('cookieConsent.v1');
    window.location.reload();
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 text-[#2C2C2C]" data-testid="cookie-page">
      <h1 className="text-3xl font-serif mb-2">Cookie Policy</h1>
      <p className="text-sm text-[#7a6f63] mb-8">
        Ultimo aggiornamento: 1 gennaio 2026
      </p>

      <Section title="Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al tuo dispositivo,
          dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva.
          Sono utilizzati per autenticazione, preferenze, statistiche o marketing.
        </p>
        <p>
          Questa Cookie Policy spiega quali cookie utilizziamo sul sito{' '}
          <strong>chingbenessere.it</strong> e ti permette di scegliere quali accettare,
          in conformità al <strong>GDPR (Reg. UE 2016/679)</strong> e al{' '}
          <strong>Provvedimento Garante Privacy 10 giugno 2021</strong>.
        </p>
      </Section>

      <Section title="Cookie e tecnologie utilizzate">
        <h3 className="font-semibold mt-4 mb-2 text-[#C44D38]">🔒 Strettamente necessari (sempre attivi)</h3>
        <Table rows={[
          ['Nome', 'Tipo', 'Finalità', 'Durata'],
          ['token', 'localStorage', 'Token JWT di sessione (autenticazione)', '30 giorni'],
          ['language', 'localStorage', 'Lingua preferita (it/en)', 'Persistente'],
          ['cookieConsent.v1', 'localStorage', 'Memorizza la tua scelta sul banner cookie', '12 mesi'],
          ['splashSeen', 'sessionStorage', 'Mostra/nasconde schermata iniziale', 'Sessione'],
        ]} />

        <h3 className="font-semibold mt-6 mb-2 text-[#C44D38]">⚙️ Funzionali (opzionali)</h3>
        <Table rows={[
          ['Nome', 'Tipo', 'Finalità', 'Durata'],
          ['theme', 'localStorage', 'Tema chiaro/scuro', 'Persistente'],
          ['notificationPrefs', 'localStorage', 'Preferenze notifiche', 'Persistente'],
        ]} />

        <h3 className="font-semibold mt-6 mb-2 text-[#C44D38]">📊 Statistici / analitici (opzionali)</h3>
        <p className="text-sm">
          Al momento <strong>non utilizziamo</strong> servizi di analytics di terze parti.
          Se in futuro abiliteremo strumenti come Plausible (privacy-friendly) o Google Analytics 4,
          verranno attivati solo previo tuo consenso esplicito tramite il banner.
        </p>

        <h3 className="font-semibold mt-6 mb-2 text-[#C44D38]">🎯 Marketing</h3>
        <p className="text-sm">
          Non utilizziamo cookie di profilazione o marketing.
        </p>

        <h3 className="font-semibold mt-6 mb-2 text-[#C44D38]">🌐 Cookie di terze parti</h3>
        <Table rows={[
          ['Servizio', 'Quando attivato', 'Privacy Policy del fornitore'],
          ['Google Sign-In', 'Solo se clicchi "Continua con Google"', 'policies.google.com/privacy'],
          ['Stripe', 'Solo durante il processo di pagamento', 'stripe.com/privacy'],
          ['Google Fonts (Manrope, Cormorant)', 'Sempre — solo per caricare il font', 'policies.google.com/privacy'],
        ]} />
      </Section>

      <Section title="Come gestire le tue scelte">
        <p>
          Puoi modificare le tue preferenze in qualsiasi momento:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Cliccando il pulsante sottostante per <strong>revocare il consenso</strong> e ripresentare il banner;</li>
          <li>Modificando le impostazioni del tuo browser per bloccare o cancellare i cookie;</li>
          <li>Scrivendo a <a className="text-[#C44D38] underline" href="mailto:privacy@chingbenessere.it">privacy@chingbenessere.it</a>.</li>
        </ul>

        <button
          onClick={clearConsent}
          className="mt-4 px-4 py-2 bg-[#C44D38] text-white rounded hover:bg-[#A63D2B] text-sm"
        >
          🔄 Revoca consenso e mostra nuovamente il banner
        </button>

        <p className="mt-4 text-sm text-[#7a6f63]">
          ⚠️ Il blocco dei cookie strettamente necessari può impedirti di accedere al sito.
        </p>
      </Section>

      <Section title="Riferimenti normativi">
        <ul className="list-disc pl-6 space-y-1">
          <li>Regolamento UE 2016/679 (GDPR)</li>
          <li>Direttiva 2002/58/CE (ePrivacy)</li>
          <li>D.Lgs. 196/2003 (Codice Privacy) modificato dal D.Lgs. 101/2018</li>
          <li>Provvedimento Garante Privacy del 10 giugno 2021 (n. 231) — Linee guida cookie</li>
          <li>Linee Guida EDPB 03/2022 sul deceptive design patterns</li>
        </ul>
      </Section>

      <div className="mt-10 pt-6 border-t border-[#E5E0D8] text-sm text-[#7a6f63]">
        <p>
          <Link to="/" className="text-[#C44D38] underline">← Torna alla home</Link>
          {' '}|{' '}
          <Link to="/privacy" className="text-[#C44D38] underline">Privacy Policy</Link>
          {' '}|{' '}
          <Link to="/terms" className="text-[#C44D38] underline">Termini di Servizio</Link>
        </p>
      </div>
    </article>
  );
};

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-serif text-[#2C2C2C] mb-3 border-b border-[#E5E0D8] pb-2">{title}</h2>
    <div className="space-y-2 text-[15px] leading-relaxed text-[#3a3a3a]">{children}</div>
  </section>
);

const Table = ({ rows }) => {
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th key={i} className="text-left border-b border-[#C44D38] py-1.5 px-2 font-semibold text-[#2C2C2C]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-[#E5E0D8]">
              {row.map((cell, ci) => (
                <td key={ci} className="py-1.5 px-2 align-top text-[#3a3a3a]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CookiePolicy;
