# Sistema Profilo Astrologico Utente
# Calcola segno zodiacale cinese, occidentale, elemento e caratteristiche

from datetime import datetime, date
from typing import Dict, Optional, List

# ============== ZODIACO CINESE ==============

CHINESE_ZODIAC_ANIMALS = {
    0: {
        "animal_it": "Scimmia", "animal_en": "Monkey", "emoji": "🐒",
        "traits_it": "Intelligente, curioso, versatile, socievole",
        "traits_en": "Intelligent, curious, versatile, sociable",
        "compatible": ["Drago", "Topo"],
        "incompatible": ["Tigre", "Maiale"]
    },
    1: {
        "animal_it": "Gallo", "animal_en": "Rooster", "emoji": "🐓",
        "traits_it": "Onesto, puntuale, leale, coraggioso",
        "traits_en": "Honest, punctual, loyal, courageous",
        "compatible": ["Bue", "Serpente"],
        "incompatible": ["Coniglio", "Cane"]
    },
    2: {
        "animal_it": "Cane", "animal_en": "Dog", "emoji": "🐕",
        "traits_it": "Fedele, onesto, prudente, affidabile",
        "traits_en": "Faithful, honest, prudent, reliable",
        "compatible": ["Coniglio", "Tigre"],
        "incompatible": ["Drago", "Gallo"]
    },
    3: {
        "animal_it": "Maiale", "animal_en": "Pig", "emoji": "🐷",
        "traits_it": "Generoso, compassionevole, diligente, paziente",
        "traits_en": "Generous, compassionate, diligent, patient",
        "compatible": ["Capra", "Coniglio"],
        "incompatible": ["Serpente", "Scimmia"]
    },
    4: {
        "animal_it": "Topo", "animal_en": "Rat", "emoji": "🐀",
        "traits_it": "Astuto, intraprendente, adattabile, affascinante",
        "traits_en": "Clever, resourceful, adaptable, charming",
        "compatible": ["Drago", "Scimmia"],
        "incompatible": ["Cavallo", "Capra"]
    },
    5: {
        "animal_it": "Bue", "animal_en": "Ox", "emoji": "🐂",
        "traits_it": "Determinato, affidabile, metodico, paziente",
        "traits_en": "Determined, reliable, methodical, patient",
        "compatible": ["Serpente", "Gallo"],
        "incompatible": ["Capra", "Cavallo"]
    },
    6: {
        "animal_it": "Tigre", "animal_en": "Tiger", "emoji": "🐅",
        "traits_it": "Coraggioso, competitivo, imprevedibile, sicuro di sé",
        "traits_en": "Brave, competitive, unpredictable, confident",
        "compatible": ["Cavallo", "Cane"],
        "incompatible": ["Scimmia", "Serpente"]
    },
    7: {
        "animal_it": "Coniglio", "animal_en": "Rabbit", "emoji": "🐇",
        "traits_it": "Gentile, elegante, diplomatico, sensibile",
        "traits_en": "Gentle, elegant, diplomatic, sensitive",
        "compatible": ["Capra", "Maiale"],
        "incompatible": ["Gallo", "Drago"]
    },
    8: {
        "animal_it": "Drago", "animal_en": "Dragon", "emoji": "🐉",
        "traits_it": "Potente, carismatico, fortunato, ambizioso",
        "traits_en": "Powerful, charismatic, lucky, ambitious",
        "compatible": ["Topo", "Scimmia"],
        "incompatible": ["Cane", "Coniglio"]
    },
    9: {
        "animal_it": "Serpente", "animal_en": "Snake", "emoji": "🐍",
        "traits_it": "Saggio, misterioso, intuitivo, elegante",
        "traits_en": "Wise, mysterious, intuitive, elegant",
        "compatible": ["Bue", "Gallo"],
        "incompatible": ["Tigre", "Maiale"]
    },
    10: {
        "animal_it": "Cavallo", "animal_en": "Horse", "emoji": "🐴",
        "traits_it": "Energico, indipendente, avventuroso, vivace",
        "traits_en": "Energetic, independent, adventurous, lively",
        "compatible": ["Tigre", "Capra"],
        "incompatible": ["Topo", "Bue"]
    },
    11: {
        "animal_it": "Capra", "animal_en": "Goat", "emoji": "🐐",
        "traits_it": "Creativo, gentile, empatico, artistico",
        "traits_en": "Creative, gentle, empathetic, artistic",
        "compatible": ["Coniglio", "Cavallo"],
        "incompatible": ["Bue", "Topo"]
    },
}

# Elementi cinesi con ciclo di 10 anni (2 anni per elemento)
CHINESE_ELEMENTS = {
    0: {"element_it": "Metallo", "element_en": "Metal", "color": "#C0C0C0", "emoji": "🔩", 
        "traits_it": "Determinato, risoluto, autosufficiente", "traits_en": "Determined, resolute, self-reliant"},
    1: {"element_it": "Metallo", "element_en": "Metal", "color": "#C0C0C0", "emoji": "🔩",
        "traits_it": "Determinato, risoluto, autosufficiente", "traits_en": "Determined, resolute, self-reliant"},
    2: {"element_it": "Acqua", "element_en": "Water", "color": "#1E90FF", "emoji": "💧",
        "traits_it": "Intuitivo, flessibile, persuasivo", "traits_en": "Intuitive, flexible, persuasive"},
    3: {"element_it": "Acqua", "element_en": "Water", "color": "#1E90FF", "emoji": "💧",
        "traits_it": "Intuitivo, flessibile, persuasivo", "traits_en": "Intuitive, flexible, persuasive"},
    4: {"element_it": "Legno", "element_en": "Wood", "color": "#228B22", "emoji": "🌳",
        "traits_it": "Generoso, cooperativo, idealista", "traits_en": "Generous, cooperative, idealistic"},
    5: {"element_it": "Legno", "element_en": "Wood", "color": "#228B22", "emoji": "🌳",
        "traits_it": "Generoso, cooperativo, idealista", "traits_en": "Generous, cooperative, idealistic"},
    6: {"element_it": "Fuoco", "element_en": "Fire", "color": "#FF4500", "emoji": "🔥",
        "traits_it": "Passionale, avventuroso, leader naturale", "traits_en": "Passionate, adventurous, natural leader"},
    7: {"element_it": "Fuoco", "element_en": "Fire", "color": "#FF4500", "emoji": "🔥",
        "traits_it": "Passionale, avventuroso, leader naturale", "traits_en": "Passionate, adventurous, natural leader"},
    8: {"element_it": "Terra", "element_en": "Earth", "color": "#8B4513", "emoji": "🌍",
        "traits_it": "Stabile, pratico, affidabile", "traits_en": "Stable, practical, reliable"},
    9: {"element_it": "Terra", "element_en": "Earth", "color": "#8B4513", "emoji": "🌍",
        "traits_it": "Stabile, pratico, affidabile", "traits_en": "Stable, practical, reliable"},
}


# ============== ZODIACO OCCIDENTALE ==============

WESTERN_ZODIAC = {
    "aries": {
        "name_it": "Ariete", "name_en": "Aries", "emoji": "♈",
        "dates": "21 Mar - 19 Apr",
        "element_it": "Fuoco", "element_en": "Fire",
        "ruling_planet_it": "Marte", "ruling_planet_en": "Mars",
        "traits_it": "Coraggioso, determinato, entusiasta, dinamico",
        "traits_en": "Courageous, determined, enthusiastic, dynamic",
        "start_month": 3, "start_day": 21,
        "end_month": 4, "end_day": 19
    },
    "taurus": {
        "name_it": "Toro", "name_en": "Taurus", "emoji": "♉",
        "dates": "20 Apr - 20 Mag",
        "element_it": "Terra", "element_en": "Earth",
        "ruling_planet_it": "Venere", "ruling_planet_en": "Venus",
        "traits_it": "Affidabile, paziente, pratico, devoto",
        "traits_en": "Reliable, patient, practical, devoted",
        "start_month": 4, "start_day": 20,
        "end_month": 5, "end_day": 20
    },
    "gemini": {
        "name_it": "Gemelli", "name_en": "Gemini", "emoji": "♊",
        "dates": "21 Mag - 20 Giu",
        "element_it": "Aria", "element_en": "Air",
        "ruling_planet_it": "Mercurio", "ruling_planet_en": "Mercury",
        "traits_it": "Adattabile, curioso, comunicativo, versatile",
        "traits_en": "Adaptable, curious, communicative, versatile",
        "start_month": 5, "start_day": 21,
        "end_month": 6, "end_day": 20
    },
    "cancer": {
        "name_it": "Cancro", "name_en": "Cancer", "emoji": "♋",
        "dates": "21 Giu - 22 Lug",
        "element_it": "Acqua", "element_en": "Water",
        "ruling_planet_it": "Luna", "ruling_planet_en": "Moon",
        "traits_it": "Intuitivo, emotivo, protettivo, leale",
        "traits_en": "Intuitive, emotional, protective, loyal",
        "start_month": 6, "start_day": 21,
        "end_month": 7, "end_day": 22
    },
    "leo": {
        "name_it": "Leone", "name_en": "Leo", "emoji": "♌",
        "dates": "23 Lug - 22 Ago",
        "element_it": "Fuoco", "element_en": "Fire",
        "ruling_planet_it": "Sole", "ruling_planet_en": "Sun",
        "traits_it": "Creativo, generoso, caloroso, leader naturale",
        "traits_en": "Creative, generous, warmhearted, natural leader",
        "start_month": 7, "start_day": 23,
        "end_month": 8, "end_day": 22
    },
    "virgo": {
        "name_it": "Vergine", "name_en": "Virgo", "emoji": "♍",
        "dates": "23 Ago - 22 Set",
        "element_it": "Terra", "element_en": "Earth",
        "ruling_planet_it": "Mercurio", "ruling_planet_en": "Mercury",
        "traits_it": "Analitico, pratico, attento ai dettagli, laborioso",
        "traits_en": "Analytical, practical, detail-oriented, hardworking",
        "start_month": 8, "start_day": 23,
        "end_month": 9, "end_day": 22
    },
    "libra": {
        "name_it": "Bilancia", "name_en": "Libra", "emoji": "♎",
        "dates": "23 Set - 22 Ott",
        "element_it": "Aria", "element_en": "Air",
        "ruling_planet_it": "Venere", "ruling_planet_en": "Venus",
        "traits_it": "Diplomatico, equilibrato, socievole, giusto",
        "traits_en": "Diplomatic, balanced, sociable, fair",
        "start_month": 9, "start_day": 23,
        "end_month": 10, "end_day": 22
    },
    "scorpio": {
        "name_it": "Scorpione", "name_en": "Scorpio", "emoji": "♏",
        "dates": "23 Ott - 21 Nov",
        "element_it": "Acqua", "element_en": "Water",
        "ruling_planet_it": "Plutone", "ruling_planet_en": "Pluto",
        "traits_it": "Passionale, determinato, intuitivo, magnetico",
        "traits_en": "Passionate, determined, intuitive, magnetic",
        "start_month": 10, "start_day": 23,
        "end_month": 11, "end_day": 21
    },
    "sagittarius": {
        "name_it": "Sagittario", "name_en": "Sagittarius", "emoji": "♐",
        "dates": "22 Nov - 21 Dic",
        "element_it": "Fuoco", "element_en": "Fire",
        "ruling_planet_it": "Giove", "ruling_planet_en": "Jupiter",
        "traits_it": "Ottimista, avventuroso, filosofico, generoso",
        "traits_en": "Optimistic, adventurous, philosophical, generous",
        "start_month": 11, "start_day": 22,
        "end_month": 12, "end_day": 21
    },
    "capricorn": {
        "name_it": "Capricorno", "name_en": "Capricorn", "emoji": "♑",
        "dates": "22 Dic - 19 Gen",
        "element_it": "Terra", "element_en": "Earth",
        "ruling_planet_it": "Saturno", "ruling_planet_en": "Saturn",
        "traits_it": "Responsabile, disciplinato, ambizioso, pratico",
        "traits_en": "Responsible, disciplined, ambitious, practical",
        "start_month": 12, "start_day": 22,
        "end_month": 1, "end_day": 19
    },
    "aquarius": {
        "name_it": "Acquario", "name_en": "Aquarius", "emoji": "♒",
        "dates": "20 Gen - 18 Feb",
        "element_it": "Aria", "element_en": "Air",
        "ruling_planet_it": "Urano", "ruling_planet_en": "Uranus",
        "traits_it": "Progressista, originale, indipendente, umanitario",
        "traits_en": "Progressive, original, independent, humanitarian",
        "start_month": 1, "start_day": 20,
        "end_month": 2, "end_day": 18
    },
    "pisces": {
        "name_it": "Pesci", "name_en": "Pisces", "emoji": "♓",
        "dates": "19 Feb - 20 Mar",
        "element_it": "Acqua", "element_en": "Water",
        "ruling_planet_it": "Nettuno", "ruling_planet_en": "Neptune",
        "traits_it": "Compassionevole, artistico, intuitivo, sognatore",
        "traits_en": "Compassionate, artistic, intuitive, dreamy",
        "start_month": 2, "start_day": 19,
        "end_month": 3, "end_day": 20
    },
}


def calculate_chinese_zodiac(birth_year: int) -> Dict:
    """Calcola il segno zodiacale cinese basato sull'anno di nascita"""
    index = (birth_year - 1900) % 12
    element_index = (birth_year - 1900) % 10
    
    animal = CHINESE_ZODIAC_ANIMALS.get(index, CHINESE_ZODIAC_ANIMALS[0])
    element = CHINESE_ELEMENTS.get(element_index, CHINESE_ELEMENTS[0])
    
    return {
        "animal": animal,
        "element": element,
        "year": birth_year
    }


def calculate_western_zodiac(birth_month: int, birth_day: int) -> Dict:
    """Calcola il segno zodiacale occidentale basato su mese e giorno"""
    
    # Ordine speciale per gestire Capricorno che attraversa l'anno
    zodiac_order = [
        "capricorn", "aquarius", "pisces", "aries", "taurus", "gemini",
        "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius"
    ]
    
    for sign_key in zodiac_order:
        sign = WESTERN_ZODIAC[sign_key]
        start_m, start_d = sign["start_month"], sign["start_day"]
        end_m, end_d = sign["end_month"], sign["end_day"]
        
        # Gestione segni che attraversano l'anno (Capricorno)
        if start_m > end_m:  # Es: Dic-Gen
            if (birth_month == start_m and birth_day >= start_d) or \
               (birth_month == end_m and birth_day <= end_d) or \
               (birth_month == 12 and birth_month > start_m) or \
               (birth_month == 1 and birth_month < end_m):
                return {"sign_key": sign_key, **sign}
        else:
            if (birth_month == start_m and birth_day >= start_d) or \
               (birth_month == end_m and birth_day <= end_d) or \
               (start_m < birth_month < end_m):
                return {"sign_key": sign_key, **sign}
    
    # Default a Capricorno se non trovato
    return {"sign_key": "capricorn", **WESTERN_ZODIAC["capricorn"]}


def calculate_age(birth_date: date) -> int:
    """Calcola l'età dalla data di nascita"""
    today = date.today()
    age = today.year - birth_date.year
    
    # Controlla se il compleanno è già passato quest'anno
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    
    return age


def get_full_astrological_profile(
    birth_date: date,
    birth_time: Optional[str] = None,
    birth_place: Optional[str] = None,
    language: str = "it"
) -> Dict:
    """
    Genera il profilo astrologico completo dell'utente
    """
    
    # Calcola zodiaco cinese
    chinese = calculate_chinese_zodiac(birth_date.year)
    
    # Calcola zodiaco occidentale  
    western = calculate_western_zodiac(birth_date.month, birth_date.day)
    
    # Calcola età
    age = calculate_age(birth_date)
    
    # Costruisci profilo
    lang_suffix = "_it" if language == "it" else "_en"
    
    profile = {
        "birth_date": birth_date.isoformat(),
        "birth_time": birth_time,
        "birth_place": birth_place,
        "age": age,
        
        "chinese_zodiac": {
            "animal": chinese["animal"][f"animal{lang_suffix}"],
            "animal_emoji": chinese["animal"]["emoji"],
            "animal_traits": chinese["animal"][f"traits{lang_suffix}"],
            "element": chinese["element"][f"element{lang_suffix}"],
            "element_emoji": chinese["element"]["emoji"],
            "element_color": chinese["element"]["color"],
            "element_traits": chinese["element"][f"traits{lang_suffix}"],
            "year": chinese["year"],
            "compatible_with": chinese["animal"]["compatible"],
            "incompatible_with": chinese["animal"]["incompatible"],
        },
        
        "western_zodiac": {
            "sign": western[f"name{lang_suffix}"],
            "sign_key": western["sign_key"],
            "sign_emoji": western["emoji"],
            "dates": western["dates"],
            "element": western[f"element{lang_suffix}"],
            "ruling_planet": western[f"ruling_planet{lang_suffix}"],
            "traits": western[f"traits{lang_suffix}"],
        },
        
        "combined_reading": generate_combined_reading(chinese, western, language)
    }
    
    return profile


def generate_combined_reading(chinese: Dict, western: Dict, language: str = "it") -> str:
    """Genera una lettura combinata dei due sistemi zodiacali"""
    
    lang_suffix = "_it" if language == "it" else "_en"
    
    animal = chinese["animal"][f"animal{lang_suffix}"]
    animal_emoji = chinese["animal"]["emoji"]
    element_cn = chinese["element"][f"element{lang_suffix}"]
    
    sign = western[f"name{lang_suffix}"]
    sign_emoji = western["emoji"]
    element_west = western[f"element{lang_suffix}"]
    
    if language == "it":
        reading = f"""La tua combinazione unica di {animal} {animal_emoji} con elemento {element_cn} (zodiaco cinese) e {sign} {sign_emoji} con elemento {element_west} (zodiaco occidentale) crea un profilo energetico interessante.

Dal lato orientale, il {animal} ti dona {chinese["animal"]["traits_it"].lower()}. L'elemento {element_cn} rafforza queste qualità rendendoti {chinese["element"]["traits_it"].lower()}.

Dal lato occidentale, il {sign} ti conferisce {western["traits_it"].lower()}. Il tuo pianeta reggente è {western["ruling_planet_it"]}.

Questa combinazione suggerisce una persona che può bilanciare saggezza antica e spirito contemporaneo."""
    else:
        reading = f"""Your unique combination of {animal} {animal_emoji} with {element_cn} element (Chinese zodiac) and {sign} {sign_emoji} with {element_west} element (Western zodiac) creates an interesting energetic profile.

From the Eastern side, the {animal} gives you {chinese["animal"]["traits_en"].lower()}. The {element_cn} element strengthens these qualities making you {chinese["element"]["traits_en"].lower()}.

From the Western side, {sign} gives you {western["traits_en"].lower()}. Your ruling planet is {western["ruling_planet_en"]}.

This combination suggests a person who can balance ancient wisdom and contemporary spirit."""
    
    return reading


# ============== MODELLO PROFILO UTENTE ==============

USER_PROFILE_FIELDS = {
    # Dati anagrafici
    "birth_date": {"type": "date", "required": False, "label_it": "Data di nascita", "label_en": "Birth date"},
    "birth_time": {"type": "time", "required": False, "label_it": "Orario di nascita", "label_en": "Birth time"},
    "birth_place": {"type": "string", "required": False, "label_it": "Luogo di nascita", "label_en": "Birth place"},
    "gender": {"type": "select", "required": False, "label_it": "Genere", "label_en": "Gender",
               "options": [
                   {"value": "male", "label_it": "Uomo", "label_en": "Male"},
                   {"value": "female", "label_it": "Donna", "label_en": "Female"},
                   {"value": "other", "label_it": "Altro", "label_en": "Other"},
                   {"value": "prefer_not_say", "label_it": "Preferisco non dire", "label_en": "Prefer not to say"},
               ]},
    
    # Informazioni personali
    "occupation": {"type": "string", "required": False, "max_length": 30, 
                   "label_it": "Posizione lavorativa/studio", "label_en": "Work/study position"},
    
    # Esperienza I Ching
    "iching_experience": {"type": "select", "required": False, 
                          "label_it": "Esperienza con I Ching", "label_en": "I Ching experience",
                          "options": [
                              {"value": "beginner", "label_it": "Principiante", "label_en": "Beginner"},
                              {"value": "intermediate", "label_it": "Intermedio", "label_en": "Intermediate"},
                              {"value": "expert", "label_it": "Esperto", "label_en": "Expert"},
                          ]},
    
    # Benessere
    "activity_level": {"type": "select", "required": False,
                       "label_it": "Livello attività fisica", "label_en": "Physical activity level",
                       "options": [
                           {"value": "sedentary", "label_it": "Sedentario", "label_en": "Sedentary"},
                           {"value": "moderate", "label_it": "Moderato", "label_en": "Moderate"},
                           {"value": "active", "label_it": "Attivo", "label_en": "Active"},
                       ]},
    
    "wellness_interests": {"type": "multiselect", "required": False,
                           "label_it": "Interesse per pratiche", "label_en": "Interest in practices",
                           "options": [
                               {"value": "meditation", "label_it": "Meditazione", "label_en": "Meditation"},
                               {"value": "yoga", "label_it": "Yoga", "label_en": "Yoga"},
                               {"value": "taichi", "label_it": "Tai Chi", "label_en": "Tai Chi"},
                               {"value": "qigong", "label_it": "Qi Gong", "label_en": "Qi Gong"},
                           ]},
}


def validate_profile_data(data: Dict) -> Dict:
    """Valida i dati del profilo utente"""
    validated = {}
    errors = []
    
    for field_name, field_config in USER_PROFILE_FIELDS.items():
        if field_name in data:
            value = data[field_name]
            
            # Validazione lunghezza
            if field_config.get("max_length") and len(str(value)) > field_config["max_length"]:
                errors.append(f"{field_name}: max {field_config['max_length']} characters")
                continue
            
            # Validazione select
            if field_config["type"] == "select" and value:
                valid_values = [opt["value"] for opt in field_config.get("options", [])]
                if value not in valid_values:
                    errors.append(f"{field_name}: invalid value")
                    continue
            
            # Validazione multiselect
            if field_config["type"] == "multiselect" and value:
                valid_values = [opt["value"] for opt in field_config.get("options", [])]
                if isinstance(value, list):
                    for v in value:
                        if v not in valid_values:
                            errors.append(f"{field_name}: invalid value {v}")
                            continue
            
            validated[field_name] = value
    
    return {"valid": len(errors) == 0, "data": validated, "errors": errors}
