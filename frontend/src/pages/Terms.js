import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  useEffect(() => {
    document.title = 'Termini di Servizio — I Ching del Benessere';
  }, []);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 text-[#2C2C2C]" data-testid="terms-page">
      <h1 className="text-3xl font-serif mb-2">Termini di Servizio</h1>
      <p className="text-sm text-[#7a6f63] mb-8">Ultimo aggiornamento: 1 gennaio 2026</p>

      <Section title="1. Oggetto">
        <p>
          I presenti Termini regolano l'utilizzo del sito <strong>chingbenessere.it</strong> e
          dei servizi connessi (di seguito "Servizio") — consultazioni I Ching, tema natale
          astrologico, percorsi guidati e contenuti correlati al benessere personale.
          L'utilizzo del Servizio implica accettazione integrale dei presenti Termini.
        </p>
      </Section>

      <Section title="2. Natura del servizio">
        <p>
          Il Servizio offre <strong>strumenti di crescita personale e introspezione</strong>{' '}
          basati sulla tradizione millenaria dell'I Ching (Yi Jing — Libro dei Mutamenti) e
          sull'astrologia occidentale e cinese, con interpretazioni generate da
          intelligenza artificiale.
        </p>
        <p className="font-medium text-[#C44D38] bg-[#FFF4F0] border-l-4 border-[#C44D38] pl-3 py-2 my-3">
          ⚠️ Il Servizio <strong>NON è un servizio medico, psicologico, finanziario, legale o
          predittivo</strong>. I contenuti sono offerti a scopo culturale, riflessivo e di
          intrattenimento. Non sostituiscono in alcun modo il parere di professionisti
          qualificati. Per problemi di salute, decisioni finanziarie o questioni legali
          rivolgiti sempre a un professionista abilitato.
        </p>
      </Section>

      <Section title="3. Registrazione e account">
        <ul className="list-disc pl-6 space-y-1">
          <li>Per usare il Servizio devi avere almeno <strong>16 anni</strong>.</li>
          <li>Devi fornire dati veritieri e mantenere riservate le credenziali.</li>
          <li>Sei responsabile di ogni attività che avviene tramite il tuo account.</li>
          <li>Notifica immediatamente eventuali accessi non autorizzati.</li>
        </ul>
      </Section>

      <Section title="4. Abbonamento Premium">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Free</strong>: 3 consultazioni al mese, interpretazione "diretta".</li>
          <li><strong>Premium</strong>: consultazioni illimitate, interpretazioni profonde, sintesi, esport PDF/DOCX, percorsi guidati, statistiche, tema natale.</li>
          <li>Prezzi: <strong>€ 9,99/mese</strong> o <strong>€ 79,99/anno</strong> (IVA inclusa).</li>
          <li>Pagamenti gestiti da <strong>Stripe Payments Europe Ltd</strong>.</li>
          <li>L'abbonamento si rinnova automaticamente alla scadenza salvo disdetta dal pannello.</li>
          <li><strong>Diritto di recesso</strong> (art. 52 Codice del Consumo): hai 14 giorni dal primo acquisto per recedere, scrivendo a billing@chingbenessere.it. Se hai già consumato consultazioni Premium, il rimborso può essere proporzionalmente ridotto.</li>
        </ul>
      </Section>

      <Section title="5. Uso accettabile">
        <p>Ti impegni a non:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>utilizzare il Servizio per fini illeciti o lesivi di terzi;</li>
          <li>inserire nelle domande dati personali identificativi di terzi senza consenso;</li>
          <li>tentare di compromettere la sicurezza o l'integrità del Servizio;</li>
          <li>copiare, rivendere o automatizzare l'accesso all'API senza autorizzazione;</li>
          <li>utilizzare l'output dell'AI in modo da causare danno a sé o ad altri.</li>
        </ul>
      </Section>

      <Section title="6. Proprietà intellettuale">
        <p>
          I testi originali dell'I Ching (traduzione Wilhelm) sono di dominio pubblico.
          Le interpretazioni AI, il design del sito, il codice, i loghi e i contenuti
          editoriali sono di esclusiva proprietà del titolare e protetti dal diritto
          d'autore. Ti viene concessa una licenza limitata, non esclusiva e revocabile
          per uso personale del Servizio.
        </p>
        <p>
          Le tue domande e le interpretazioni a te dedicate restano di tua titolarità;
          ne concedi al titolare licenza limitata al solo fine di erogare il Servizio.
        </p>
      </Section>

      <Section title="7. Limitazione di responsabilità">
        <p>
          Nei limiti consentiti dalla legge, il titolare non è responsabile per
          decisioni assunte sulla base delle interpretazioni AI, per indisponibilità
          temporanea del Servizio o per danni indiretti. La responsabilità complessiva
          è in ogni caso limitata all'importo effettivamente pagato dall'utente
          negli ultimi 12 mesi.
        </p>
      </Section>

      <Section title="8. Sospensione e cessazione">
        <p>
          Possiamo sospendere o chiudere account che violano i presenti Termini,
          previa comunicazione (salvo gravi violazioni). Puoi chiudere il tuo account
          in qualsiasi momento dal pannello impostazioni o scrivendo a
          <a className="text-[#C44D38] underline" href="mailto:privacy@chingbenessere.it"> privacy@chingbenessere.it</a>.
        </p>
      </Section>

      <Section title="9. Legge applicabile e foro">
        <p>
          I presenti Termini sono regolati dalla <strong>legge italiana</strong>.
          Per controversie con consumatori si applica il foro del consumatore;
          per gli altri il foro di Roma.
        </p>
      </Section>

      <Section title="10. Modifiche">
        <p>
          Possiamo modificare i presenti Termini per esigenze normative o evolutive
          del Servizio. Le modifiche sostanziali ti verranno comunicate con almeno
          30 giorni di preavviso via email; per le modifiche non sostanziali sarà
          sufficiente la pubblicazione di una versione aggiornata.
        </p>
      </Section>

      <div className="mt-10 pt-6 border-t border-[#E5E0D8] text-sm text-[#7a6f63]">
        <Link to="/" className="text-[#C44D38] underline">← Torna alla home</Link>
        {' '}|{' '}
        <Link to="/privacy" className="text-[#C44D38] underline">Privacy</Link>
        {' '}|{' '}
        <Link to="/cookie-policy" className="text-[#C44D38] underline">Cookie</Link>
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

export default Terms;
