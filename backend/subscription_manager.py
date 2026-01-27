# Subscription Manager - Gestione abbonamenti e limiti
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
import random

# Limiti per piano
PLAN_LIMITS = {
    "free": {
        "monthly_consultations": 3,
        "consultation_types": ["direct"],  # Solo stesa diretta
        "history_limit": 10,
        "can_continue_conversation": False,
        "can_synthesis": False,
        "can_export_pdf": False,
        "can_add_notes": False,
        "can_view_statistics": False,
        "can_meditative_mode": False,
    },
    "premium": {
        "monthly_consultations": -1,  # Illimitate
        "consultation_types": ["direct", "deep"],  # Entrambe
        "history_limit": -1,  # Illimitato
        "can_continue_conversation": True,
        "can_synthesis": True,
        "can_export_pdf": True,
        "can_add_notes": True,
        "can_view_statistics": True,
        "can_meditative_mode": True,
    }
}

# Prezzi
SUBSCRIPTION_PRICES = {
    "monthly": {
        "price": 9.99,
        "currency": "EUR",
        "stripe_price_id": "price_monthly_premium"
    },
    "yearly": {
        "price": 79.99,
        "currency": "EUR",
        "stripe_price_id": "price_yearly_premium",
        "savings": "33%"
    }
}


def get_user_plan(user: dict) -> str:
    """Determina il piano dell'utente"""
    if user.get("subscription_active"):
        sub_end = user.get("subscription_end")
        if sub_end:
            if isinstance(sub_end, str):
                sub_end = datetime.fromisoformat(sub_end.replace('Z', '+00:00'))
            # Ensure sub_end is timezone-aware
            if sub_end.tzinfo is None:
                sub_end = sub_end.replace(tzinfo=timezone.utc)
            if sub_end > datetime.now(timezone.utc):
                return "premium"
    return "free"


def get_plan_limits(plan: str) -> dict:
    """Ottiene i limiti per un piano"""
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


async def check_consultation_limit(db, user: dict) -> Dict:
    """
    Verifica se l'utente può fare una consultazione
    Returns: {"allowed": bool, "remaining": int, "limit": int, "message": str}
    """
    plan = get_user_plan(user)
    limits = get_plan_limits(plan)
    
    if limits["monthly_consultations"] == -1:
        return {
            "allowed": True,
            "remaining": -1,
            "limit": -1,
            "message": "Consultazioni illimitate"
        }
    
    # Conta consultazioni del mese corrente
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    count = await db.consultations.count_documents({
        "user_id": user["id"],
        "created_at": {"$gte": start_of_month}
    })
    
    remaining = limits["monthly_consultations"] - count
    
    if remaining <= 0:
        return {
            "allowed": False,
            "remaining": 0,
            "limit": limits["monthly_consultations"],
            "message": "Hai raggiunto il limite mensile di consultazioni. Passa a Premium per consultazioni illimitate!"
        }
    
    return {
        "allowed": True,
        "remaining": remaining,
        "limit": limits["monthly_consultations"],
        "message": f"{remaining} consultazioni rimanenti questo mese"
    }


def can_use_consultation_type(user: dict, consultation_type: str) -> bool:
    """Verifica se l'utente può usare un certo tipo di consultazione"""
    plan = get_user_plan(user)
    limits = get_plan_limits(plan)
    return consultation_type in limits["consultation_types"]


# ============== ESAGRAMMA DEL GIORNO ==============

def get_daily_hexagram_number(date: datetime = None) -> int:
    """
    Genera un esagramma del giorno basato sulla data.
    Lo stesso giorno = stesso esagramma per tutti.
    """
    if date is None:
        date = datetime.now(timezone.utc)
    
    # Usa la data come seed per generare lo stesso numero per tutti
    seed = int(date.strftime("%Y%m%d"))
    random.seed(seed)
    hexagram = random.randint(1, 64)
    random.seed()  # Reset seed
    return hexagram


def get_lunar_phase(date: datetime = None) -> Dict:
    """
    Calcola la fase lunare approssimativa.
    """
    if date is None:
        date = datetime.now(timezone.utc)
    
    # Ciclo lunare medio: 29.53 giorni
    # Data di riferimento: Luna nuova del 6 gennaio 2000
    reference = datetime(2000, 1, 6, tzinfo=timezone.utc)
    days_since = (date - reference).days
    lunar_cycle = 29.53
    
    phase_day = days_since % lunar_cycle
    phase_percentage = (phase_day / lunar_cycle) * 100
    
    # Determina la fase
    if phase_percentage < 3.7:
        phase = {"name_it": "Luna Nuova", "name_en": "New Moon", "emoji": "🌑", "energy": "new_beginnings"}
    elif phase_percentage < 25:
        phase = {"name_it": "Luna Crescente", "name_en": "Waxing Crescent", "emoji": "🌒", "energy": "growth"}
    elif phase_percentage < 28.7:
        phase = {"name_it": "Primo Quarto", "name_en": "First Quarter", "emoji": "🌓", "energy": "action"}
    elif phase_percentage < 50:
        phase = {"name_it": "Gibbosa Crescente", "name_en": "Waxing Gibbous", "emoji": "🌔", "energy": "refinement"}
    elif phase_percentage < 53.7:
        phase = {"name_it": "Luna Piena", "name_en": "Full Moon", "emoji": "🌕", "energy": "culmination"}
    elif phase_percentage < 75:
        phase = {"name_it": "Gibbosa Calante", "name_en": "Waning Gibbous", "emoji": "🌖", "energy": "gratitude"}
    elif phase_percentage < 78.7:
        phase = {"name_it": "Ultimo Quarto", "name_en": "Last Quarter", "emoji": "🌗", "energy": "release"}
    else:
        phase = {"name_it": "Luna Calante", "name_en": "Waning Crescent", "emoji": "🌘", "energy": "rest"}
    
    # Consigli per la consultazione I Ching
    energy_advice = {
        "new_beginnings": {
            "it": "Momento ideale per nuove domande e nuovi inizi. L'energia è favorevole per piantare semi.",
            "en": "Ideal time for new questions and new beginnings. Energy is favorable for planting seeds."
        },
        "growth": {
            "it": "Buon momento per domande sulla crescita e lo sviluppo di progetti.",
            "en": "Good time for questions about growth and project development."
        },
        "action": {
            "it": "Energia di azione. Chiedi indicazioni su come procedere concretamente.",
            "en": "Action energy. Ask for guidance on how to proceed concretely."
        },
        "refinement": {
            "it": "Momento di rifinitura. Chiedi come migliorare ciò che hai già iniziato.",
            "en": "Time for refinement. Ask how to improve what you've already started."
        },
        "culmination": {
            "it": "Luna Piena: massima chiarezza. Le risposte saranno particolarmente illuminate.",
            "en": "Full Moon: maximum clarity. Answers will be particularly illuminated."
        },
        "gratitude": {
            "it": "Momento di gratitudine. Rifletti su ciò che hai ricevuto dalle consultazioni passate.",
            "en": "Time for gratitude. Reflect on what you've received from past consultations."
        },
        "release": {
            "it": "Energia di rilascio. Chiedi cosa devi lasciar andare.",
            "en": "Release energy. Ask what you need to let go of."
        },
        "rest": {
            "it": "Momento di riposo e introspezione. Ideale per domande spirituali profonde.",
            "en": "Time for rest and introspection. Ideal for deep spiritual questions."
        }
    }
    
    phase["advice_it"] = energy_advice[phase["energy"]]["it"]
    phase["advice_en"] = energy_advice[phase["energy"]]["en"]
    phase["percentage"] = round(phase_percentage, 1)
    
    return phase


# ============== SISTEMA DI PROGRESSIONE ==============

USER_LEVELS = [
    {"level": 1, "title_it": "Cercatore", "title_en": "Seeker", "emoji": "🌱", "min_consultations": 0},
    {"level": 2, "title_it": "Studente", "title_en": "Student", "emoji": "🌿", "min_consultations": 10},
    {"level": 3, "title_it": "Praticante", "title_en": "Practitioner", "emoji": "🌳", "min_consultations": 25},
    {"level": 4, "title_it": "Iniziato", "title_en": "Initiate", "emoji": "🔮", "min_consultations": 50},
    {"level": 5, "title_it": "Saggio", "title_en": "Sage", "emoji": "🏔️", "min_consultations": 100},
    {"level": 6, "title_it": "Maestro", "title_en": "Master", "emoji": "🐉", "min_consultations": 200},
]

BADGES = [
    {"id": "first_consultation", "name_it": "Prima Consultazione", "name_en": "First Consultation", "emoji": "⭐", "description_it": "Hai completato la tua prima consultazione", "description_en": "You completed your first consultation"},
    {"id": "week_streak", "name_it": "Settimana Costante", "name_en": "Week Streak", "emoji": "🔥", "description_it": "7 giorni consecutivi di consultazioni", "description_en": "7 consecutive days of consultations"},
    {"id": "all_topics", "name_it": "Esploratore", "name_en": "Explorer", "emoji": "🧭", "description_it": "Hai consultato su tutti gli argomenti", "description_en": "You consulted on all topics"},
    {"id": "ten_hexagrams", "name_it": "Conoscitore", "name_en": "Knower", "emoji": "📚", "description_it": "Hai incontrato 10 esagrammi diversi", "description_en": "You encountered 10 different hexagrams"},
    {"id": "all_hexagrams", "name_it": "Completista", "name_en": "Completist", "emoji": "🏆", "description_it": "Hai incontrato tutti i 64 esagrammi", "description_en": "You encountered all 64 hexagrams"},
    {"id": "night_owl", "name_it": "Nottambulo", "name_en": "Night Owl", "emoji": "🦉", "description_it": "10 consultazioni dopo mezzanotte", "description_en": "10 consultations after midnight"},
    {"id": "early_bird", "name_it": "Mattiniero", "name_en": "Early Bird", "emoji": "🐦", "description_it": "10 consultazioni prima delle 7", "description_en": "10 consultations before 7am"},
    {"id": "deep_diver", "name_it": "Esploratore Profondo", "name_en": "Deep Diver", "emoji": "🤿", "description_it": "20 stese profonde completate", "description_en": "20 deep readings completed"},
    {"id": "full_moon", "name_it": "Figlio della Luna", "name_en": "Moon Child", "emoji": "🌕", "description_it": "Consultazione durante la luna piena", "description_en": "Consultation during full moon"},
]


def get_user_level(total_consultations: int) -> Dict:
    """Determina il livello dell'utente basato sulle consultazioni totali"""
    current_level = USER_LEVELS[0]
    next_level = USER_LEVELS[1] if len(USER_LEVELS) > 1 else None
    
    for i, level in enumerate(USER_LEVELS):
        if total_consultations >= level["min_consultations"]:
            current_level = level
            next_level = USER_LEVELS[i + 1] if i + 1 < len(USER_LEVELS) else None
    
    progress = 0
    consultations_needed = 0
    if next_level:
        range_size = next_level["min_consultations"] - current_level["min_consultations"]
        progress_in_range = total_consultations - current_level["min_consultations"]
        progress = min(100, int((progress_in_range / range_size) * 100))
        consultations_needed = next_level["min_consultations"] - total_consultations
    
    return {
        "current": current_level,
        "next": next_level,
        "progress": progress,
        "consultations_needed": consultations_needed,
        "total_consultations": total_consultations
    }


async def check_and_award_badges(db, user_id: str, consultation: dict = None) -> list:
    """Verifica e assegna badge all'utente"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return []
    
    current_badges = user.get("badges", [])
    new_badges = []
    
    # Conta consultazioni
    total = await db.consultations.count_documents({"user_id": user_id})
    
    # Badge: Prima Consultazione
    if "first_consultation" not in current_badges and total >= 1:
        new_badges.append("first_consultation")
    
    # Badge: 10 esagrammi diversi
    if "ten_hexagrams" not in current_badges:
        unique_hex = await db.consultations.distinct("hexagram_number", {"user_id": user_id})
        if len(unique_hex) >= 10:
            new_badges.append("ten_hexagrams")
    
    # Badge: Tutti i 64 esagrammi
    if "all_hexagrams" not in current_badges:
        unique_hex = await db.consultations.distinct("hexagram_number", {"user_id": user_id})
        if len(unique_hex) >= 64:
            new_badges.append("all_hexagrams")
    
    # Badge: Deep Diver (20 stese profonde)
    if "deep_diver" not in current_badges:
        deep_count = await db.consultations.count_documents({
            "user_id": user_id,
            "consultation_type": "deep"
        })
        if deep_count >= 20:
            new_badges.append("deep_diver")
    
    # Badge: Tutti gli argomenti
    if "all_topics" not in current_badges:
        topics = await db.consultations.distinct("topic", {"user_id": user_id})
        required_topics = {"amore", "lavoro", "fortuna", "soldi", "spirituale", "personale"}
        if required_topics.issubset(set(topics)):
            new_badges.append("all_topics")
    
    # Badge: Luna Piena
    if consultation and "full_moon" not in current_badges:
        phase = get_lunar_phase()
        if "Luna Piena" in phase["name_it"]:
            new_badges.append("full_moon")
    
    # Salva nuovi badge
    if new_badges:
        await db.users.update_one(
            {"id": user_id},
            {"$addToSet": {"badges": {"$each": new_badges}}}
        )
    
    # Restituisci i dettagli dei nuovi badge
    return [b for b in BADGES if b["id"] in new_badges]


# ============== PERCORSI TEMATICI ==============

GUIDED_PATHS = {
    "love": {
        "id": "love",
        "name_it": "Percorso dell'Amore",
        "name_en": "Path of Love",
        "emoji": "💕",
        "description_it": "Un viaggio in 7 tappe per esplorare le tue relazioni e il tuo cuore",
        "description_en": "A 7-step journey to explore your relationships and your heart",
        "steps": [
            {"day": 1, "question_it": "Qual è lo stato attuale del mio cuore?", "question_en": "What is the current state of my heart?", "focus": "self"},
            {"day": 2, "question_it": "Cosa mi impedisce di aprirmi all'amore?", "question_en": "What prevents me from opening to love?", "focus": "blocks"},
            {"day": 3, "question_it": "Quali sono le mie vere esigenze in una relazione?", "question_en": "What are my true needs in a relationship?", "focus": "needs"},
            {"day": 4, "question_it": "Come posso migliorare la comunicazione con chi amo?", "question_en": "How can I improve communication with those I love?", "focus": "communication"},
            {"day": 5, "question_it": "Quale lezione devo imparare dalle relazioni passate?", "question_en": "What lesson should I learn from past relationships?", "focus": "lessons"},
            {"day": 6, "question_it": "Come posso attrarre l'amore che merito?", "question_en": "How can I attract the love I deserve?", "focus": "attraction"},
            {"day": 7, "question_it": "Qual è il messaggio finale per il mio percorso affettivo?", "question_en": "What is the final message for my emotional journey?", "focus": "synthesis"},
        ]
    },
    "career": {
        "id": "career",
        "name_it": "Percorso della Carriera",
        "name_en": "Path of Career",
        "emoji": "💼",
        "description_it": "5 tappe per trovare la tua direzione professionale",
        "description_en": "5 steps to find your professional direction",
        "steps": [
            {"day": 1, "question_it": "Qual è la mia vera vocazione?", "question_en": "What is my true calling?", "focus": "vocation"},
            {"day": 2, "question_it": "Quali talenti devo sviluppare?", "question_en": "What talents should I develop?", "focus": "talents"},
            {"day": 3, "question_it": "Quali ostacoli devo superare nella carriera?", "question_en": "What obstacles must I overcome in my career?", "focus": "obstacles"},
            {"day": 4, "question_it": "Come posso portare più abbondanza attraverso il lavoro?", "question_en": "How can I bring more abundance through work?", "focus": "abundance"},
            {"day": 5, "question_it": "Qual è il prossimo passo concreto da fare?", "question_en": "What is the next concrete step to take?", "focus": "action"},
        ]
    },
    "spiritual": {
        "id": "spiritual",
        "name_it": "Percorso Spirituale",
        "name_en": "Spiritual Path",
        "emoji": "🧘",
        "description_it": "21 giorni di risveglio interiore con l'I Ching",
        "description_en": "21 days of inner awakening with the I Ching",
        "steps": [
            {"day": 1, "question_it": "Chi sono io veramente?", "question_en": "Who am I truly?"},
            {"day": 2, "question_it": "Cosa devo lasciar andare?", "question_en": "What must I let go of?"},
            {"day": 3, "question_it": "Qual è il mio dono da offrire al mondo?", "question_en": "What is my gift to offer the world?"},
            {"day": 7, "question_it": "Qual è il messaggio della prima settimana?", "question_en": "What is the message of the first week?"},
            {"day": 14, "question_it": "Come sto trasformando me stesso?", "question_en": "How am I transforming myself?"},
            {"day": 21, "question_it": "Qual è la saggezza che ho acquisito?", "question_en": "What wisdom have I gained?"},
        ]
    },
    "new_beginning": {
        "id": "new_beginning",
        "name_it": "Nuovo Inizio",
        "name_en": "New Beginning",
        "emoji": "🌅",
        "description_it": "Per chi affronta un grande cambiamento nella vita",
        "description_en": "For those facing a big change in life",
        "steps": [
            {"day": 1, "question_it": "Cosa devo sapere su questo nuovo inizio?", "question_en": "What should I know about this new beginning?"},
            {"day": 2, "question_it": "Cosa porto con me dal passato?", "question_en": "What do I bring with me from the past?"},
            {"day": 3, "question_it": "Cosa devo lasciare indietro?", "question_en": "What should I leave behind?"},
            {"day": 4, "question_it": "Quali sfide mi attendono?", "question_en": "What challenges await me?"},
            {"day": 5, "question_it": "Quali risorse ho a disposizione?", "question_en": "What resources do I have?"},
            {"day": 6, "question_it": "Qual è il primo passo da fare?", "question_en": "What is the first step to take?"},
            {"day": 7, "question_it": "Qual è la promessa di questo nuovo capitolo?", "question_en": "What is the promise of this new chapter?"},
        ]
    }
}
