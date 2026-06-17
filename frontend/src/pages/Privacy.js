import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy — I Ching del Benessere';
  }, []);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 text-[#2C2C2C]" data-testid="privacy-page">
      <h1 className="text-3xl font-serif mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#7a6f63] mb-8">
        Ultimo aggiornamento: 1 gennaio 2026 — Versione 2.0
      </p>

      <Section title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati personali raccolti tramite il sito
          <strong> chingbenessere.it</strong> (di seguito "Sito") è il gestore del progetto
          <strong> I Ching del Benessere</strong>, contattabile all'indirizzo email{' '}
          <a href="mailto:privacy@chingbenessere.it" className="text-[#C44D38] underline">
            privacy@chingbenessere.it
          </a>.
        </p>
        <p>
          Il presente documento è redatto in conformità al
          <strong> Regolamento UE 2016/679 (GDPR)</strong>, al
          <strong> D. Lgs. 196/2003 (Codice Privacy)</strong> come modificato dal D. Lgs. 101/2018,
          alle <strong>Linee Guida EDPB</strong> aggiornate al 2026, e al
          <strong> Regolamento UE 2024/1689 (AI Act)</strong> in vigore dal 2 agosto 2026
          per la parte relativa ai sistemi di intelligenza artificiale ad uso generale.
        </p>
      </Section>

      <Section title="2. Quali dati raccogliamo e perché">
        <p>Raccogliamo solo i dati strettamente necessari all'erogazione del servizio:</p>
        <Table rows={[
          ['Dato', 'Finalità', 'Base giuridica', 'Conservazione'],
          ['Email, nome, password (hashata con bcrypt)', 'Creazione e gestione account', 'Contratto (art. 6.1.b GDPR)', 'Finché l\'account è attivo + 30 giorni'],
          ['Telefono (opzionale)', 'Recupero password', 'Consenso (art. 6.1.a GDPR)', 'Finché l\'account è attivo'],
          ['Data, ora, luogo di nascita (opzionali)', 'Calcolo tema natale astrologico', 'Consenso esplicito (art. 9.2.a)', 'Finché l\'account è attivo'],
          ['Domande poste all\'oracolo I Ching', 'Generazione interpretazioni AI', 'Contratto + consenso', 'Finché l\'account è attivo'],
          ['Lingua preferita, fuso orario', 'Personalizzazione interfaccia', 'Legittimo interesse', 'Finché l\'account è attivo'],
          ['Indirizzo IP (in forma aggregata)', 'Sicurezza, antifrode', 'Legittimo interesse (art. 6.1.f)', 'Massimo 30 giorni'],
          ['Dati di pagamento (gestiti da Stripe)', 'Acquisto abbonamento Premium', 'Contratto', 'Stripe come responsabile esterno'],
        ]} />
        <p className="mt-3 text-sm">
          ⚠️ <strong>Dati non richiesti</strong>: non raccogliamo dati sanitari, religiosi, etnici,
          biometrici, di orientamento sessuale o politico. Le domande poste all'oracolo possono
          essere libere e personali: ti invitiamo a non includere dati identificativi di terzi
          (vedi sezione 6 — anonimizzazione).
        </p>
      </Section>

      <Section title="3. Come trattiamo i dati con l'Intelligenza Artificiale (AI Act 2026)">
        <p>
          Le interpretazioni degli esagrammi e i consigli personalizzati sono generati tramite
          <strong> Google Gemini 2.5 Flash</strong>, un modello di AI generativa fornito da
          Google Ireland Ltd. In conformità all'<strong>AI Act UE</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Il sistema è classificato come <strong>AI a rischio limitato</strong>: ricevi sempre la chiara indicazione che il testo è generato da un modello AI.</li>
          <li>Le tue domande sono inviate al modello solo per generare la risposta richiesta.</li>
          <li>Google ha dichiarato di <strong>non utilizzare i prompt API per addestrare i propri modelli</strong> (paid tier / Gemini API senza Vertex).</li>
          <li>Non operiamo profilazione automatica con effetti giuridici (art. 22 GDPR).</li>
          <li>Hai il diritto di richiedere intervento umano, esprimere la tua opinione o contestare l'output AI scrivendo a <a href="mailto:privacy@chingbenessere.it" className="text-[#C44D38] underline">privacy@chingbenessere.it</a>.</li>
        </ul>
      </Section>

      <Section title="4. Dove conserviamo i dati">
        <Table rows={[
          ['Servizio', 'Tipo dato', 'Luogo server', 'Trasferimento extra-UE'],
          ['MongoDB Atlas', 'Tutti i dati strutturati', 'Francoforte (UE)', 'No'],
          ['Render', 'Hosting backend API', 'Francoforte (UE)', 'No'],
          ['Vercel', 'Hosting frontend statico', 'Edge CDN globale', 'Possibile: SCC + supplementary measures'],
          ['Google Gemini API', 'Domande in transito', 'Server Google globali', 'Sì: SCC + Data Processing Addendum Google'],
          ['Stripe', 'Dati di pagamento', 'Irlanda (UE) + USA', 'Sì: SCC + DPF (Data Privacy Framework)'],
          ['Resend', 'Invio email transazionali (reset password, benvenuto, ricevute, conferme recesso)', 'USA', 'Sì: SCC + DPF (Data Privacy Framework)'],
          ['Sentry (se attivo)', 'Telemetria errori applicazione', 'Germania (UE) o USA', 'Sì: SCC + DPF, send_default_pii=false (no email/IP)'],
        ]} />
        <p className="mt-2 text-sm">
          I trasferimenti extra-UE avvengono esclusivamente verso paesi con decisione di adeguatezza
          o con <strong>Clausole Contrattuali Standard</strong> (SCC) approvate dalla
          Commissione Europea, integrate da misure supplementari (cifratura in transito TLS 1.3
          e a riposo AES-256).
        </p>
      </Section>

      <Section title="5. I tuoi diritti (artt. 15-22 GDPR)">
        <p>Hai il diritto, in qualsiasi momento, di:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Accesso</strong> — chiedere copia dei tuoi dati</li>
          <li><strong>Rettifica</strong> — correggere dati inesatti</li>
          <li><strong>Cancellazione</strong> ("diritto all'oblio") — eliminare il tuo account</li>
          <li><strong>Limitazione</strong> del trattamento</li>
          <li><strong>Portabilità</strong> — ricevere i tuoi dati in formato JSON</li>
          <li><strong>Opposizione</strong> al trattamento basato su legittimo interesse</li>
          <li><strong>Revoca del consenso</strong> in ogni momento, senza pregiudicare la liceità dei trattamenti precedenti</li>
          <li><strong>Reclamo</strong> al Garante per la Protezione dei Dati Personali (<a className="text-[#C44D38] underline" href="https://www.garanteprivacy.it">garanteprivacy.it</a>)</li>
        </ul>
        <p className="mt-3">
          Per esercitare i tuoi diritti scrivici a{' '}
          <a href="mailto:privacy@chingbenessere.it" className="text-[#C44D38] underline">
            privacy@chingbenessere.it
          </a>. Risponderemo entro 30 giorni (art. 12.3 GDPR).
        </p>
      </Section>

      <Section title="6. Anonimizzazione e protezione contro l'indicizzazione">
        <p>
          Per tutelare la privacy degli utenti adottiamo misure di
          <strong> pseudonimizzazione e anonimizzazione</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Le pagine private (dashboard, storico, profilo, consultazioni, tema natale) sono marcate <code className="text-xs bg-[#F9F7F2] px-1">noindex, nofollow</code> e non vengono indicizzate dai motori di ricerca.</li>
          <li>Il file <Link to="/robots.txt" className="text-[#C44D38] underline">robots.txt</Link> esclude esplicitamente dashboard, profilo, storico, tema natale e tutte le aree autenticate.</li>
          <li>Nessun nome, cognome, email o dato identificativo dell'utente viene mai esposto in pagine pubbliche, sitemap, feed o link condivisibili.</li>
          <li>Le <strong>consultazioni condivise pubblicamente</strong> tramite token mostrano solo la domanda e l'esagramma, mai l'identità dell'autore.</li>
          <li>Email e password sono <strong>crittografate</strong>: la password è hashata con bcrypt (mai memorizzata in chiaro).</li>
          <li>Su richiesta puoi attivare l'<strong>uso di uno pseudonimo</strong> al posto del nome reale all'interno dell'applicazione.</li>
        </ul>
      </Section>

      <Section title="7. Cookie">
        <p>
          Vedi la <Link to="/cookie-policy" className="text-[#C44D38] underline">Cookie Policy</Link> dedicata.
          Puoi modificare le tue preferenze in qualsiasi momento cancellando il cookie di consenso
          dal tuo browser oppure scrivendo a privacy@chingbenessere.it.
        </p>
      </Section>

      <Section title="8. Minori">
        <p>
          Il servizio non è destinato a minori di <strong>16 anni</strong> (soglia GDPR per il consenso
          digitale, art. 8). Se sei un genitore o tutore e ritieni che un minore ci abbia fornito
          dati senza consenso, scrivici e provvederemo immediatamente alla cancellazione.
        </p>
      </Section>

      <Section title="9. Misure di sicurezza">
        <ul className="list-disc pl-6 space-y-1">
          <li>Trasferimenti cifrati con <strong>TLS 1.3</strong></li>
          <li>Database cifrato a riposo con <strong>AES-256</strong></li>
          <li>Password con hash <strong>bcrypt</strong> (cost factor ≥ 12)</li>
          <li>Token di sessione <strong>JWT</strong> con scadenza (30 giorni)</li>
          <li>Accesso al database limitato a un singolo utente applicativo con privilegi minimi</li>
          <li>Backup automatici giornalieri (MongoDB Atlas)</li>
          <li>Monitoraggio continuo accessi e tentativi di intrusione</li>
        </ul>
      </Section>

      <Section title="10. Modifiche a questa policy">
        <p>
          Possiamo aggiornare questa policy per riflettere modifiche normative o del servizio.
          La versione corrente è sempre disponibile a questo URL con data di aggiornamento in alto.
          In caso di modifiche sostanziali ti avviseremo via email almeno 30 giorni prima.
        </p>
      </Section>

      <div className="mt-10 pt-6 border-t border-[#E5E0D8] text-sm text-[#7a6f63]">
        <p>
          <Link to="/" className="text-[#C44D38] underline">← Torna alla home</Link>
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

export default Privacy;
