import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const DataProtection = () => {
  useEffect(() => {
    document.title = 'Protezione dati e anonimizzazione — I Ching del Benessere';
  }, []);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 text-[#2C2C2C]" data-testid="data-protection-page">
      <h1 className="text-3xl font-serif mb-2">Protezione dei dati e anonimizzazione</h1>
      <p className="text-sm text-[#7a6f63] mb-8">
        Le nostre misure tecniche e organizzative per tutelare la tua identità.
      </p>

      <p className="bg-[#FFF4F0] border-l-4 border-[#C44D38] pl-4 py-3 mb-8 text-[15px]">
        Riteniamo la tua privacy un diritto, non una concessione. Per questo applichiamo il
        principio del <strong>privacy by design</strong> previsto dall'art. 25 GDPR sin dalla
        progettazione del sito.
      </p>

      <Section title="1. Pseudonimizzazione e anonimizzazione">
        <p>
          Distinguiamo, secondo l'art. 4 GDPR, tra <strong>pseudonimizzazione</strong> (i dati
          non possono essere attribuiti a un interessato senza l'uso di informazioni aggiuntive
          tenute separatamente) e <strong>anonimizzazione</strong> (i dati non sono più riconducibili
          all'interessato in alcun modo).
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Le password sono <strong>hashate con bcrypt</strong>: non sono recuperabili in chiaro neanche da noi.</li>
          <li>Gli ID utente interni sono <strong>UUID v4 casuali</strong>: non rivelano nulla sull'identità.</li>
          <li>Le statistiche aggregate (numero consultazioni, esagrammi più frequenti) sono <strong>completamente anonime</strong>.</li>
          <li>Le logs di accesso non includono email o nome dell'utente in chiaro, ma solo l'ID UUID.</li>
        </ul>
      </Section>

      <Section title="2. Esclusione dall'indicizzazione (motori di ricerca)">
        <p>
          <strong>Nessun dato personale può essere indicizzato</strong> da Google, Bing o altri
          motori di ricerca. Per garantirlo:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            Il file <code className="text-xs bg-[#F9F7F2] px-1 rounded">/robots.txt</code> contiene
            direttive <code className="text-xs">Disallow</code> per tutte le sezioni autenticate
            (<code>/dashboard</code>, <code>/profile</code>, <code>/history</code>, <code>/natal-chart</code>,
            <code>/consult</code>, <code>/paths</code>, <code>/statistics</code>, <code>/notifications</code>, <code>/subscription</code>).
          </li>
          <li>
            Le pagine private contengono il meta tag{' '}
            <code className="text-xs bg-[#F9F7F2] px-1 rounded">
              &lt;meta name="robots" content="noindex, nofollow"&gt;
            </code>{' '}
            generato lato client.
          </li>
          <li>Header HTTP <code className="text-xs">X-Robots-Tag: noindex</code> applicabile alle API.</li>
          <li>
            La sitemap pubblica contiene solo pagine generiche (home, login, registrazione,
            policy) e <strong>nessun riferimento agli utenti</strong>.
          </li>
        </ul>
      </Section>

      <Section title="3. Condivisione di consultazioni">
        <p>
          Quando condividi una consultazione tramite link pubblico:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Il link contiene un <strong>token casuale</strong> non sequenziale (impossibile da indovinare).</li>
          <li>La pagina pubblica mostra solo: esagramma, linee mutevoli, interpretazione AI — <strong>mai email, nome, ID utente</strong>.</li>
          <li>Puoi <strong>revocare il link</strong> in qualsiasi momento dalla sezione "Storico".</li>
          <li>Le pagine condivise hanno comunque header <code>noindex, nofollow</code> per non finire nei motori di ricerca.</li>
        </ul>
      </Section>

      <Section title="4. Nessun dato reale nei log">
        <p>
          I nostri log di produzione (Render, MongoDB Atlas) sono configurati per non registrare
          informazioni personali in chiaro:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Le query API loggate contengono solo metodo, endpoint, status code e UUID utente.</li>
          <li>I corpi delle richieste (domande oracolo, dati natale) <strong>non vengono mai loggati</strong>.</li>
          <li>Gli IP sono troncati/aggregati dopo 30 giorni.</li>
        </ul>
      </Section>

      <Section title="5. Diritti specifici di anonimizzazione">
        <p>In aggiunta ai diritti standard GDPR, ti offriamo:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Uso di pseudonimo</strong>: puoi sostituire nome e cognome con uno pseudonimo
            scrivendo a privacy@chingbenessere.it.
          </li>
          <li>
            <strong>Cancellazione selettiva</strong>: puoi richiedere la cancellazione delle
            singole consultazioni mantenendo l'account.
          </li>
          <li>
            <strong>Anonimizzazione retroattiva</strong>: alla chiusura dell'account, le tue
            consultazioni passate vengono dissociate dal tuo UUID e conservate in forma
            statistica anonima per finalità di miglioramento del servizio.
          </li>
        </ul>
      </Section>

      <Section title="6. Trasparenza sull'AI">
        <p>
          In ottemperanza all'art. 50 dell'<strong>AI Act UE</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Ogni interpretazione generata da AI è chiaramente indicata come tale.</li>
          <li>Non vengono prese decisioni automatizzate con effetti giuridici (art. 22 GDPR).</li>
          <li>Le tue domande non vengono usate per addestrare modelli AI di terzi.</li>
          <li>Hai il diritto di richiedere intervento umano in caso di output ritenuto non appropriato.</li>
        </ul>
      </Section>

      <Section title="7. Data Breach">
        <p>
          In caso di violazione che presenti rischio per i tuoi diritti, ti notificheremo
          entro <strong>72 ore</strong> dalla conoscenza del fatto e provvederemo alla notifica
          al Garante della Privacy come previsto dagli artt. 33 e 34 GDPR.
        </p>
      </Section>

      <Section title="8. Contatti">
        <p>
          Per qualsiasi domanda relativa alla protezione dei tuoi dati:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Email: <a className="text-[#C44D38] underline" href="mailto:privacy@chingbenessere.it">privacy@chingbenessere.it</a></li>
          <li>
            Autorità di controllo: <a className="text-[#C44D38] underline" href="https://www.garanteprivacy.it">
              Garante per la Protezione dei Dati Personali
            </a>{' '}
            (Piazza Venezia 11, 00187 Roma — protocollo@gpdp.it)
          </li>
        </ul>
      </Section>

      <div className="mt-10 pt-6 border-t border-[#E5E0D8] text-sm text-[#7a6f63]">
        <Link to="/" className="text-[#C44D38] underline">← Torna alla home</Link>
        {' '}|{' '}
        <Link to="/privacy" className="text-[#C44D38] underline">Privacy Policy</Link>
        {' '}|{' '}
        <Link to="/cookie-policy" className="text-[#C44D38] underline">Cookie Policy</Link>
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

export default DataProtection;
