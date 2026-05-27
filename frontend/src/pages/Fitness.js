import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Check, Lock, Sparkles, Zap, BookOpen, Heart, Trophy, RefreshCw } from 'lucide-react';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://iching-backend-ac3n.onrender.com') + '/api';

/* ════════════════════════════════════════════════════════════
   Onboarding wizard
   ════════════════════════════════════════════════════════════ */
function Onboarding({ questions, lang, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const choose = (val) => setAnswers((a) => ({ ...a, [q.id]: val }));

  const next = async () => {
    if (answers[q.id] === undefined) {
      toast.error(lang === 'it' ? 'Scegli una risposta' : 'Pick an answer');
      return;
    }
    if (!isLast) {
      setIdx(idx + 1);
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/fitness/onboarding`, { answers }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(lang === 'it' ? 'Questionario salvato!' : 'Questionnaire saved!');
      onComplete();
    } catch (e) {
      const detail = e.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : (detail?.message || 'Errore'));
    } finally {
      setSubmitting(false);
    }
  };

  const labels = q.type === 'scale_5'
    ? (lang === 'it' ? q.labels_it : (q.labels_en || q.labels_it))
    : (lang === 'it' ? q.options_it : (q.options_en || q.options_it));

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6 flex items-center justify-between text-sm text-[#7a6f63]">
        <span>{lang === 'it' ? 'Onboarding' : 'Onboarding'}</span>
        <span>{idx + 1} / {questions.length}</span>
      </div>
      <div className="h-1 bg-[#E5E0D8] rounded mb-8 overflow-hidden">
        <div className="h-full bg-[#C44D38] transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>

      <h2 className="text-2xl font-serif text-[#2C2C2C] mb-2">
        {lang === 'it' ? q.question_it : (q.question_en || q.question_it)}
      </h2>
      <p className="text-xs uppercase tracking-wider text-[#C44D38] mb-6">
        {q.category}
      </p>

      <div className="space-y-2 mb-8">
        {labels.map((label, i) => {
          const selected = answers[q.id] === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`w-full text-left p-4 rounded-lg border transition ${
                selected
                  ? 'border-[#C44D38] bg-[#FDF4F1] text-[#2C2C2C]'
                  : 'border-[#D1CDC7] hover:border-[#C44D38] text-[#3a3a3a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                  selected ? 'border-[#C44D38] bg-[#C44D38]' : 'border-[#D1CDC7]'
                }`}>
                  {selected && <div className="w-full h-full rounded-full bg-white scale-50" />}
                </div>
                <span className="text-sm">{label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0 || submitting}
          className="px-4 py-2 rounded border border-[#D1CDC7] text-[#3a3a3a] disabled:opacity-40"
        >
          ← {lang === 'it' ? 'Indietro' : 'Back'}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={submitting}
          className="px-6 py-2 rounded bg-[#C44D38] text-white font-medium hover:bg-[#A33D2B] disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLast
            ? (lang === 'it' ? 'Salva e continua' : 'Save and continue')
            : (lang === 'it' ? 'Avanti' : 'Next')}
          {!isLast && ' →'}
        </button>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════
   Activity card
   ════════════════════════════════════════════════════════════ */
const CATEGORY_ICONS = {
  sport: <Zap className="w-4 h-4" />,
  cultura: <BookOpen className="w-4 h-4" />,
  benessere: <Heart className="w-4 h-4" />,
};

const CATEGORY_COLOR = {
  sport: 'text-orange-600 bg-orange-50',
  cultura: 'text-purple-700 bg-purple-50',
  benessere: 'text-emerald-700 bg-emerald-50',
};

function ActivityCard({ activity, onToggle, busy }) {
  const cat = activity.category;
  return (
    <div
      className={`rounded-lg border p-3 transition ${
        activity.completed
          ? 'border-emerald-400 bg-emerald-50/50'
          : 'border-[#E5E0D8] bg-white hover:border-[#C44D38]/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(activity.id)}
          disabled={busy}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
            activity.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-[#D1CDC7] hover:border-[#C44D38]'
          }`}
          aria-label="toggle complete"
        >
          {activity.completed && <Check className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${CATEGORY_COLOR[cat] || 'bg-gray-100 text-gray-700'}`}>
              {CATEGORY_ICONS[cat]}
              {cat}
            </span>
            {activity.duration_min ? (
              <span className="text-xs text-[#7a6f63]">{activity.duration_min}'</span>
            ) : null}
          </div>
          <h4 className={`font-medium text-sm ${activity.completed ? 'text-[#7a6f63] line-through' : 'text-[#2C2C2C]'}`}>
            {activity.title}
          </h4>
          <p className="text-xs text-[#595959] mt-1 leading-snug">{activity.desc}</p>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════
   Program viewer
   ════════════════════════════════════════════════════════════ */
function ProgramView({ program, stats, onToggle, onRegenerate, busyId, lang }) {
  const completed = program.days.flatMap((d) => d.activities).filter((a) => a.completed).length;
  const total = program.days.flatMap((d) => d.activities).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header / stats */}
      <div className="rounded-xl bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] text-white p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-2xl mb-1">
              {lang === 'it' ? 'Il tuo programma settimanale' : 'Your weekly program'}
            </h2>
            <p className="text-sm text-white/70">
              {new Date(program.week_start).toLocaleDateString()} → {new Date(program.week_end).toLocaleDateString()}
            </p>
            {program.hexagram_anchor?.number && (
              <p className="text-xs mt-2 text-white/60 italic">
                ☯ {lang === 'it' ? 'Tema della settimana:' : 'Theme of the week:'} #{program.hexagram_anchor.number} «{program.hexagram_anchor.name}»
              </p>
            )}
          </div>
          <button
            onClick={onRegenerate}
            className="px-3 py-2 rounded border border-white/30 text-sm hover:bg-white/10 flex items-center gap-2"
            title={lang === 'it' ? 'Rigenera programma' : 'Regenerate'}
          >
            <RefreshCw className="w-4 h-4" />
            {lang === 'it' ? 'Rigenera' : 'Regenerate'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#C44D38]">{completed}/{total}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider mt-1">
              {lang === 'it' ? 'Attività completate' : 'Activities done'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#C44D38]">{stats?.xp ?? 0}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider mt-1">XP</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#C44D38]">{stats?.streak_days ?? 0}🔥</div>
            <div className="text-xs text-white/60 uppercase tracking-wider mt-1">
              {lang === 'it' ? 'Giorni di fila' : 'Day streak'}
            </div>
          </div>
        </div>

        <div className="mt-4 h-2 bg-white/10 rounded overflow-hidden">
          <div className="h-full bg-[#C44D38] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Badges */}
      {stats?.badges?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.badges.map((b) => (
            <div
              key={b.id}
              className="px-3 py-1.5 rounded-full bg-[#FDF4F1] border border-[#C44D38]/30 text-xs flex items-center gap-1.5"
            >
              <Trophy className="w-3 h-3 text-[#C44D38]" />
              <span className="font-medium text-[#2C2C2C]">{b.title_it}</span>
            </div>
          ))}
        </div>
      )}

      {/* Days */}
      <div className="space-y-4">
        {program.days.map((day) => {
          const doneToday = day.activities.filter((a) => a.completed).length;
          const isToday = new Date(day.date).toDateString() === new Date().toDateString();
          return (
            <div key={day.day_index} className={`rounded-xl border p-4 ${
              isToday ? 'border-[#C44D38] bg-[#FDF4F1]/30' : 'border-[#E5E0D8] bg-white'
            }`}>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-serif text-lg text-[#2C2C2C]">
                  {lang === 'it' ? day.weekday_it : day.weekday_en}
                  {isToday && (
                    <span className="ml-2 text-xs text-[#C44D38] uppercase tracking-wider">
                      • {lang === 'it' ? 'Oggi' : 'Today'}
                    </span>
                  )}
                </h3>
                <span className="text-xs text-[#7a6f63]">
                  {doneToday}/{day.activities.length}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {day.activities.map((a) => (
                  <ActivityCard
                    key={a.id}
                    activity={a}
                    onToggle={onToggle}
                    busy={busyId === a.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
const Fitness = () => {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [program, setProgram] = useState(null);
  const [stats, setStats] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [busyActivityId, setBusyActivityId] = useState(null);

  useEffect(() => {
    document.title = 'Fitness Coaching — I Ching del Benessere';
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const boot = async () => {
    setLoading(true);
    try {
      // 1. check plan
      const sub = await axios.get(`${API}/subscription/status`, { headers: authHeaders() });
      const can = sub.data?.limits?.can_fitness_coaching === true;
      setHasAccess(can);
      if (!can) {
        setLoading(false);
        return;
      }
      // 2. questions
      const q = await axios.get(`${API}/fitness/onboarding/questions`, { headers: authHeaders() });
      setQuestions(q.data.questions || []);
      // 3. profile
      const p = await axios.get(`${API}/fitness/onboarding`, { headers: authHeaders() });
      setHasProfile(p.data.has_profile);
      // 4. program (if any)
      if (p.data.has_profile) {
        const cur = await axios.get(`${API}/fitness/program/current`, { headers: authHeaders() });
        setProgram(cur.data.program);
        const st = await axios.get(`${API}/fitness/stats`, { headers: authHeaders() });
        setStats(st.data);
      }
    } catch (e) {
      console.error(e);
      toast.error(language === 'it' ? 'Errore nel caricamento' : 'Loading error');
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await axios.post(`${API}/fitness/program/generate`, {}, { headers: authHeaders() });
      setProgram(r.data);
      toast.success(language === 'it' ? 'Programma generato!' : 'Program generated!');
      const st = await axios.get(`${API}/fitness/stats`, { headers: authHeaders() });
      setStats(st.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Errore');
    } finally {
      setGenerating(false);
    }
  };

  const toggle = async (activityId) => {
    setBusyActivityId(activityId);
    try {
      await axios.post(`${API}/fitness/activity/${activityId}/complete`, {}, { headers: authHeaders() });
      // refresh
      const cur = await axios.get(`${API}/fitness/program/current`, { headers: authHeaders() });
      setProgram(cur.data.program);
      const st = await axios.get(`${API}/fitness/stats`, { headers: authHeaders() });
      setStats(st.data);
    } catch (e) {
      toast.error('Errore');
    } finally {
      setBusyActivityId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C44D38]" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center py-16">
        <Lock className="w-12 h-12 mx-auto mb-4 text-[#C44D38]" />
        <h1 className="text-3xl font-serif text-[#2C2C2C] mb-3">
          {language === 'it' ? 'Fitness & Coaching' : 'Fitness & Coaching'}
        </h1>
        <p className="text-[#595959] mb-6">
          {language === 'it'
            ? 'Il programma interattivo Sport, Cultura e Benessere è incluso nel piano Fitness Coaching.'
            : 'The interactive Sport, Culture & Wellness program is part of the Fitness Coaching plan.'}
        </p>
        <button
          onClick={() => navigate('/subscription')}
          className="px-6 py-3 rounded-lg bg-[#C44D38] text-white font-medium hover:bg-[#A33D2B]"
        >
          {language === 'it' ? 'Scopri il piano' : 'See the plan'}
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-[#C44D38] mb-2" />
          <h1 className="text-3xl font-serif text-[#2C2C2C]">
            {language === 'it' ? 'Fitness & Coaching' : 'Fitness & Coaching'}
          </h1>
          <p className="text-sm text-[#7a6f63] mt-1">
            {language === 'it'
              ? 'Sport, Cultura, Benessere — un programma su misura per te'
              : 'Sport, Culture, Wellness — a program tailored to you'}
          </p>
        </div>

        {!hasProfile ? (
          <Onboarding
            questions={questions}
            lang={language}
            onComplete={async () => {
              setHasProfile(true);
              await generate();
            }}
          />
        ) : !program ? (
          <div className="max-w-xl mx-auto text-center py-12">
            <p className="text-[#3a3a3a] mb-6">
              {language === 'it'
                ? 'Genera il tuo primo programma settimanale personalizzato.'
                : 'Generate your first personalized weekly program.'}
            </p>
            <button
              onClick={generate}
              disabled={generating}
              className="px-6 py-3 rounded-lg bg-[#C44D38] text-white font-medium hover:bg-[#A33D2B] inline-flex items-center gap-2"
            >
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              {language === 'it' ? '✨ Genera programma' : '✨ Generate program'}
            </button>
          </div>
        ) : (
          <ProgramView
            program={program}
            stats={stats}
            onToggle={toggle}
            onRegenerate={generate}
            busyId={busyActivityId}
            lang={language}
          />
        )}
      </div>
    </div>
  );
};

export default Fitness;
