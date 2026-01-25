# Sistema Generazione Tema Natale
# Utilizza Kerykeion per calcoli astronomici precisi con Swiss Ephemeris

from datetime import datetime, date
from typing import Dict, Optional, List, Tuple
from pathlib import Path
import json
import os

try:
    from kerykeion import AstrologicalSubject, KerykeionChartSVG
    KERYKEION_AVAILABLE = True
except ImportError:
    KERYKEION_AVAILABLE = False
    print("Warning: Kerykeion not installed. Natal chart generation will be limited.")

from timezonefinder import TimezoneFinder

# ============== INTERPRETAZIONI PIANETI NEI SEGNI ==============

PLANET_IN_SIGN_INTERPRETATIONS = {
    "Sun": {
        "Aries": {
            "it": "Il Sole in Ariete conferisce una personalità energica, pionieristica e coraggiosa. Sei un leader naturale, con una forte volontà di iniziare nuovi progetti. La tua energia è dinamica e impulsiva.",
            "en": "Sun in Aries gives an energetic, pioneering, and courageous personality. You're a natural leader with a strong will to start new projects. Your energy is dynamic and impulsive."
        },
        "Taurus": {
            "it": "Il Sole in Toro dona stabilità, pazienza e un forte legame con i piaceri sensoriali. Apprezzi la sicurezza materiale e le cose belle della vita. Sei determinato e affidabile.",
            "en": "Sun in Taurus gives stability, patience, and a strong connection to sensory pleasures. You appreciate material security and life's beautiful things. You're determined and reliable."
        },
        "Gemini": {
            "it": "Il Sole in Gemelli rende la personalità curiosa, comunicativa e versatile. La tua mente è agile e ami apprendere cose nuove. Sei socievole e ti adatti facilmente.",
            "en": "Sun in Gemini makes your personality curious, communicative, and versatile. Your mind is agile and you love learning new things. You're sociable and adapt easily."
        },
        "Cancer": {
            "it": "Il Sole in Cancro conferisce profonda sensibilità emotiva e un forte attaccamento alla famiglia. Sei protettivo, intuitivo e hai una ricca vita interiore.",
            "en": "Sun in Cancer gives deep emotional sensitivity and strong family attachment. You're protective, intuitive, and have a rich inner life."
        },
        "Leo": {
            "it": "Il Sole in Leone dona carisma, creatività e desiderio di riconoscimento. Sei generoso, drammatico e ami essere al centro dell'attenzione. Hai un cuore grande.",
            "en": "Sun in Leo gives charisma, creativity, and desire for recognition. You're generous, dramatic, and love being the center of attention. You have a big heart."
        },
        "Virgo": {
            "it": "Il Sole in Vergine rende la personalità analitica, pratica e orientata al dettaglio. Sei un perfezionista con forte etica del lavoro. Ami essere utile agli altri.",
            "en": "Sun in Virgo makes your personality analytical, practical, and detail-oriented. You're a perfectionist with strong work ethic. You love being helpful to others."
        },
        "Libra": {
            "it": "Il Sole in Bilancia conferisce diplomazia, senso estetico e desiderio di armonia. Sei equilibrato nelle relazioni e cerchi sempre la giustizia. L'arte e la bellezza sono importanti per te.",
            "en": "Sun in Libra gives diplomacy, aesthetic sense, and desire for harmony. You're balanced in relationships and always seek justice. Art and beauty are important to you."
        },
        "Scorpio": {
            "it": "Il Sole in Scorpione dona intensità emotiva, determinazione e capacità di trasformazione. Sei profondo, misterioso e hai grande forza interiore. Nulla ti sfugge.",
            "en": "Sun in Scorpio gives emotional intensity, determination, and transformative capacity. You're deep, mysterious, and have great inner strength. Nothing escapes you."
        },
        "Sagittarius": {
            "it": "Il Sole in Sagittario conferisce ottimismo, amore per l'avventura e ricerca di significato. Sei filosofico, espansivo e ami viaggiare. La libertà è essenziale per te.",
            "en": "Sun in Sagittarius gives optimism, love for adventure, and search for meaning. You're philosophical, expansive, and love to travel. Freedom is essential to you."
        },
        "Capricorn": {
            "it": "Il Sole in Capricorno dona ambizione, disciplina e senso di responsabilità. Sei determinato a raggiungere i tuoi obiettivi e costruisci con pazienza il tuo successo.",
            "en": "Sun in Capricorn gives ambition, discipline, and sense of responsibility. You're determined to reach your goals and patiently build your success."
        },
        "Aquarius": {
            "it": "Il Sole in Acquario conferisce originalità, spirito umanitario e pensiero innovativo. Sei indipendente, progressista e ami le cause sociali. Il futuro ti affascina.",
            "en": "Sun in Aquarius gives originality, humanitarian spirit, and innovative thinking. You're independent, progressive, and love social causes. The future fascinates you."
        },
        "Pisces": {
            "it": "Il Sole in Pesci dona sensibilità artistica, intuizione profonda e compassione. Sei sognatore, empatico e hai una connessione speciale con il mondo spirituale.",
            "en": "Sun in Pisces gives artistic sensitivity, deep intuition, and compassion. You're a dreamer, empathetic, and have a special connection with the spiritual world."
        }
    },
    "Moon": {
        "Aries": {"it": "La Luna in Ariete indica reazioni emotive rapide e dirette. Hai bisogno di indipendenza emotiva e tendi ad essere impulsivo nelle emozioni.", "en": "Moon in Aries indicates quick and direct emotional reactions. You need emotional independence and tend to be impulsive in emotions."},
        "Taurus": {"it": "La Luna in Toro dona stabilità emotiva e bisogno di sicurezza. Le tue emozioni sono profonde e durature. Cerchi comfort e routine.", "en": "Moon in Taurus gives emotional stability and need for security. Your emotions are deep and lasting. You seek comfort and routine."},
        "Gemini": {"it": "La Luna in Gemelli indica emotività variabile e bisogno di stimolazione mentale. Razionalizzi le emozioni e hai bisogno di comunicare i tuoi sentimenti.", "en": "Moon in Gemini indicates variable emotionality and need for mental stimulation. You rationalize emotions and need to communicate your feelings."},
        "Cancer": {"it": "La Luna in Cancro (suo domicilio) amplifica la sensibilità e l'intuizione. Sei profondamente emotivo, protettivo e legato alla famiglia e al passato.", "en": "Moon in Cancer (its home) amplifies sensitivity and intuition. You're deeply emotional, protective, and tied to family and the past."},
        "Leo": {"it": "La Luna in Leone indica bisogno di riconoscimento emotivo e espressione drammatica dei sentimenti. Sei generoso e hai un cuore caldo.", "en": "Moon in Leo indicates need for emotional recognition and dramatic expression of feelings. You're generous and have a warm heart."},
        "Virgo": {"it": "La Luna in Vergine porta analisi delle emozioni e bisogno di ordine nella vita emotiva. Tendi a preoccuparti e cerchi la perfezione.", "en": "Moon in Virgo brings analysis of emotions and need for order in emotional life. You tend to worry and seek perfection."},
        "Libra": {"it": "La Luna in Bilancia indica bisogno di armonia nelle relazioni e difficoltà con i conflitti. Cerchi equilibrio emotivo attraverso gli altri.", "en": "Moon in Libra indicates need for harmony in relationships and difficulty with conflicts. You seek emotional balance through others."},
        "Scorpio": {"it": "La Luna in Scorpione dona emozioni intense e profonde. Sei passionale, geloso e hai grande capacità di trasformazione emotiva.", "en": "Moon in Scorpio gives intense and deep emotions. You're passionate, jealous, and have great capacity for emotional transformation."},
        "Sagittarius": {"it": "La Luna in Sagittario indica bisogno di libertà emotiva e ottimismo. Sei avventuroso nelle emozioni e cerchi sempre nuove esperienze.", "en": "Moon in Sagittarius indicates need for emotional freedom and optimism. You're adventurous in emotions and always seek new experiences."},
        "Capricorn": {"it": "La Luna in Capricorno porta controllo delle emozioni e riservatezza. Sei emotivamente maturo ma puoi sembrare distante. Il dovere è importante.", "en": "Moon in Capricorn brings emotional control and reserve. You're emotionally mature but can seem distant. Duty is important."},
        "Aquarius": {"it": "La Luna in Acquario indica distacco emotivo e bisogno di spazio. Sei originale nel modo di sentire e valorizzi l'amicizia sopra tutto.", "en": "Moon in Aquarius indicates emotional detachment and need for space. You're original in the way you feel and value friendship above all."},
        "Pisces": {"it": "La Luna in Pesci amplifica sensibilità e intuizione. Sei empatico, sognatore e assorbi le emozioni degli altri come una spugna.", "en": "Moon in Pisces amplifies sensitivity and intuition. You're empathetic, dreamy, and absorb others' emotions like a sponge."}
    }
}

# Interpretazioni Ascendente
ASCENDANT_INTERPRETATIONS = {
    "Aries": {"it": "L'Ascendente in Ariete ti conferisce un'apparenza energica e diretta. Gli altri ti percepiscono come coraggioso e assertivo. Il tuo approccio alla vita è attivo e competitivo.", "en": "Ascendant in Aries gives you an energetic and direct appearance. Others perceive you as courageous and assertive. Your approach to life is active and competitive."},
    "Taurus": {"it": "L'Ascendente in Toro dona un'apparenza solida e affidabile. Gli altri ti vedono come paziente e pratico. Il tuo approccio alla vita è stabile e sensuale.", "en": "Ascendant in Taurus gives a solid and reliable appearance. Others see you as patient and practical. Your approach to life is stable and sensual."},
    "Gemini": {"it": "L'Ascendente in Gemelli ti rende comunicativo e vivace agli occhi degli altri. Sembri curioso e versatile. Il tuo approccio è mentale e sociale.", "en": "Ascendant in Gemini makes you communicative and lively in others' eyes. You seem curious and versatile. Your approach is mental and social."},
    "Cancer": {"it": "L'Ascendente in Cancro ti conferisce un'apparenza sensibile e protettiva. Gli altri ti percepiscono come premuroso e intuitivo. Il tuo approccio è emotivo e familiare.", "en": "Ascendant in Cancer gives you a sensitive and protective appearance. Others perceive you as caring and intuitive. Your approach is emotional and family-oriented."},
    "Leo": {"it": "L'Ascendente in Leone dona un'apparenza carismatica e regale. Gli altri ti vedono come sicuro di te e generoso. Il tuo approccio alla vita è creativo e drammatico.", "en": "Ascendant in Leo gives a charismatic and regal appearance. Others see you as confident and generous. Your approach to life is creative and dramatic."},
    "Virgo": {"it": "L'Ascendente in Vergine ti rende preciso e modesto agli occhi degli altri. Sembri pratico e attento ai dettagli. Il tuo approccio è analitico e utile.", "en": "Ascendant in Virgo makes you precise and modest in others' eyes. You seem practical and detail-oriented. Your approach is analytical and helpful."},
    "Libra": {"it": "L'Ascendente in Bilancia ti conferisce un'apparenza armoniosa e diplomatica. Gli altri ti percepiscono come equilibrato e affascinante. Il tuo approccio cerca la bellezza e le relazioni.", "en": "Ascendant in Libra gives you a harmonious and diplomatic appearance. Others perceive you as balanced and charming. Your approach seeks beauty and relationships."},
    "Scorpio": {"it": "L'Ascendente in Scorpione dona un'apparenza intensa e magnetica. Gli altri ti vedono come misterioso e potente. Il tuo approccio alla vita è profondo e trasformativo.", "en": "Ascendant in Scorpio gives an intense and magnetic appearance. Others see you as mysterious and powerful. Your approach to life is deep and transformative."},
    "Sagittarius": {"it": "L'Ascendente in Sagittario ti rende ottimista e avventuroso agli occhi degli altri. Sembri espansivo e filosofico. Il tuo approccio è libero e in cerca di significato.", "en": "Ascendant in Sagittarius makes you optimistic and adventurous in others' eyes. You seem expansive and philosophical. Your approach is free and meaning-seeking."},
    "Capricorn": {"it": "L'Ascendente in Capricorno ti conferisce un'apparenza seria e responsabile. Gli altri ti percepiscono come ambizioso e affidabile. Il tuo approccio è pratico e orientato agli obiettivi.", "en": "Ascendant in Capricorn gives you a serious and responsible appearance. Others perceive you as ambitious and reliable. Your approach is practical and goal-oriented."},
    "Aquarius": {"it": "L'Ascendente in Acquario dona un'apparenza originale e indipendente. Gli altri ti vedono come innovativo e umanitario. Il tuo approccio alla vita è progressista e sociale.", "en": "Ascendant in Aquarius gives an original and independent appearance. Others see you as innovative and humanitarian. Your approach to life is progressive and social."},
    "Pisces": {"it": "L'Ascendente in Pesci ti rende sensibile e sognatore agli occhi degli altri. Sembri compassionevole e intuitivo. Il tuo approccio è spirituale e artistico.", "en": "Ascendant in Pisces makes you sensitive and dreamy in others' eyes. You seem compassionate and intuitive. Your approach is spiritual and artistic."}
}

# Interpretazioni Aspetti
ASPECT_INTERPRETATIONS = {
    "conjunction": {
        "it": "La congiunzione tra {planet1} e {planet2} unisce le energie di questi pianeti, intensificandole. Le qualità di entrambi si fondono creando una forza potente.",
        "en": "The conjunction between {planet1} and {planet2} unites the energies of these planets, intensifying them. The qualities of both merge creating a powerful force."
    },
    "sextile": {
        "it": "Il sestile tra {planet1} e {planet2} indica opportunità e talenti naturali. Queste energie collaborano armoniosamente, creando possibilità di crescita.",
        "en": "The sextile between {planet1} and {planet2} indicates opportunities and natural talents. These energies collaborate harmoniously, creating possibilities for growth."
    },
    "square": {
        "it": "La quadratura tra {planet1} e {planet2} crea tensione dinamica che richiede azione. Questa sfida può diventare una fonte di grande forza se gestita consapevolmente.",
        "en": "The square between {planet1} and {planet2} creates dynamic tension requiring action. This challenge can become a source of great strength if handled consciously."
    },
    "trine": {
        "it": "Il trigono tra {planet1} e {planet2} indica un flusso armonioso di energie. I talenti naturali si esprimono facilmente, portando fortuna e facilità in queste aree.",
        "en": "The trine between {planet1} and {planet2} indicates a harmonious flow of energies. Natural talents express easily, bringing luck and ease in these areas."
    },
    "opposition": {
        "it": "L'opposizione tra {planet1} e {planet2} indica una polarità che richiede integrazione. L'equilibrio tra queste forze opposte porta saggezza e completezza.",
        "en": "The opposition between {planet1} and {planet2} indicates a polarity requiring integration. Balance between these opposing forces brings wisdom and completeness."
    }
}


# Simboli zodiacali e planetari
ZODIAC_SYMBOLS = {
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
    "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
    "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
}

PLANET_SYMBOLS = {
    "Sun": "☉", "Moon": "☽", "Mercury": "☿", "Venus": "♀", "Mars": "♂",
    "Jupiter": "♃", "Saturn": "♄", "Uranus": "♅", "Neptune": "♆", "Pluto": "♇",
    "North_Node": "☊", "South_Node": "☋", "Chiron": "⚷"
}

ASPECT_SYMBOLS = {
    "conjunction": "☌", "sextile": "⚹", "square": "□", "trine": "△", "opposition": "☍"
}


def get_timezone_from_coordinates(lat: float, lng: float) -> str:
    """Ottiene il timezone dalle coordinate"""
    tf = TimezoneFinder()
    tz = tf.timezone_at(lat=lat, lng=lng)
    return tz or "UTC"


def calculate_natal_chart(
    name: str,
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: float,
    lng: float,
    city: str = "",
    language: str = "it"
) -> Dict:
    """
    Calcola il tema natale completo usando Kerykeion
    """
    
    if not KERYKEION_AVAILABLE:
        return {"error": "Kerykeion library not available"}
    
    try:
        # Ottieni timezone
        tz_str = get_timezone_from_coordinates(lat, lng)
        
        # Crea il soggetto astrologico
        subject = AstrologicalSubject(
            name=name,
            year=year,
            month=month,
            day=day,
            hour=hour,
            minute=minute,
            lat=lat,
            lng=lng,
            tz_str=tz_str,
            city=city
        )
        
        # Estrai dati pianeti
        planets_data = []
        planet_names = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
        
        for planet_name in planet_names:
            planet = getattr(subject, planet_name.lower(), None)
            if planet:
                sign = planet.sign
                degree = planet.position
                house = planet.house if hasattr(planet, 'house') else None
                retrograde = planet.retrograde if hasattr(planet, 'retrograde') else False
                
                # Ottieni interpretazione
                interpretation = get_planet_interpretation(planet_name, sign, language)
                
                planets_data.append({
                    "name": planet_name,
                    "name_it": get_planet_name_it(planet_name),
                    "symbol": PLANET_SYMBOLS.get(planet_name, ""),
                    "sign": sign,
                    "sign_symbol": ZODIAC_SYMBOLS.get(sign, ""),
                    "degree": round(degree, 2),
                    "degree_formatted": format_degree(degree),
                    "house": house,
                    "retrograde": retrograde,
                    "interpretation": interpretation
                })
        
        # Estrai ascendente
        asc_sign = subject.first_house.sign if hasattr(subject, 'first_house') else None
        asc_degree = subject.first_house.position if hasattr(subject, 'first_house') else 0
        
        # Estrai MC (Midheaven)
        mc_sign = subject.tenth_house.sign if hasattr(subject, 'tenth_house') else None
        mc_degree = subject.tenth_house.position if hasattr(subject, 'tenth_house') else 0
        
        # Estrai case
        houses_data = []
        for i in range(1, 13):
            house_attr = f"{'first' if i == 1 else 'second' if i == 2 else 'third' if i == 3 else 'fourth' if i == 4 else 'fifth' if i == 5 else 'sixth' if i == 6 else 'seventh' if i == 7 else 'eighth' if i == 8 else 'ninth' if i == 9 else 'tenth' if i == 10 else 'eleventh' if i == 11 else 'twelfth'}_house"
            house = getattr(subject, house_attr, None)
            if house:
                houses_data.append({
                    "number": i,
                    "sign": house.sign,
                    "sign_symbol": ZODIAC_SYMBOLS.get(house.sign, ""),
                    "degree": round(house.position, 2),
                    "degree_formatted": format_degree(house.position)
                })
        
        # Calcola aspetti
        aspects_data = calculate_aspects(subject, language)
        
        # Genera SVG del grafico
        svg_content = generate_chart_svg(subject)
        
        # Crea interpretazione ascendente
        asc_interpretation = ASCENDANT_INTERPRETATIONS.get(asc_sign, {}).get(language, "")
        
        return {
            "success": True,
            "subject": {
                "name": name,
                "birth_date": f"{year}-{month:02d}-{day:02d}",
                "birth_time": f"{hour:02d}:{minute:02d}",
                "birth_place": city,
                "coordinates": {"lat": lat, "lng": lng},
                "timezone": tz_str
            },
            "ascendant": {
                "sign": asc_sign,
                "sign_symbol": ZODIAC_SYMBOLS.get(asc_sign, ""),
                "degree": round(asc_degree, 2),
                "degree_formatted": format_degree(asc_degree),
                "interpretation": asc_interpretation
            },
            "midheaven": {
                "sign": mc_sign,
                "sign_symbol": ZODIAC_SYMBOLS.get(mc_sign, ""),
                "degree": round(mc_degree, 2),
                "degree_formatted": format_degree(mc_degree)
            },
            "planets": planets_data,
            "houses": houses_data,
            "aspects": aspects_data,
            "chart_svg": svg_content
        }
        
    except Exception as e:
        print(f"Error calculating natal chart: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "success": False}


def calculate_aspects(subject, language: str = "it") -> List[Dict]:
    """Calcola gli aspetti tra i pianeti"""
    aspects = []
    
    planet_names = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
    
    # Ottieni posizioni
    positions = {}
    for p in planet_names:
        planet = getattr(subject, p.lower(), None)
        if planet:
            positions[p] = planet.abs_pos if hasattr(planet, 'abs_pos') else planet.position
    
    # Calcola aspetti tra coppie di pianeti
    aspect_orbs = {
        "conjunction": (0, 8),
        "sextile": (60, 6),
        "square": (90, 7),
        "trine": (120, 8),
        "opposition": (180, 8)
    }
    
    for i, p1 in enumerate(planet_names):
        for p2 in planet_names[i+1:]:
            if p1 in positions and p2 in positions:
                diff = abs(positions[p1] - positions[p2])
                if diff > 180:
                    diff = 360 - diff
                
                for aspect_name, (angle, orb) in aspect_orbs.items():
                    if abs(diff - angle) <= orb:
                        interpretation = ASPECT_INTERPRETATIONS.get(aspect_name, {}).get(language, "")
                        interpretation = interpretation.format(
                            planet1=get_planet_name_it(p1) if language == "it" else p1,
                            planet2=get_planet_name_it(p2) if language == "it" else p2
                        )
                        
                        aspects.append({
                            "planet1": p1,
                            "planet1_symbol": PLANET_SYMBOLS.get(p1, ""),
                            "planet2": p2,
                            "planet2_symbol": PLANET_SYMBOLS.get(p2, ""),
                            "aspect": aspect_name,
                            "aspect_symbol": ASPECT_SYMBOLS.get(aspect_name, ""),
                            "angle": angle,
                            "orb": round(abs(diff - angle), 2),
                            "interpretation": interpretation
                        })
                        break
    
    return aspects


def generate_chart_svg(subject) -> str:
    """Genera il grafico SVG del tema natale"""
    try:
        # Usa KerykeionChartSVG per generare il grafico
        chart = KerykeionChartSVG(subject)
        
        # Genera SVG come stringa
        svg_string = chart.makeSVG()
        
        return svg_string
    except Exception as e:
        print(f"Error generating SVG chart: {e}")
        return ""


def format_degree(degree: float) -> str:
    """Formatta i gradi in formato astrologico (DD° MM' SS'')"""
    d = int(degree)
    m = int((degree - d) * 60)
    s = int(((degree - d) * 60 - m) * 60)
    return f"{d}° {m:02d}' {s:02d}\""


def get_planet_name_it(planet: str) -> str:
    """Restituisce il nome italiano del pianeta"""
    names = {
        "Sun": "Sole", "Moon": "Luna", "Mercury": "Mercurio", "Venus": "Venere",
        "Mars": "Marte", "Jupiter": "Giove", "Saturn": "Saturno",
        "Uranus": "Urano", "Neptune": "Nettuno", "Pluto": "Plutone",
        "North_Node": "Nodo Nord", "South_Node": "Nodo Sud", "Chiron": "Chirone"
    }
    return names.get(planet, planet)


def get_planet_interpretation(planet: str, sign: str, language: str = "it") -> str:
    """Ottiene l'interpretazione del pianeta nel segno"""
    planet_interps = PLANET_IN_SIGN_INTERPRETATIONS.get(planet, {})
    sign_interp = planet_interps.get(sign, {})
    return sign_interp.get(language, "")


# ============== GEOCODING HELPER ==============

async def geocode_location(city: str) -> Optional[Dict]:
    """
    Geocodifica una città per ottenere le coordinate.
    Usa l'API di Nominatim (OpenStreetMap)
    """
    import aiohttp
    
    try:
        async with aiohttp.ClientSession() as session:
            url = f"https://nominatim.openstreetmap.org/search?q={city}&format=json&limit=1"
            headers = {"User-Agent": "IChing-App/1.0"}
            
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data:
                        return {
                            "lat": float(data[0]["lat"]),
                            "lng": float(data[0]["lon"]),
                            "display_name": data[0]["display_name"]
                        }
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return None
