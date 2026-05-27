import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight, ChevronRight } from 'lucide-react';

/*
 * Componenti per arricchire la Landing con contenuti AUTENTICI
 * tratti dalla traduzione di Richard Wilhelm — "I King, il libro dei mutamenti".
 *
 * Niente testi inventati: ogni Sentenza, Immagine e citazione qui sotto
 * è tratta verbatim dal Wilhelm.
 */

// ────────────────────────────────────────────────────────────────
// 8 esagrammi "vetrina" — estratti diretti dal testo Wilhelm
// ────────────────────────────────────────────────────────────────
export const WILHELM_HEXAGRAMS_PREVIEW = [
  {
    number: 1,
    chinese: '乾',
    pinyin: "Ch'ien",
    name: 'Il Creativo',
    binary: '111111',
    sentenza: 'Il Creativo opera sublime riuscita, propizio per perseveranza.',
    immagine: 'Il moto del cielo è vigoroso. Così il nobile rende se stesso forte e instancabile.',
    keyword: 'forza primordiale',
  },
  {
    number: 2,
    chinese: '坤',
    pinyin: "K'un",
    name: 'Il Ricettivo',
    binary: '000000',
    sentenza: 'Il Ricettivo opera sublime riuscita, propizio per la perseveranza di una cavalla.',
    immagine: 'Lo stato della terra è l\'accogliente dedizione. Così il nobile sorregge con l\'ampiezza della sua natura il mondo esterno.',
    keyword: 'dedizione',
  },
  {
    number: 11,
    chinese: '泰',
    pinyin: "T'ai",
    name: 'La Pace',
    binary: '000111',
    sentenza: 'La pace. Il piccolo se ne va, il grande viene. Salute! Riuscita!',
    immagine: 'Cielo e terra si congiungono: l\'immagine della pace.',
    keyword: 'armonia',
  },
  {
    number: 24,
    chinese: '復',
    pinyin: 'Fu',
    name: 'Il Ritorno',
    binary: '000001',
    sentenza: 'Il ritorno. Riuscita. Uscita ed entrata senza errore. Amici vengono senza macchia.',
    immagine: 'Il tuono dentro la terra: l\'immagine della svolta.',
    keyword: 'svolta',
  },
  {
    number: 29,
    chinese: '坎',
    pinyin: "K'an",
    name: "L'Abissale",
    binary: '010010',
    sentenza: 'L\'abissale ripetuto. Se sei verace hai riuscita nel cuore, e ciò che fai incontra successo.',
    immagine: 'L\'acqua scorre ininterrottamente e arriva alla meta: l\'immagine dell\'abissale ripetuto.',
    keyword: 'profondità',
  },
  {
    number: 30,
    chinese: '離',
    pinyin: 'Li',
    name: "L'Aderente",
    binary: '101101',
    sentenza: 'L\'aderente. Propizia è perseveranza. Essa reca riuscita.',
    immagine: 'Il chiarore sorge due volte: l\'immagine del fuoco.',
    keyword: 'chiarezza',
  },
  {
    number: 51,
    chinese: '震',
    pinyin: 'Chên',
    name: 'Lo Scuotimento',
    binary: '001001',
    sentenza: 'Lo scuotimento reca riuscita. Lo scuotimento viene: uh, uh! Parole ridenti: ah, ah!',
    immagine: 'Tuono continuato: l\'immagine dello scuotimento. Così il nobile temendo e tremando mette ordine nella sua vita.',
    keyword: 'risveglio',
  },
  {
    number: 63,
    chinese: '既濟',
    pinyin: 'Chi Chi',
    name: 'Dopo il compimento',
    binary: '101010',
    sentenza: 'Riuscita nel piccolo. Propizia è perseveranza. In principio salute, alla fine scompiglio.',
    immagine: 'L\'acqua è al di sopra del fuoco: l\'immagine delle cose dopo il compimento.',
    keyword: 'compimento',
  },
];

// Renderer di un esagramma da stringa binaria '101010' (basso → alto in Wilhelm).
// In Wilhelm le linee si leggono dal BASSO (1) verso l'ALTO (6).
function renderHexagram(binary, size = 'md') {
  const lines = binary.split('').reverse(); // top-to-bottom for visual layout
  const sizes = {
    sm: { w: 'w-12', gap: 'gap-1', line: 'h-1' },
    md: { w: 'w-20', gap: 'gap-1.5', line: 'h-1.5' },
    lg: { w: 'w-28', gap: 'gap-2', line: 'h-2' },
  }[size];
  return (
    <div className={`flex flex-col ${sizes.gap} items-center`}>
      {lines.map((bit, i) => (
        <div key={i} className={`${sizes.w} flex justify-center items-center`}>
          {bit === '1' ? (
            <div className={`${sizes.w} ${sizes.line} bg-[#2C2C2C] rounded-sm`} />
          ) : (
            <div className={`flex ${sizes.gap}`}>
              <div className={`w-2/5 ${sizes.line} bg-[#2C2C2C] rounded-sm`} />
              <div className={`w-2/5 ${sizes.line} bg-[#2C2C2C] rounded-sm`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SEZIONE 1: Citazione di apertura — Wilhelm
// ════════════════════════════════════════════════════════════════
export function WilhelmOpening() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#F9F7F2] to-[#EBE8E1]">
      <div className="max-w-3xl mx-auto text-center">
        <Quote className="w-10 h-10 mx-auto text-[#C44D38] mb-6 opacity-60" />
        <blockquote className="font-serif text-2xl md:text-3xl text-[#2C2C2C] leading-relaxed italic mb-6">
          "Il Libro dei Mutamenti, in cinese <span className="font-medium not-italic">I King</span>,
          è senza dubbio uno dei libri più importanti della letteratura mondiale.
          Vi si presentano simboli e segni nei quali i saggi cinesi hanno cercato di trovare
          il segreto dei mutamenti dell'universo."
        </blockquote>
        <p className="text-sm uppercase tracking-widest text-[#7a6f63]">
          — Richard Wilhelm, prefazione al <span className="font-medium">I King</span>
        </p>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// SEZIONE 2: I 64 esagrammi — anteprima delle 8 carte cliccabili
// ════════════════════════════════════════════════════════════════
export function WilhelmHexagramsShowcase() {
  const [active, setActive] = useState(0);
  const hex = WILHELM_HEXAGRAMS_PREVIEW[active];

  return (
    <section className="py-20 px-6 bg-[#F9F7F2]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C44D38] mb-3">
            Il Libro dei Mutamenti
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#2C2C2C] mb-4">
            64 esagrammi,<br />
            <span className="italic">una sola saggezza.</span>
          </h2>
          <p className="text-[#595959] max-w-2xl mx-auto">
            Ogni esagramma è un'immagine del cosmo e dell'animo umano.
            Tocca un esagramma per ascoltare la sua Sentenza, come Richard Wilhelm la tradusse.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Lista esagrammi */}
          <div className="lg:col-span-2 grid grid-cols-4 gap-3">
            {WILHELM_HEXAGRAMS_PREVIEW.map((h, idx) => (
              <button
                key={h.number}
                onClick={() => setActive(idx)}
                className={`p-3 rounded-lg border transition group ${
                  idx === active
                    ? 'border-[#C44D38] bg-[#FDF4F1] shadow'
                    : 'border-[#E5E0D8] bg-white hover:border-[#C44D38]/50'
                }`}
                aria-label={`Esagramma ${h.number} ${h.name}`}
              >
                <div className="flex justify-center mb-1">
                  {renderHexagram(h.binary, 'sm')}
                </div>
                <div className="text-[10px] text-center text-[#7a6f63] mt-2">
                  #{h.number}
                </div>
                <div className="text-[10px] text-center text-[#2C2C2C] font-medium leading-tight">
                  {h.chinese}
                </div>
              </button>
            ))}
          </div>

          {/* Dettaglio esagramma attivo */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E5E0D8] p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-[#7a6f63] uppercase tracking-wider mb-1">
                  Esagramma #{hex.number}
                </p>
                <h3 className="font-serif text-3xl text-[#2C2C2C]">
                  {hex.chinese} <span className="text-xl text-[#7a6f63]">{hex.pinyin}</span>
                </h3>
                <p className="text-lg text-[#C44D38] italic mt-1">{hex.name}</p>
              </div>
              <div className="flex-shrink-0">{renderHexagram(hex.binary, 'md')}</div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C44D38] mb-1">
                  La Sentenza
                </div>
                <p className="text-[#2C2C2C] font-serif text-lg italic leading-snug">
                  «{hex.sentenza}»
                </p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a6f63] mb-1">
                  L'Immagine
                </div>
                <p className="text-[#3a3a3a] text-sm leading-relaxed">
                  {hex.immagine}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E5E0D8]">
              <span className="text-xs text-[#7a6f63]">
                Traduzione di <span className="font-medium">Richard Wilhelm</span>
              </span>
              <Link
                to="/library"
                className="inline-flex items-center gap-1.5 text-sm text-[#C44D38] hover:underline font-medium"
              >
                Esplora tutti i 64 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// SEZIONE 3: Come si fa una consultazione — tutorial animato
// ════════════════════════════════════════════════════════════════
export function ConsultationTutorial() {
  const steps = [
    {
      n: 1,
      title: 'Forma la domanda',
      desc: 'Concentrati su una questione che ti tocca profondamente. L\'I Ching risponde meglio a domande aperte sul "come" e "in che direzione".',
      icon: '🕯️',
    },
    {
      n: 2,
      title: 'Lancia tre monete, sei volte',
      desc: 'Ogni lancio di tre monete genera una linea. Sei linee, costruite dal basso verso l\'alto, formano l\'esagramma.',
      icon: '🪙',
    },
    {
      n: 3,
      title: 'Interpreta l\'esagramma',
      desc: 'Riceverai la Sentenza, l\'Immagine, e — se vi sono linee mutevoli — l\'esagramma derivato che ti mostra dove la situazione si dirige.',
      icon: '📖',
    },
    {
      n: 4,
      title: 'Medita e applica',
      desc: 'L\'oracolo non decide al posto tuo: illumina ciò che già sapevi nell\'inconscio. Lascia che la saggezza si depositi.',
      icon: '🧘',
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#EBE8E1] to-[#F9F7F2]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C44D38] mb-3">
            Il rituale
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#2C2C2C] mb-4">
            Come si interroga<br />
            <span className="italic">l'oracolo.</span>
          </h2>
          <p className="text-[#595959] max-w-2xl mx-auto">
            Quattro gesti millenari. Wilhelm li descrive così:
            <em className="block mt-2 text-[#3a3a3a]">
              "Lo Yi è imperscrutabile, vasto e perfetto. Il saggio rispetta il rito,
              perché nel rito si rivela il Tao."
            </em>
          </p>
        </div>

        <ol className="grid md:grid-cols-2 gap-6">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-[#C44D38] text-white flex items-center justify-center font-serif text-lg shadow">
                {s.n}
              </div>
              <div className="pt-3">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-serif text-xl text-[#2C2C2C] mb-2">{s.title}</h3>
                <p className="text-[#3a3a3a] leading-relaxed text-sm">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#C44D38] text-white font-medium hover:bg-[#A33D2B] transition shadow-lg"
          >
            Inizia la tua prima consultazione
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// SEZIONE 4: "La voce del Maestro" — citazioni Wilhelm
// ════════════════════════════════════════════════════════════════
export function WilhelmMasterVoice() {
  const quotes = [
    {
      text: 'Il libro dei mutamenti dischiude tutta la sua immensa portata solo a chi vi si accosta con animo puro e mente attenta.',
      hex: 'Prefazione',
    },
    {
      text: 'Tutto ciò che esiste sulla terra è una immagine del cielo.',
      hex: '1. Ch\'ien — Il Creativo',
    },
    {
      text: 'Il nobile rende se stesso forte e instancabile.',
      hex: '1. Ch\'ien — L\'Immagine',
    },
    {
      text: 'L\'oscuro e il chiaro si alternano: questa è la via.',
      hex: 'Ta Chuan',
    },
    {
      text: 'Quando la trasformazione è ancora in corso, sii prudente come chi attraversa un fiume in inverno.',
      hex: '15. Ch\'ien — La Modestia',
    },
    {
      text: 'Chi conosce gli altri è intelligente. Chi conosce sé stesso è illuminato.',
      hex: 'Lao Tzu, Tao Te Ching XXXIII',
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#2C2C2C] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C44D38] mb-3">
            La voce del Maestro
          </p>
          <h2 className="font-serif text-3xl md:text-5xl mb-4">
            Parole dal<br />
            <span className="italic text-[#C44D38]">Libro dei Mutamenti.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <figure
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition backdrop-blur"
            >
              <Quote className="w-5 h-5 text-[#C44D38] mb-3 opacity-80" />
              <blockquote className="font-serif text-lg leading-snug italic text-white/90 mb-4">
                {q.text}
              </blockquote>
              <figcaption className="text-xs uppercase tracking-wider text-white/50">
                {q.hex}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
