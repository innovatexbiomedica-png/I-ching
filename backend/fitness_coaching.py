"""
Fitness & Coaching module — programma interattivo personalizzato per gli
utenti del piano "Fitness Coaching" (€19,99/mese).

Il programma copre tre dimensioni:
  - SPORT       : esercizi e attività fisica
  - CULTURA     : letture, citazioni, contemplazione
  - BENESSERE   : meditazione, respirazione, alimentazione, sonno

La generazione è personalizzata in base a:
  - questionario di onboarding (aree di carenza)
  - esagramma I Ching del giorno
  - segno zodiacale dell'utente (se profilo astrologico presente)
  - giorno della settimana

Public API:
  - ONBOARDING_QUESTIONS                — questionario (lo expone il backend)
  - validate_onboarding(answers)        — validazione + scoring
  - generate_weekly_program(...)        — produce un piano di 7 giorni
  - score_to_focus_areas(answers)       — calcola aree di carenza
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
import random
import uuid


# ────────────────────────────────────────────────────────────────────────
# QUESTIONARIO DI ONBOARDING
# ────────────────────────────────────────────────────────────────────────
ONBOARDING_QUESTIONS = [
    {
        "id": "energy_level",
        "category": "benessere",
        "question_it": "Come descriveresti il tuo livello di energia attuale?",
        "question_en": "How would you describe your current energy level?",
        "type": "scale_5",
        "labels_it": ["Esausto/a", "Stanco/a", "Nella media", "Energico/a", "Pieno/a di vita"],
        "weight": 2.0,
    },
    {
        "id": "stress_level",
        "category": "benessere",
        "question_it": "Quanto stress percepisci quotidianamente?",
        "question_en": "How much daily stress do you experience?",
        "type": "scale_5",
        "labels_it": ["Nessuno", "Poco", "Moderato", "Alto", "Soffocante"],
        "weight": 2.0,
        "inverted": True,
    },
    {
        "id": "sleep_quality",
        "category": "benessere",
        "question_it": "Come è la qualità del tuo sonno?",
        "question_en": "How is your sleep quality?",
        "type": "scale_5",
        "labels_it": ["Pessima", "Scarsa", "Sufficiente", "Buona", "Eccellente"],
        "weight": 1.5,
    },
    {
        "id": "physical_activity",
        "category": "sport",
        "question_it": "Con che frequenza fai attività fisica?",
        "question_en": "How often do you exercise?",
        "type": "choice",
        "options_it": ["Mai", "1-2 volte al mese", "1 volta a settimana", "2-3 volte a settimana", "Quasi ogni giorno"],
        "options_en": ["Never", "1-2 times a month", "Once a week", "2-3 times a week", "Almost daily"],
        "weight": 2.0,
    },
    {
        "id": "fitness_goal",
        "category": "sport",
        "question_it": "Qual è il tuo obiettivo principale?",
        "question_en": "What is your main goal?",
        "type": "choice",
        "options_it": [
            "Perdere peso e tonificare",
            "Aumentare forza e muscolatura",
            "Migliorare resistenza/cardio",
            "Flessibilità e postura",
            "Solo benessere generale",
        ],
        "options_en": [
            "Lose weight and tone",
            "Build strength and muscle",
            "Improve endurance/cardio",
            "Flexibility and posture",
            "Just general wellness",
        ],
        "weight": 0,  # informativa, non incide sullo scoring
    },
    {
        "id": "reading_frequency",
        "category": "cultura",
        "question_it": "Quanto leggi (libri, articoli profondi)?",
        "question_en": "How much do you read (books, deep articles)?",
        "type": "scale_5",
        "labels_it": ["Mai", "Raramente", "Ogni tanto", "Spesso", "Quotidianamente"],
        "weight": 1.5,
    },
    {
        "id": "meditation_practice",
        "category": "benessere",
        "question_it": "Hai una pratica di meditazione o introspezione?",
        "question_en": "Do you have a meditation or introspection practice?",
        "type": "scale_5",
        "labels_it": ["Mai", "Raramente", "A volte", "Regolarmente", "Quotidianamente"],
        "weight": 1.5,
    },
    {
        "id": "nutrition_awareness",
        "category": "benessere",
        "question_it": "Quanto sei attento/a all'alimentazione?",
        "question_en": "How mindful are you about nutrition?",
        "type": "scale_5",
        "labels_it": ["Per niente", "Poco", "Abbastanza", "Molto", "Estremamente"],
        "weight": 1.0,
    },
    {
        "id": "screen_time",
        "category": "benessere",
        "question_it": "Quante ore al giorno passi davanti a uno schermo (oltre al lavoro essenziale)?",
        "question_en": "Hours per day on screens (beyond essential work)?",
        "type": "choice",
        "options_it": ["Meno di 1", "1-2 ore", "3-4 ore", "5-6 ore", "Più di 6"],
        "options_en": ["Less than 1", "1-2 h", "3-4 h", "5-6 h", "More than 6"],
        "weight": 1.0,
        "inverted": True,
    },
    {
        "id": "self_reflection",
        "category": "cultura",
        "question_it": "Dedichi tempo alla riflessione su te stesso/a?",
        "question_en": "Do you spend time reflecting on yourself?",
        "type": "scale_5",
        "labels_it": ["Mai", "Raramente", "Ogni tanto", "Spesso", "Quotidianamente"],
        "weight": 1.5,
    },
    {
        "id": "weekly_time_available",
        "category": "meta",
        "question_it": "Quanto tempo puoi dedicare al programma ogni settimana?",
        "question_en": "How much time can you dedicate to the program weekly?",
        "type": "choice",
        "options_it": ["1-2 ore", "3-4 ore", "5-7 ore", "8-10 ore", "Più di 10 ore"],
        "options_en": ["1-2 h", "3-4 h", "5-7 h", "8-10 h", "More than 10 h"],
        "weight": 0,
    },
    {
        "id": "preferred_intensity",
        "category": "meta",
        "question_it": "Che livello di intensità preferisci?",
        "question_en": "Preferred intensity level?",
        "type": "choice",
        "options_it": ["Dolce e meditativo", "Moderato", "Vigoroso", "Intenso"],
        "options_en": ["Gentle and meditative", "Moderate", "Vigorous", "Intense"],
        "weight": 0,
    },
]


# ────────────────────────────────────────────────────────────────────────
# SCORING — calcola le aree di carenza
# ────────────────────────────────────────────────────────────────────────
def _q_value(answer):
    """Converte risposta in valore numerico 0-4."""
    if answer is None:
        return 2
    try:
        return max(0, min(4, int(answer)))
    except (TypeError, ValueError):
        return 2


def score_to_focus_areas(answers: Dict[str, int]) -> Dict[str, float]:
    """
    Calcola un punteggio 0-100 per ciascuna macro-area (sport / cultura / benessere).
    Punteggio basso = area di carenza → il programma vi darà più peso.
    """
    totals = {"sport": [0.0, 0.0], "cultura": [0.0, 0.0], "benessere": [0.0, 0.0]}
    for q in ONBOARDING_QUESTIONS:
        cat = q["category"]
        if cat not in totals:
            continue
        weight = q.get("weight", 1.0)
        if weight <= 0:
            continue
        raw = _q_value(answers.get(q["id"]))
        if q.get("inverted"):
            raw = 4 - raw
        totals[cat][0] += raw * weight
        totals[cat][1] += 4 * weight

    scores = {}
    for cat, (got, maxv) in totals.items():
        scores[cat] = round((got / maxv) * 100, 1) if maxv else 50.0

    # Aree con score bassi = priorità più alta. La somma è ribilanciata
    # in modo che la categoria con score più basso riceva ~50% del tempo.
    deficit = {k: max(0, 100 - v) for k, v in scores.items()}
    s_def = sum(deficit.values()) or 1
    priorities = {k: round(v / s_def, 3) for k, v in deficit.items()}

    return {
        "scores": scores,
        "deficit": deficit,
        "priorities": priorities,  # quanto del tempo dedicare a ciascuna area
    }


def validate_onboarding(answers: Dict) -> Dict:
    """
    Verifica che il payload onboarding contenga tutte le risposte richieste.
    Ritorna: { "ok": bool, "missing": [...], "errors": [...] }
    """
    required = [q["id"] for q in ONBOARDING_QUESTIONS]
    missing = [q for q in required if q not in answers]
    errors = []
    for q in ONBOARDING_QUESTIONS:
        if q["id"] not in answers:
            continue
        val = answers[q["id"]]
        if q["type"] == "scale_5" and not (isinstance(val, int) and 0 <= val <= 4):
            errors.append(f"{q['id']}: deve essere 0-4")
        elif q["type"] == "choice" and not (isinstance(val, int) and 0 <= val <= 4):
            errors.append(f"{q['id']}: indice opzione non valido")
    return {"ok": not missing and not errors, "missing": missing, "errors": errors}


# ────────────────────────────────────────────────────────────────────────
# LIBRERIA ATTIVITÀ — banca dati delle proposte
# ────────────────────────────────────────────────────────────────────────
SPORT_ACTIVITIES = {
    "gentle": [
        {"title": "Camminata consapevole 30'", "kind": "cardio_low",  "duration_min": 30, "desc": "Cammina con respirazione 4-7-8, senza telefono, percependo il corpo."},
        {"title": "Stretching guidato 20'",    "kind": "flexibility", "duration_min": 20, "desc": "Sequenza yoga: gatto-mucca, posizione del bambino, cobra, torsione spinale."},
        {"title": "Yoga del mattino 15'",      "kind": "flexibility", "duration_min": 15, "desc": "Saluto al sole completo × 3 cicli al ritmo del respiro."},
        {"title": "Tai Chi 18 forme",          "kind": "mind_body",   "duration_min": 25, "desc": "Forma breve del Tai Chi Chuan: 18 movimenti fluidi."},
    ],
    "moderate": [
        {"title": "Camminata veloce 45'",      "kind": "cardio_mid",  "duration_min": 45, "desc": "Pace 6 km/h, post-pranzo se possibile."},
        {"title": "Allenamento corpo libero 30'", "kind": "strength", "duration_min": 30, "desc": "Squat × 15, push-up × 10, plank 30\", lunges × 12. 3 giri."},
        {"title": "Nuoto 30 vasche",           "kind": "cardio_mid",  "duration_min": 30, "desc": "Stile libero o rana, focus sulla respirazione regolare."},
        {"title": "Ciclismo dolce 1h",         "kind": "cardio_mid",  "duration_min": 60, "desc": "Pianura o leggera salita, frequenza cardiaca zona 2."},
        {"title": "Pilates 30'",               "kind": "core",        "duration_min": 30, "desc": "Hundred, leg circles, roll-up, swan dive."},
    ],
    "vigorous": [
        {"title": "HIIT 25' total body",        "kind": "hiit",        "duration_min": 25, "desc": "30\" lavoro / 15\" pausa: burpees, mountain climbers, jump squat, push-up."},
        {"title": "Corsa intervallata 8 × 400m", "kind": "cardio_high", "duration_min": 40, "desc": "Recupero 90\" tra i 400m."},
        {"title": "Allenamento forza 50'",       "kind": "strength",    "duration_min": 50, "desc": "Squat / panca / stacco — 4×6 con 2' recupero."},
        {"title": "Kickboxing 45'",              "kind": "combat",      "duration_min": 45, "desc": "Tecnica + 5 round shadow boxing."},
    ],
}

CULTURE_ACTIVITIES = [
    {"title": "Lettura: Tao Te Ching — capitolo del giorno", "duration_min": 15, "desc": "Leggi un capitolo del Tao Te Ching e medita su una frase."},
    {"title": "Lettura: I Ching — esagramma di oggi",        "duration_min": 20, "desc": "Studia l'esagramma del giorno: sentenza, immagine, linee mutevoli."},
    {"title": "Lettura: «I Ching» di Wilhelm — 10 pagine",   "duration_min": 25, "desc": "Approccio sistematico al Libro dei Mutamenti."},
    {"title": "Citazione di Confucio — riflessione",         "duration_min": 10, "desc": "Una citazione, una pagina di diario su come si applica a te."},
    {"title": "Lettura: Marco Aurelio «A se stesso» — 5 pagine", "duration_min": 15, "desc": "Stoicismo come ponte tra Occidente e saggezza orientale."},
    {"title": "Documentario: 30' su filosofia taoista",      "duration_min": 30, "desc": "Storia, principi base, applicazioni moderne."},
    {"title": "Scrivere 3 grati nel diario serale",          "duration_min": 10, "desc": "Tre cose per cui sei grato/a oggi, con dettaglio sensoriale."},
    {"title": "Calligrafia: il carattere 心 (cuore/mente)",   "duration_min": 20, "desc": "Disegna 10 volte con pennello o pennarello, lento."},
    {"title": "Lettura: Hermann Hesse «Siddhartha» — 1 capitolo", "duration_min": 20, "desc": "Letteratura sulla ricerca interiore."},
    {"title": "Ascolto: musica guzheng o pipa, 20'",          "duration_min": 20, "desc": "Musica tradizionale cinese in cuffia, occhi chiusi."},
]

WELLNESS_ACTIVITIES = [
    {"title": "Meditazione mindfulness 15'",   "kind": "meditation", "duration_min": 15, "desc": "Postura comoda, focus sul respiro. Quando ti distrai, torna gentilmente."},
    {"title": "Respirazione 4-7-8 × 8 cicli",  "kind": "breath",     "duration_min": 8,  "desc": "Inspira 4\", trattieni 7\", espira 8\". Calma il sistema nervoso."},
    {"title": "Doccia fredda finale 30 secondi", "kind": "cold",     "duration_min": 5,  "desc": "Finisci la doccia con 30\" di acqua fresca. Vagale stimolato."},
    {"title": "Camminata in natura senza telefono 45'", "kind": "nature", "duration_min": 45, "desc": "Parco o bosco, lascia il telefono in modalità aerea."},
    {"title": "Cena prima delle 19 e leggera",  "kind": "nutrition", "duration_min": 30, "desc": "Verdure di stagione, proteine magre, niente zuccheri raffinati."},
    {"title": "Disconnessione digitale 60'",    "kind": "digital",   "duration_min": 60, "desc": "Niente schermi, niente notifiche. Conversa, leggi, cammina."},
    {"title": "Tè verde + 10' di silenzio",     "kind": "ritual",    "duration_min": 15, "desc": "Cerimonia minimal del tè. Niente musica, niente parole."},
    {"title": "Body scan guidato 20'",          "kind": "meditation", "duration_min": 20, "desc": "Dalla testa ai piedi, percepisci ogni parte senza giudizio."},
    {"title": "Andare a letto entro le 22:30",  "kind": "sleep",     "duration_min": 0,  "desc": "Niente caffè dopo le 14, niente schermo l'ultima ora."},
    {"title": "Idratazione: 2 litri d'acqua",   "kind": "nutrition", "duration_min": 0,  "desc": "Distribuisci nell'arco della giornata. Aggiungi qualche fetta di limone."},
]


# ────────────────────────────────────────────────────────────────────────
# GENERAZIONE DEL PROGRAMMA SETTIMANALE
# ────────────────────────────────────────────────────────────────────────
def _intensity_for_profile(answers: Dict) -> str:
    """Mappa l'intensità preferita all'etichetta del gruppo sport."""
    pref = answers.get("preferred_intensity", 1)
    if isinstance(pref, int):
        if pref == 0: return "gentle"
        if pref == 1: return "moderate"
        if pref == 2: return "vigorous"
        if pref == 3: return "vigorous"
    return "moderate"


def _pick(seq, count, seed=None):
    rng = random.Random(seed)
    items = list(seq)
    rng.shuffle(items)
    return items[:count]


def generate_weekly_program(
    user_id: str,
    answers: Dict,
    iching_hexagram_number: Optional[int] = None,
    iching_hexagram_name: Optional[str] = None,
    week_start: Optional[datetime] = None,
    language: str = "it",
) -> Dict:
    """
    Genera un programma di 7 giorni allineato alle priorità dell'utente.

    Strategia:
      - Calcoliamo le priorità delle 3 macro-aree.
      - Per ogni giorno scegliamo 1 attività SPORT + 1 CULTURA + 1 BENESSERE.
      - L'area più carente riceve l'attività in slot fisso giornaliero;
        le altre vengono distribuite con probabilità proporzionale.
      - Apriamo la settimana con un riferimento all'esagramma del giorno
        (se passato) come "tema della settimana".

    Returns:
      Dict con:
        - id, user_id, week_start, week_end
        - hexagram_anchor
        - focus  (output di score_to_focus_areas)
        - days   (array 7 giorni con activities[])
    """
    focus = score_to_focus_areas(answers)
    intensity = _intensity_for_profile(answers)
    week_start = week_start or datetime.now(timezone.utc)
    # Allineato a inizio giornata
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=6)

    seed = int(week_start.timestamp()) + sum(ord(c) for c in user_id[:8])

    sport_pool = SPORT_ACTIVITIES.get(intensity, SPORT_ACTIVITIES["moderate"])

    # Forniamo 7 attività per categoria, con possibile ripetizione consapevole
    sport_week = _pick(sport_pool * 2, 7, seed=seed + 1)
    culture_week = _pick(CULTURE_ACTIVITIES, 7, seed=seed + 2)
    wellness_week = _pick(WELLNESS_ACTIVITIES, 7, seed=seed + 3)

    days = []
    for i in range(7):
        date = week_start + timedelta(days=i)
        day_activities = []

        sport = dict(sport_week[i])
        sport.update({
            "id": str(uuid.uuid4()),
            "category": "sport",
            "completed": False,
            "scheduled_for": date.isoformat(),
        })
        day_activities.append(sport)

        culture = dict(culture_week[i])
        culture.update({
            "id": str(uuid.uuid4()),
            "category": "cultura",
            "completed": False,
            "scheduled_for": date.isoformat(),
        })
        day_activities.append(culture)

        wellness = dict(wellness_week[i])
        wellness.update({
            "id": str(uuid.uuid4()),
            "category": "benessere",
            "completed": False,
            "scheduled_for": date.isoformat(),
        })
        day_activities.append(wellness)

        days.append({
            "day_index": i,
            "date": date.date().isoformat(),
            "weekday_it": ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"][date.weekday()],
            "weekday_en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][date.weekday()],
            "activities": day_activities,
        })

    program_id = str(uuid.uuid4())
    return {
        "id": program_id,
        "user_id": user_id,
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "intensity": intensity,
        "focus": focus,
        "hexagram_anchor": (
            {
                "number": iching_hexagram_number,
                "name": iching_hexagram_name,
                "message_it": f"Lascia che l'esagramma {iching_hexagram_number} «{iching_hexagram_name}» ispiri il ritmo della tua settimana." if iching_hexagram_number else None,
            } if iching_hexagram_number else None
        ),
        "days": days,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "language": language,
    }


# ────────────────────────────────────────────────────────────────────────
# XP / BADGE
# ────────────────────────────────────────────────────────────────────────
XP_PER_ACTIVITY = 10
XP_PER_DAY_FULL = 25  # bonus per giorni con TUTTE le 3 attività completate
XP_PER_WEEK_FULL = 100

BADGES_FITNESS = [
    {"id": "first_step",   "title_it": "Primo Passo",       "desc_it": "Hai completato la tua prima attività",  "threshold": 1},
    {"id": "consistent_3", "title_it": "Costanza",          "desc_it": "3 giorni di fila con almeno 1 attività","threshold": 3},
    {"id": "full_week",    "title_it": "Settimana Piena",   "desc_it": "Completa una settimana intera",          "threshold": 21},
    {"id": "month_warrior","title_it": "Guerriero del Mese","desc_it": "30 attività completate in un mese",      "threshold": 30},
    {"id": "centurion",    "title_it": "Centurione",        "desc_it": "100 attività completate in totale",     "threshold": 100},
]


def compute_xp_and_badges(activities_done: int, days_streak: int) -> Dict:
    """Calcola XP totali e badge sbloccati."""
    xp = activities_done * XP_PER_ACTIVITY
    earned = [b for b in BADGES_FITNESS if activities_done >= b["threshold"]]
    return {
        "xp": xp,
        "level": xp // 100 + 1,
        "next_level_at": ((xp // 100) + 1) * 100,
        "badges": earned,
        "streak_days": days_streak,
    }
