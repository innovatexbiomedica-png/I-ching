import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Search, ArrowLeft, Sparkles, Quote, ChevronRight, RefreshCw } from 'lucide-react';
import HexagramDrawing, { buildBinaryFromTrigrams, TRIGRAM_TO_BINARY } from '../components/HexagramDrawing';

const API = `${(process.env.REACT_APP_BACKEND_URL || 'https://iching-backend-ac3n.onrender.com')}/api`;

// ──────────────────────────────────────────────────────────────────
// Tematica delle 8 case (King Wen ordering ridotto a famiglie)
// ──────────────────────────────────────────────────────────────────
const TRIGRAM_INFO = {
  '☰': { name: 'Ch\'ien', element: 'Cielo', family: 'Padre',     attribute: 'Creativo / Forza',     color: '#D4A92F' },
  '☷': { name: 'K\'un',   element: 'Terra', family: 'Madre',     attribute: 'Ricettivo / Dedizione', color: '#8B6F35' },
  '☳': { name: 'Chên',    element: 'Tuono', family: 'Primo figlio', attribute: 'Eccitante / Movimento', color: '#7A4F8F' },
  '☵': { name: 'K\'an',   element: 'Acqua', family: 'Secondo figlio', attribute: 'Abissale / Pericolo', color: '#2C5282' },
  '☶': { name: 'Kên',     element: 'Monte', family: 'Terzo figlio',  attribute: 'Arresto / Quiete',     color: '#5B5249' },
  '☴': { name: 'Sun',     element: 'Vento', family: 'Prima figlia', attribute: 'Mite / Penetrazione',  color: '#4A7C59' },
  '☲': { name: 'Li',      element: 'Fuoco', family: 'Seconda figlia', attribute: 'Aderente / Chiarezza', color: '#C44D38' },
  '☱': { name: 'Tui',     element: 'Lago',  family: 'Terza figlia', attribute: 'Sereno / Gioia',        color: '#3498DB' },
};

const TRIGRAM_FILTERS = ['☰', '☷', '☳', '☵', '☶', '☴', '☲', '☱'];


// ════════════════════════════════════════════════════════════════
// CARD esagramma per la griglia
// ════════════════════════════════════════════════════════════════
function HexagramCard({ hex }) {
  const binary = buildBinaryFromTrigrams(hex.trigram_above, hex.trigram_below);
  const upperInfo = TRIGRAM_INFO[hex.trigram_above];
  return (
    <Link
      to={`/library/${hex.number}`}
      className="group block bg-white rounded-xl border border-[#E5E0D8] overflow-hidden hover:border-[#C44D38] hover:shadow-lg transition-all"
      data-testid={`hex-card-${hex.number}`}
    >
      {/* Top strip colour code: trigram superiore */}
      <div
        className="h-1 transition-all group-hover:h-1.5"
        style={{ background: upperInfo?.color || '#7a6f63' }}
      />
      <div className="p-3 flex flex-col items-center gap-2">
        <span className="text-[10px] text-[#7a6f63] tracking-widest uppercase">
          #{hex.number}
        </span>
        <div className="py-1">
          <HexagramDrawing lines={binary} size="sm" color="#2C2C2C" />
        </div>
        <div className="text-center">
          <div className="text-lg font-serif text-[#2C2C2C] leading-none">{hex.chinese?.split(' ')[0]}</div>
          <div className="text-[10px] text-[#7a6f63] mt-1 leading-tight">{hex.chinese?.split(' ')[1]}</div>
          <div className="text-xs font-medium text-[#2C2C2C] mt-1 leading-snug min-h-[2.4em]">{hex.name}</div>
        </div>
      </div>
    </Link>
  );
}


// ════════════════════════════════════════════════════════════════
// VISTA DETTAGLIO
// ════════════════════════════════════════════════════════════════
function HexagramDetail({ hex, language }) {
  const binary = buildBinaryFromTrigrams(hex.trigram_above?.symbol, hex.trigram_below?.symbol)
    || hex.binary
    || '000000';

  const upperKey = hex.trigram_above?.symbol;
  const lowerKey = hex.trigram_below?.symbol;
  const upperInfo = TRIGRAM_INFO[upperKey];
  const lowerInfo = TRIGRAM_INFO[lowerKey];

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/library"
        className="inline-flex items-center text-[#C44D38] hover:underline mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        {language === 'it' ? 'Torna alla Biblioteca' : 'Back to Library'}
      </Link>

      {/* ── HERO: esagramma grande + nome cinese ── */}
      <header className="relative overflow-hidden rounded-2xl mb-8 border border-[#E5E0D8]"
        style={{
          background: `linear-gradient(135deg, ${upperInfo?.color || '#2C2C2C'}10 0%, ${lowerInfo?.color || '#2C2C2C'}15 100%)`,
        }}
      >
        <div className="absolute -right-12 -top-12 opacity-[0.06] pointer-events-none">
          <HexagramDrawing lines={binary} size="xl" color="#2C2C2C" />
        </div>
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-inner border border-white">
            <HexagramDrawing lines={binary} size="lg" color="#2C2C2C" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a6f63] mb-1">
              {language === 'it' ? `Esagramma ${hex.number} di 64` : `Hexagram ${hex.number} of 64`}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#2C2C2C] mb-2 leading-none">
              {hex.chinese?.split(' ')[0]}
            </h1>
            <p className="text-2xl text-[#7a6f63] italic mb-3">{hex.chinese?.split(' ')[1] || ''}</p>
            <p className="text-2xl font-serif text-[#C44D38]">{hex.name}</p>
          </div>
        </div>
      </header>

      {/* ── TRIGRAMMI ── */}
      <section className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { info: upperInfo, label: language === 'it' ? 'Trigramma Superiore' : 'Upper Trigram', binary: TRIGRAM_TO_BINARY[upperKey] },
          { info: lowerInfo, label: language === 'it' ? 'Trigramma Inferiore' : 'Lower Trigram', binary: TRIGRAM_TO_BINARY[lowerKey] },
        ].map((t, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#E5E0D8] bg-white p-5 flex items-center gap-5"
          >
            <div
              className="p-3 rounded-lg flex-shrink-0"
              style={{ background: (t.info?.color || '#7a6f63') + '15' }}
            >
              <HexagramDrawing lines={t.binary + '000'} size="sm" color={t.info?.color || '#2C2C2C'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#7a6f63] mb-0.5">{t.label}</p>
              <h3 className="font-serif text-xl text-[#2C2C2C]">
                {t.info?.element || '—'}
                <span className="text-sm text-[#7a6f63] ml-2 font-sans">{t.info?.name}</span>
              </h3>
              <p className="text-xs text-[#3a3a3a] mt-1">{t.info?.attribute} · <em className="text-[#7a6f63]">{t.info?.family}</em></p>
            </div>
          </div>
        ))}
      </section>

      {/* ── LA SENTENZA ── */}
      {hex.giudizio && (
        <section className="mb-8 relative">
          <div className="absolute -left-2 top-0 text-[#C44D38]/15">
            <Quote className="w-12 h-12" />
          </div>
          <div className="pl-12">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C44D38] mb-2">
              {language === 'it' ? 'La Sentenza' : 'The Judgment'}
            </p>
            <p className="font-serif text-xl text-[#2C2C2C] italic leading-relaxed">
              «{hex.giudizio}»
            </p>
          </div>
        </section>
      )}

      {/* ── L'IMMAGINE ── */}
      {hex.immagine && (
        <section className="mb-8 rounded-xl bg-[#F9F7F2] p-6 border border-[#E5E0D8]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#7a6f63] mb-2">
            {language === 'it' ? "L'Immagine" : 'The Image'}
          </p>
          <p className="text-[#2C2C2C] leading-relaxed">{hex.immagine}</p>
        </section>
      )}

      {/* ── COMMENTO ── */}
      {hex.commento && (
        <section className="mb-8">
          <h3 className="font-serif text-xl text-[#2C2C2C] mb-3">
            {language === 'it' ? 'Commento' : 'Commentary'}
          </h3>
          <p className="text-[#3a3a3a] leading-relaxed">{hex.commento}</p>
        </section>
      )}

      {/* ── LE 6 LINEE ── */}
      {hex.lines && hex.lines.length > 0 && (
        <section className="mb-8">
          <h3 className="font-serif text-2xl text-[#2C2C2C] mb-4">
            {language === 'it' ? 'Le sei linee' : 'The six lines'}
          </h3>
          <div className="space-y-3">
            {[...hex.lines].reverse().map((line) => {
              const bin = binary[line.position - 1] || '0';
              const isYang = bin === '1';
              return (
                <div
                  key={line.position}
                  className="flex gap-4 p-4 rounded-lg border border-[#E5E0D8] bg-white hover:border-[#C44D38]/40 transition"
                >
                  {/* Linea n. + disegno */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2 w-16">
                    <div className="text-lg font-serif text-[#C44D38]">{line.position}</div>
                    {isYang ? (
                      <div className="w-12 h-1.5 bg-[#2C2C2C] rounded" />
                    ) : (
                      <div className="w-12 flex gap-1.5">
                        <div className="flex-1 h-1.5 bg-[#2C2C2C] rounded" />
                        <div className="flex-1 h-1.5 bg-[#2C2C2C] rounded" />
                      </div>
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-[#7a6f63]">
                      {isYang ? 'yang' : 'yin'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {line.text && (
                      <p className="font-serif text-[#2C2C2C] italic mb-1.5 leading-snug">
                        «{line.text}»
                      </p>
                    )}
                    {line.meaning && (
                      <p className="text-sm text-[#595959] leading-relaxed">{line.meaning}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <div className="mt-12 rounded-xl bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] text-white p-8 text-center">
        <Sparkles className="w-10 h-10 text-[#C44D38] mx-auto mb-3" />
        <h3 className="font-serif text-2xl mb-2">
          {language === 'it'
            ? "Lascia che l'oracolo ti parli"
            : 'Let the oracle speak to you'}
        </h3>
        <p className="text-sm text-white/70 mb-5 max-w-md mx-auto">
          {language === 'it'
            ? "Hai esplorato questo esagramma. Ora fai una consultazione e scopri quale messaggio l'I Ching ha per te oggi."
            : 'You have explored this hexagram. Now make a consultation and discover the message the I Ching has for you today.'}
        </p>
        <Link
          to="/consult"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C44D38] text-white font-medium hover:bg-[#A33D2B]"
        >
          {language === 'it' ? 'Fai una consultazione' : 'Make a consultation'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}


// ════════════════════════════════════════════════════════════════
// LIBRARY MAIN
// ════════════════════════════════════════════════════════════════
const Library = () => {
  const { language, getToken } = useAuth();
  const { hexagramId } = useParams();

  const [hexagrams, setHexagrams] = useState([]);
  const [selectedHexagram, setSelectedHexagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUpper, setFilterUpper] = useState(null);
  const [filterLower, setFilterLower] = useState(null);
  const [activeTab, setActiveTab] = useState('hexagrams');
  const [trigrams, setTrigrams] = useState([]);

  // Fetch list once
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [hexRes, triRes] = await Promise.all([
          axios.get(`${API}/library/hexagrams`, { headers }),
          axios.get(`${API}/library/trigrams`, { headers }).catch(() => ({ data: [] })),
        ]);
        if (cancel) return;
        setHexagrams(hexRes.data);
        setTrigrams(triRes.data || []);
      } catch (e) {
        console.error('Library load error', e);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch detail when id changes
  useEffect(() => {
    if (!hexagramId) {
      setSelectedHexagram(null);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const r = await axios.get(`${API}/library/hexagrams/${hexagramId}`, { headers });
        if (!cancel) setSelectedHexagram(r.data);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hexagramId]);

  const filtered = useMemo(() => {
    return hexagrams.filter((h) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        h.name?.toLowerCase().includes(q) ||
        h.chinese?.toLowerCase().includes(q) ||
        String(h.number).includes(q);
      const matchesUpper = !filterUpper || h.trigram_above === filterUpper;
      const matchesLower = !filterLower || h.trigram_below === filterLower;
      return matchesQuery && matchesUpper && matchesLower;
    });
  }, [hexagrams, searchTerm, filterUpper, filterLower]);

  // Detail view
  if (selectedHexagram) {
    return <HexagramDetail hex={selectedHexagram} language={language} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex w-14 h-14 rounded-full bg-[#C44D38]/10 items-center justify-center mb-4">
          <BookOpen className="w-7 h-7 text-[#C44D38]" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2C2C2C] mb-2">
          {language === 'it' ? 'Biblioteca del Libro dei Mutamenti' : 'Book of Changes Library'}
        </h1>
        <p className="text-[#7a6f63] max-w-2xl mx-auto text-sm">
          {language === 'it'
            ? '64 esagrammi, 8 trigrammi, una saggezza millenaria. Esplora ogni segno con la traduzione di Richard Wilhelm.'
            : '64 hexagrams, 8 trigrams, a millenary wisdom. Explore each sign through Richard Wilhelm\'s translation.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { id: 'hexagrams', it: 'Esagrammi (64)', en: 'Hexagrams (64)' },
          { id: 'trigrams', it: 'Trigrammi (8)', en: 'Trigrams (8)' },
          { id: 'guide',    it: 'Guida', en: 'Guide' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              activeTab === t.id
                ? 'bg-[#C44D38] text-white shadow'
                : 'bg-[#F9F7F2] border border-[#D1CDC7] text-[#3a3a3a] hover:border-[#C44D38]'
            }`}
          >
            {language === 'it' ? t.it : t.en}
          </button>
        ))}
      </div>

      {/* TAB: HEXAGRAMS */}
      {activeTab === 'hexagrams' && (
        <>
          {/* Search + filters */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6f63] w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'it' ? 'Cerca per nome, numero o nome cinese...' : 'Search by name, number or Chinese name...'}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-[#D1CDC7] bg-white focus:border-[#C44D38] focus:outline-none focus:ring-1 focus:ring-[#C44D38]/30 text-sm"
              />
              {(searchTerm || filterUpper || filterLower) && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterUpper(null); setFilterLower(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6f63] hover:text-[#C44D38]"
                  title={language === 'it' ? 'Pulisci filtri' : 'Clear filters'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <TrigramFilter
                label={language === 'it' ? 'Trigramma superiore' : 'Upper trigram'}
                value={filterUpper}
                onChange={setFilterUpper}
              />
              <TrigramFilter
                label={language === 'it' ? 'Trigramma inferiore' : 'Lower trigram'}
                value={filterLower}
                onChange={setFilterLower}
              />
            </div>
            <p className="text-xs text-[#7a6f63] text-center">
              {filtered.length} / 64
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#E5E0D8] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#7a6f63]">
              {language === 'it' ? 'Nessun esagramma corrisponde ai filtri.' : 'No hexagrams match the filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {filtered.map((hex) => (
                <HexagramCard key={hex.number} hex={hex} />
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB: TRIGRAMS */}
      {activeTab === 'trigrams' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(TRIGRAM_INFO).map(([symbol, info]) => (
            <div
              key={symbol}
              className="rounded-xl border border-[#E5E0D8] bg-white p-5 hover:border-[#C44D38] transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: info.color + '15' }}
                >
                  <HexagramDrawing
                    lines={TRIGRAM_TO_BINARY[symbol] + '000'}
                    size="sm"
                    color={info.color}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl text-[#2C2C2C]">{info.element}</h3>
                  <p className="text-sm text-[#7a6f63] mb-1">{info.name}</p>
                  <p className="text-xs text-[#3a3a3a]">{info.attribute}</p>
                  <p className="text-[10px] text-[#7a6f63] mt-1 italic">{info.family}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: GUIDE */}
      {activeTab === 'guide' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <GuideCard
            title={language === 'it' ? "Cos'è l'I Ching?" : 'What is the I Ching?'}
            body={language === 'it'
              ? `L'I Ching (易經), o "Libro dei Mutamenti", è uno dei testi più antichi e influenti
                 della letteratura cinese, risalente a oltre 3.000 anni fa. Più che un libro di divinazione,
                 è un sistema filosofico che descrive la natura ciclica del cambiamento attraverso 64 esagrammi —
                 figure di sei linee yin (spezzate) e yang (continue).`
              : `The I Ching (易經), or "Book of Changes", is one of the oldest and most influential texts in
                 Chinese literature, dating back over 3,000 years. More than a divination book, it is a
                 philosophical system describing the cyclical nature of change through 64 hexagrams —
                 figures of six yin (broken) and yang (solid) lines.`}
          />
          <GuideCard
            title={language === 'it' ? 'Yin e Yang — i due principi' : 'Yin and Yang — the two principles'}
            body={language === 'it'
              ? `Lo Yin è ricettivo, oscuro, femminile, terreno, freddo. Lo Yang è creativo, luminoso,
                 maschile, celeste, caldo. Non sono opposti in conflitto ma poli complementari: la realtà
                 nasce dal loro intrecciarsi. Ogni linea dell'esagramma è yin o yang; se è "vecchia"
                 (lanciata con 6 o 9 monete) sta mutando nel suo opposto.`
              : `Yin is receptive, dark, feminine, earthly, cool. Yang is creative, bright, masculine,
                 heavenly, warm. They are not opposing forces in conflict but complementary poles: reality
                 arises from their interplay. Each hexagram line is either yin or yang; if it's "old"
                 (tossed with 6 or 9), it is transforming into its opposite.`}
          />
          <GuideCard
            title={language === 'it' ? 'Le otto immagini fondamentali' : 'The eight fundamental images'}
            body={language === 'it'
              ? `Combinando tre linee otteniamo otto trigrammi, ciascuno corrispondente a un fenomeno
                 naturale: Cielo, Terra, Tuono, Acqua, Monte, Vento, Fuoco, Lago. Due trigrammi sovrapposti
                 formano un esagramma. Il trigramma in alto rappresenta la situazione esterna o lo sviluppo,
                 quello in basso la base interiore o il punto di partenza.`
              : `Combining three lines yields eight trigrams, each corresponding to a natural phenomenon:
                 Heaven, Earth, Thunder, Water, Mountain, Wind, Fire, Lake. Two stacked trigrams form a
                 hexagram. The upper trigram represents the outer situation; the lower one, the inner
                 foundation.`}
          />
          <GuideCard
            title={language === 'it' ? 'Come si consulta l\'oracolo' : 'How to consult the oracle'}
            body={language === 'it'
              ? `1. Formula chiaramente la domanda con animo aperto.
                 2. Lancia tre monete uguali; testa (yang) = 3, croce (yin) = 2.
                 3. Somma il risultato per ottenere 6, 7, 8 o 9 e annota la prima linea (basso).
                 4. Ripeti per sei lanci, costruendo l'esagramma dal basso verso l'alto.
                 5. Le linee 6 e 9 sono "mutevoli": cambiano polarità e generano un secondo esagramma
                    che indica dove la situazione si sta dirigendo.`
              : `1. Formulate your question clearly with an open mind.
                 2. Toss three identical coins; heads (yang) = 3, tails (yin) = 2.
                 3. Sum the result to get 6, 7, 8 or 9 and note the first line (bottom).
                 4. Repeat for six tosses, building the hexagram bottom-up.
                 5. Lines 6 and 9 are "changing": they reverse polarity and produce a second hexagram
                    showing where the situation is heading.`}
          />
          <GuideCard
            title={language === 'it' ? 'Le 4 modalità delle linee' : 'The 4 line modalities'}
            body={language === 'it'
              ? `• 6 = vecchio yin → linea spezzata MUTEVOLE\n• 7 = giovane yang → linea continua stabile\n• 8 = giovane yin → linea spezzata stabile\n• 9 = vecchio yang → linea continua MUTEVOLE`
              : `• 6 = old yin → CHANGING broken line\n• 7 = young yang → stable solid line\n• 8 = young yin → stable broken line\n• 9 = old yang → CHANGING solid line`}
          />
          <GuideCard
            title={language === 'it' ? 'Carl Jung e l\'I Ching' : 'Carl Jung and the I Ching'}
            body={language === 'it'
              ? `Lo psicoanalista svizzero Carl Gustav Jung scrisse la prefazione alla traduzione tedesca
                 di Wilhelm (1949). Per Jung l'I Ching non è superstizione ma manifestazione di un principio
                 da lui chiamato "sincronicità": la coincidenza significativa tra il lancio delle monete
                 (caso esteriore) e lo stato d'animo del consultante (necessità interiore).`
              : `The Swiss psychoanalyst Carl Gustav Jung wrote the foreword to Wilhelm's German translation
                 (1949). For Jung the I Ching is not superstition but a manifestation of what he called
                 "synchronicity": the meaningful coincidence between the coin toss (outer chance) and the
                 querent's state of mind (inner necessity).`}
          />
        </div>
      )}
    </div>
  );
};

function TrigramFilter({ label, value, onChange }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[#7a6f63] mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange(null)}
          className={`px-2.5 py-1 rounded text-xs ${
            !value ? 'bg-[#C44D38] text-white' : 'bg-white border border-[#D1CDC7] text-[#3a3a3a] hover:border-[#C44D38]'
          }`}
        >
          ⌀
        </button>
        {TRIGRAM_FILTERS.map((sym) => {
          const info = TRIGRAM_INFO[sym];
          const selected = value === sym;
          return (
            <button
              key={sym}
              onClick={() => onChange(selected ? null : sym)}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                selected
                  ? 'text-white shadow'
                  : 'bg-white border border-[#D1CDC7] text-[#3a3a3a] hover:border-[#C44D38]'
              }`}
              style={selected ? { background: info.color } : {}}
              title={`${info.name} · ${info.element}`}
            >
              <span className="text-base leading-none">{sym}</span>
              <span className="hidden md:inline">{info.element}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GuideCard({ title, body }) {
  return (
    <div className="rounded-xl border border-[#E5E0D8] bg-white p-6">
      <h3 className="font-serif text-xl text-[#2C2C2C] mb-3">{title}</h3>
      <p className="text-[15px] text-[#3a3a3a] leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  );
}

export default Library;
