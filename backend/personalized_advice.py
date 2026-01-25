# Sistema di Consigli Personalizzati Premium
# Basato sui percorsi utente e calendario zodiacale cinese

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
import random

# ============== CALENDARIO ZODIACALE CINESE ==============

CHINESE_ZODIAC = {
    0: {"animal": "Scimmia", "animal_en": "Monkey", "emoji": "🐒", "element": "Metallo", "element_en": "Metal"},
    1: {"animal": "Gallo", "animal_en": "Rooster", "emoji": "🐓", "element": "Metallo", "element_en": "Metal"},
    2: {"animal": "Cane", "animal_en": "Dog", "emoji": "🐕", "element": "Terra", "element_en": "Earth"},
    3: {"animal": "Maiale", "animal_en": "Pig", "emoji": "🐷", "element": "Acqua", "element_en": "Water"},
    4: {"animal": "Topo", "animal_en": "Rat", "emoji": "🐀", "element": "Acqua", "element_en": "Water"},
    5: {"animal": "Bue", "animal_en": "Ox", "emoji": "🐂", "element": "Terra", "element_en": "Earth"},
    6: {"animal": "Tigre", "animal_en": "Tiger", "emoji": "🐅", "element": "Legno", "element_en": "Wood"},
    7: {"animal": "Coniglio", "animal_en": "Rabbit", "emoji": "🐇", "element": "Legno", "element_en": "Wood"},
    8: {"animal": "Drago", "animal_en": "Dragon", "emoji": "🐉", "element": "Terra", "element_en": "Earth"},
    9: {"animal": "Serpente", "animal_en": "Snake", "emoji": "🐍", "element": "Fuoco", "element_en": "Fire"},
    10: {"animal": "Cavallo", "animal_en": "Horse", "emoji": "🐴", "element": "Fuoco", "element_en": "Fire"},
    11: {"animal": "Capra", "animal_en": "Goat", "emoji": "🐐", "element": "Terra", "element_en": "Earth"},
}

# Elementi cinesi e loro interazioni
CHINESE_ELEMENTS = {
    "Legno": {"generates": "Fuoco", "controls": "Terra", "color": "#228B22", "season": "Primavera"},
    "Fuoco": {"generates": "Terra", "controls": "Metallo", "color": "#FF4500", "season": "Estate"},
    "Terra": {"generates": "Metallo", "controls": "Acqua", "color": "#8B4513", "season": "Fine Estate"},
    "Metallo": {"generates": "Acqua", "controls": "Legno", "color": "#C0C0C0", "season": "Autunno"},
    "Acqua": {"generates": "Legno", "controls": "Fuoco", "color": "#1E90FF", "season": "Inverno"},
}

def get_chinese_year_animal(year: int = None) -> Dict:
    """Calcola l'animale zodiacale cinese per un anno"""
    if year is None:
        year = datetime.now().year
    
    # Il ciclo inizia dal 1900 (anno del Topo)
    index = (year - 1900) % 12
    return CHINESE_ZODIAC.get(index, CHINESE_ZODIAC[0])

def get_chinese_day_energy(date: datetime = None) -> Dict:
    """Calcola l'energia del giorno secondo il calendario cinese"""
    if date is None:
        date = datetime.now(timezone.utc)
    
    # Calcola il giorno del ciclo di 60 giorni (Jiazi cycle)
    reference = datetime(2000, 1, 1, tzinfo=timezone.utc)
    days_since = (date - reference).days
    cycle_day = days_since % 60
    
    # 10 steli celesti (Heavenly Stems)
    stems = ["Jia 甲", "Yi 乙", "Bing 丙", "Ding 丁", "Wu 戊", 
             "Ji 己", "Geng 庚", "Xin 辛", "Ren 壬", "Gui 癸"]
    stem_elements = ["Legno", "Legno", "Fuoco", "Fuoco", "Terra", 
                     "Terra", "Metallo", "Metallo", "Acqua", "Acqua"]
    
    # 12 rami terrestri (Earthly Branches)
    branches = ["Zi 子", "Chou 丑", "Yin 寅", "Mao 卯", "Chen 辰", "Si 巳",
                "Wu 午", "Wei 未", "Shen 申", "You 酉", "Xu 戌", "Hai 亥"]
    
    stem_index = cycle_day % 10
    branch_index = cycle_day % 12
    
    current_stem = stems[stem_index]
    current_branch = branches[branch_index]
    current_element = stem_elements[stem_index]
    current_animal = list(CHINESE_ZODIAC.values())[branch_index]
    
    # Calcola energia del giorno
    energy_types = {
        "Legno": {"quality_it": "Crescita e Sviluppo", "quality_en": "Growth and Development", "action_it": "pianifica e inizia nuovi progetti", "action_en": "plan and start new projects"},
        "Fuoco": {"quality_it": "Passione e Trasformazione", "quality_en": "Passion and Transformation", "action_it": "agisci con coraggio e determinazione", "action_en": "act with courage and determination"},
        "Terra": {"quality_it": "Stabilità e Nutrimento", "quality_en": "Stability and Nourishment", "action_it": "consolida e cura le relazioni", "action_en": "consolidate and nurture relationships"},
        "Metallo": {"quality_it": "Chiarezza e Precisione", "quality_en": "Clarity and Precision", "action_it": "fai pulizia e organizza", "action_en": "clean up and organize"},
        "Acqua": {"quality_it": "Intuizione e Fluidità", "quality_en": "Intuition and Fluidity", "action_it": "medita e ascolta la tua voce interiore", "action_en": "meditate and listen to your inner voice"},
    }
    
    element_info = CHINESE_ELEMENTS.get(current_element, {})
    energy_info = energy_types.get(current_element, {})
    
    return {
        "stem": current_stem,
        "branch": current_branch,
        "element": current_element,
        "element_en": {"Legno": "Wood", "Fuoco": "Fire", "Terra": "Earth", "Metallo": "Metal", "Acqua": "Water"}.get(current_element, current_element),
        "animal": current_animal,
        "quality_it": energy_info.get("quality_it", ""),
        "quality_en": energy_info.get("quality_en", ""),
        "action_it": energy_info.get("action_it", ""),
        "action_en": energy_info.get("action_en", ""),
        "color": element_info.get("color", "#808080"),
        "cycle_day": cycle_day + 1,
    }


# ============== GENERAZIONE CONSIGLI PERSONALIZZATI ==============

ADVICE_TEMPLATES = {
    "daily": {
        "love": {
            "it": [
                "Oggi l'energia di {element} favorisce l'apertura del cuore. {action}. Nel percorso dell'amore, ricorda: l'I Ching insegna che la vera connessione nasce dalla sincerità.",
                "Con l'animale guida {animal} {animal_emoji}, oggi è un giorno per {action}. Le tue consultazioni sul percorso amore suggeriscono di coltivare la pazienza nelle relazioni.",
                "L'elemento {element} oggi porta {quality}. Perfetto per riflettere sul tuo percorso affettivo. Domanda per oggi: 'Come posso essere più autentico nelle mie relazioni?'",
            ],
            "en": [
                "Today the energy of {element} favors heart opening. {action}. In the path of love, remember: the I Ching teaches that true connection comes from sincerity.",
                "With the guiding animal {animal} {animal_emoji}, today is a day to {action}. Your love path consultations suggest cultivating patience in relationships.",
                "The {element} element today brings {quality}. Perfect for reflecting on your emotional journey. Question for today: 'How can I be more authentic in my relationships?'",
            ]
        },
        "career": {
            "it": [
                "L'energia di {element} oggi sostiene la tua carriera. {action}. Il tuo percorso professionale richiede oggi focus sulla tua vera vocazione.",
                "Con {animal} {animal_emoji} come guida oggi, è momento di {action}. Le tue consultazioni di carriera indicano che i talenti nascosti stanno emergendo.",
                "Oggi {element} porta {quality}. Ideale per fare il prossimo passo nel tuo percorso professionale. Riflessione: 'Quale piccola azione può portarmi più vicino al mio obiettivo?'",
            ],
            "en": [
                "The energy of {element} today supports your career. {action}. Your professional path requires focus on your true calling today.",
                "With {animal} {animal_emoji} as your guide today, it's time to {action}. Your career consultations indicate hidden talents are emerging.",
                "Today {element} brings {quality}. Ideal for taking the next step in your professional journey. Reflection: 'What small action can bring me closer to my goal?'",
            ]
        },
        "spiritual": {
            "it": [
                "Nel ciclo Jiazi, oggi è il giorno {cycle_day}. L'energia di {element} invita alla meditazione. {action}. Il tuo percorso spirituale si approfondisce.",
                "Con la saggezza di {animal} {animal_emoji}, oggi medita su: 'Chi sono io al di là delle apparenze?' L'elemento {element} sostiene l'introspezione.",
                "L'energia {element} di oggi porta {quality}. Nel tuo percorso di risveglio, ricorda che ogni momento è un'opportunità di trasformazione.",
            ],
            "en": [
                "In the Jiazi cycle, today is day {cycle_day}. The energy of {element} invites meditation. {action}. Your spiritual path deepens.",
                "With the wisdom of {animal} {animal_emoji}, today meditate on: 'Who am I beyond appearances?' The {element} element supports introspection.",
                "Today's {element} energy brings {quality}. In your awakening journey, remember that every moment is an opportunity for transformation.",
            ]
        },
        "new_beginning": {
            "it": [
                "Per il tuo nuovo inizio, l'energia di {element} oggi suggerisce di {action}. Ogni grande cambiamento inizia con un piccolo passo consapevole.",
                "Con {animal} {animal_emoji} come totem del giorno, abbraccia la {quality}. Il tuo nuovo capitolo si scrive un giorno alla volta.",
                "L'elemento {element} oggi porta {quality}. Perfetto per il tuo nuovo inizio. Domanda: 'Cosa voglio creare in questa nuova fase?'",
            ],
            "en": [
                "For your new beginning, the energy of {element} today suggests to {action}. Every great change starts with a small conscious step.",
                "With {animal} {animal_emoji} as today's totem, embrace {quality}. Your new chapter is written one day at a time.",
                "The {element} element today brings {quality}. Perfect for your new beginning. Question: 'What do I want to create in this new phase?'",
            ]
        },
        "general": {
            "it": [
                "Oggi l'energia di {element} ti guida. {action}. L'I Ching insegna: 'Il saggio si adatta al cambiamento come l'acqua alla forma del suo contenitore.'",
                "Con {animal} {animal_emoji} come guida oggi, la {quality} è il tuo focus. Momento di riflessione: cosa ti sta insegnando il tuo percorso?",
                "Nel ciclo Jiazi, giorno {cycle_day}. L'elemento {element} suggerisce di {action}. Ascolta la saggezza del momento presente.",
            ],
            "en": [
                "Today the energy of {element} guides you. {action}. The I Ching teaches: 'The wise adapts to change like water to the shape of its container.'",
                "With {animal} {animal_emoji} as today's guide, {quality} is your focus. Reflection moment: what is your journey teaching you?",
                "In the Jiazi cycle, day {cycle_day}. The {element} element suggests to {action}. Listen to the wisdom of the present moment.",
            ]
        }
    },
    "weekly": {
        "love": {
            "it": "Questa settimana nel percorso dell'amore, con l'energia dominante di {element}, concentrati su {quality}. Le tue consultazioni suggeriscono un tema ricorrente: la comunicazione autentica. Obiettivo settimanale: dedica 10 minuti al giorno alla riflessione sulle tue relazioni.",
            "en": "This week in the path of love, with the dominant energy of {element}, focus on {quality}. Your consultations suggest a recurring theme: authentic communication. Weekly goal: dedicate 10 minutes daily to reflecting on your relationships.",
        },
        "career": {
            "it": "Questa settimana per la tua carriera, l'elemento {element} sostiene {quality}. I tuoi percorsi indicano che è tempo di agire sui talenti identificati. Obiettivo: completa un passo concreto verso la tua vocazione.",
            "en": "This week for your career, the {element} element supports {quality}. Your paths indicate it's time to act on identified talents. Goal: complete one concrete step toward your calling.",
        },
        "spiritual": {
            "it": "Nel percorso spirituale di questa settimana, l'energia {element} invita alla {quality}. Pratica consigliata: medita ogni mattina sull'esagramma del giorno. Le tue consultazioni mostrano un'apertura crescente.",
            "en": "In this week's spiritual path, the {element} energy invites {quality}. Recommended practice: meditate each morning on the daily hexagram. Your consultations show growing openness.",
        },
        "general": {
            "it": "Settimana guidata dall'energia {element}: {quality}. Basandomi sulle tue consultazioni recenti, il tema emergente è la trasformazione. Suggerimento: annota ogni sera una piccola vittoria o insight.",
            "en": "Week guided by {element} energy: {quality}. Based on your recent consultations, the emerging theme is transformation. Suggestion: note down each evening a small victory or insight.",
        }
    },
    "monthly": {
        "love": {
            "it": "Questo mese nel percorso dell'amore, l'animale zodiacale {animal} {animal_emoji} porta energia di {quality}. Guardando le tue {total_consultations} consultazioni sul tema, emerge un pattern: stai imparando a bilanciare dare e ricevere. Focus del mese: pratica la vulnerabilità consapevole. L'I Ching suggerisce di coltivare la pazienza come il contadino coltiva il campo.",
            "en": "This month in the path of love, the zodiac animal {animal} {animal_emoji} brings energy of {quality}. Looking at your {total_consultations} consultations on this theme, a pattern emerges: you're learning to balance giving and receiving. Monthly focus: practice conscious vulnerability. The I Ching suggests cultivating patience as the farmer cultivates the field.",
        },
        "career": {
            "it": "Questo mese per la carriera, con {animal} {animal_emoji} come guida annuale, l'elemento {element} sostiene {quality}. Le tue consultazioni professionali rivelano una crescita nella consapevolezza dei tuoi talenti. Obiettivo mensile: dedica tempo a sviluppare una competenza specifica. Ricorda: il successo è la somma di piccoli sforzi ripetuti.",
            "en": "This month for career, with {animal} {animal_emoji} as your annual guide, the {element} element supports {quality}. Your professional consultations reveal growing awareness of your talents. Monthly goal: dedicate time to developing a specific skill. Remember: success is the sum of small repeated efforts.",
        },
        "spiritual": {
            "it": "Questo mese nel percorso spirituale, l'energia di {animal} {animal_emoji} combinata con {element} favorisce {quality}. Con {total_consultations} consultazioni spirituali completate, il tuo viaggio interiore si approfondisce. Pratica mensile: scegli un esagramma da studiare approfonditamente. La saggezza dell'I Ching si rivela gradualmente a chi cerca con pazienza.",
            "en": "This month in the spiritual path, the energy of {animal} {animal_emoji} combined with {element} favors {quality}. With {total_consultations} spiritual consultations completed, your inner journey deepens. Monthly practice: choose one hexagram to study in depth. The I Ching's wisdom reveals itself gradually to those who seek with patience.",
        },
        "general": {
            "it": "Panoramica mensile: Anno del {animal} {animal_emoji}, energia {element}. Le tue {total_consultations} consultazioni di questo mese mostrano un tema dominante. L'I Ching parla di cicli: questo è un momento di {quality}. Piano mensile: 1) Rileggi le interpretazioni ricevute 2) Identifica i pattern 3) Applica un insegnamento concreto ogni settimana.",
            "en": "Monthly overview: Year of the {animal} {animal_emoji}, {element} energy. Your {total_consultations} consultations this month show a dominant theme. The I Ching speaks of cycles: this is a time of {quality}. Monthly plan: 1) Re-read received interpretations 2) Identify patterns 3) Apply one concrete teaching each week.",
        }
    }
}


async def generate_personalized_advice(
    db,
    user_id: str,
    frequency: str = "daily",  # daily, weekly, monthly
    language: str = "it"
) -> Dict:
    """
    Genera consiglio personalizzato basato su:
    - Percorsi attivi dell'utente
    - Consultazioni passate
    - Calendario zodiacale cinese
    """
    
    # Ottieni info calendario cinese
    today = datetime.now(timezone.utc)
    day_energy = get_chinese_day_energy(today)
    year_animal = get_chinese_year_animal(today.year)
    
    # Ottieni percorsi attivi dell'utente
    active_paths = await db.user_paths.find({"user_id": user_id}).to_list(100)
    
    # Determina il tema principale basato sui percorsi
    primary_theme = "general"
    if active_paths:
        # Usa il percorso più recente o con più progressi
        most_active_path = max(active_paths, key=lambda p: len(p.get("completed_steps", [])))
        primary_theme = most_active_path.get("path_id", "general")
    
    # Conta consultazioni per statistiche
    total_consultations = await db.consultations.count_documents({"user_id": user_id})
    
    # Conta consultazioni per tema specifico
    topic_mapping = {
        "love": ["amore", "love"],
        "career": ["lavoro", "carriera", "career", "work"],
        "spiritual": ["spirituale", "spiritual", "personale"],
    }
    
    theme_consultations = 0
    if primary_theme in topic_mapping:
        theme_consultations = await db.consultations.count_documents({
            "user_id": user_id,
            "topic": {"$in": topic_mapping[primary_theme]}
        })
    
    # Seleziona template
    templates = ADVICE_TEMPLATES.get(frequency, ADVICE_TEMPLATES["daily"])
    theme_templates = templates.get(primary_theme, templates.get("general"))
    
    if isinstance(theme_templates, dict):
        lang_templates = theme_templates.get(language, theme_templates.get("it", []))
    else:
        lang_templates = theme_templates
    
    # Se è una lista, scegli random; altrimenti usa il template
    if isinstance(lang_templates, list):
        # Usa la data come seed per consistenza durante il giorno
        seed = int(today.strftime("%Y%m%d"))
        random.seed(seed + hash(user_id))
        template = random.choice(lang_templates)
        random.seed()
    else:
        template = lang_templates
    
    # Prepara variabili per il template
    variables = {
        "element": day_energy["element"] if language == "it" else day_energy["element_en"],
        "quality": day_energy["quality_it"] if language == "it" else day_energy["quality_en"],
        "action": day_energy["action_it"] if language == "it" else day_energy["action_en"],
        "animal": day_energy["animal"]["animal"] if language == "it" else day_energy["animal"]["animal_en"],
        "animal_emoji": day_energy["animal"]["emoji"],
        "cycle_day": day_energy["cycle_day"],
        "year_animal": year_animal["animal"] if language == "it" else year_animal["animal_en"],
        "year_emoji": year_animal["emoji"],
        "total_consultations": total_consultations,
        "theme_consultations": theme_consultations,
    }
    
    # Genera il messaggio
    try:
        advice_text = template.format(**variables)
    except KeyError as e:
        advice_text = template  # Usa il template originale se mancano variabili
    
    # Costruisci risposta
    return {
        "id": str(hash(f"{user_id}{today.strftime('%Y%m%d')}{frequency}")),
        "frequency": frequency,
        "theme": primary_theme,
        "advice_text": advice_text,
        "chinese_calendar": {
            "day_energy": day_energy,
            "year_animal": year_animal,
        },
        "user_stats": {
            "total_consultations": total_consultations,
            "theme_consultations": theme_consultations,
            "active_paths": len(active_paths),
        },
        "generated_at": today.isoformat(),
        "valid_until": (today + timedelta(days=1 if frequency == "daily" else 7 if frequency == "weekly" else 30)).isoformat(),
    }


# ============== NOTIFICATION PREFERENCES ==============

DEFAULT_NOTIFICATION_PREFERENCES = {
    "enabled": True,
    "frequency": "daily",  # daily, weekly, monthly
    "preferred_time": "08:00",  # Ora locale preferita
    "push_enabled": False,  # Richiede setup Firebase
    "email_enabled": False,  # Richiede setup email
    "in_app_enabled": True,  # Sempre attivo
}


async def get_user_notification_preferences(db, user_id: str) -> Dict:
    """Ottiene le preferenze di notifica dell'utente"""
    prefs = await db.notification_preferences.find_one({"user_id": user_id})
    if not prefs:
        # Crea preferenze di default
        default_prefs = {
            "user_id": user_id,
            **DEFAULT_NOTIFICATION_PREFERENCES,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.notification_preferences.insert_one(default_prefs)
        return default_prefs
    return prefs


async def update_user_notification_preferences(db, user_id: str, updates: Dict) -> Dict:
    """Aggiorna le preferenze di notifica dell'utente"""
    allowed_fields = ["enabled", "frequency", "preferred_time", "push_enabled", "email_enabled", "in_app_enabled", "fcm_token"]
    
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}
    filtered_updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.notification_preferences.update_one(
        {"user_id": user_id},
        {"$set": filtered_updates},
        upsert=True
    )
    
    return await get_user_notification_preferences(db, user_id)
