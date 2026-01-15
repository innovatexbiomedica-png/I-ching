# I Ching Traditional Data
# Contains hexagram sentences, line texts, and trigram info

TRIGRAMS = {
    "☰": {"name": "Qián", "name_it": "Il Creativo", "name_en": "The Creative", "element": "Cielo", "element_en": "Heaven", "quality": "Forza", "color": "#FFD700"},
    "☷": {"name": "Kūn", "name_it": "Il Ricettivo", "name_en": "The Receptive", "element": "Terra", "element_en": "Earth", "quality": "Dedizione", "color": "#8B4513"},
    "☳": {"name": "Zhèn", "name_it": "L'Eccitante", "name_en": "The Arousing", "element": "Tuono", "element_en": "Thunder", "quality": "Movimento", "color": "#9932CC"},
    "☵": {"name": "Kǎn", "name_it": "L'Abissale", "name_en": "The Abysmal", "element": "Acqua", "element_en": "Water", "quality": "Pericolo", "color": "#1E90FF"},
    "☶": {"name": "Gèn", "name_it": "L'Arresto", "name_en": "Keeping Still", "element": "Monte", "element_en": "Mountain", "quality": "Quiete", "color": "#708090"},
    "☴": {"name": "Xùn", "name_it": "Il Mite", "name_en": "The Gentle", "element": "Vento/Legno", "element_en": "Wind/Wood", "quality": "Penetrazione", "color": "#228B22"},
    "☲": {"name": "Lí", "name_it": "L'Aderente", "name_en": "The Clinging", "element": "Fuoco", "element_en": "Fire", "quality": "Chiarezza", "color": "#FF4500"},
    "☱": {"name": "Duì", "name_it": "Il Sereno", "name_en": "The Joyous", "element": "Lago", "element_en": "Lake", "quality": "Gioia", "color": "#00CED1"},
}

# Hexagram traditional data with sentences and line meanings
HEXAGRAM_TRADITIONAL = {
    1: {
        "sentence_it": "Il Creativo opera sublime riuscita, propizio per perseveranza.",
        "sentence_en": "The Creative works sublime success, furthering through perseverance.",
        "image_it": "Il movimento del cielo è pieno di forza. Così il nobile rende se stesso forte e instancabile.",
        "image_en": "The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.",
        "trigram_above": "☰",
        "trigram_below": "☰",
        "lines": {
            1: {"moving": "Drago coperto. Non agire.", "meaning": "Il tempo non è ancora maturo per l'azione."},
            2: {"moving": "Drago che compare nel campo. Propizio è vedere il grande uomo.", "meaning": "L'influenza inizia a manifestarsi."},
            3: {"moving": "Il nobile è creativamente attivo tutto il giorno. Pericolo. Nessuna macchia.", "meaning": "Momento di transizione che richiede vigilanza."},
            4: {"moving": "Oscillante slancio al di sopra dell'abisso. Nessuna macchia.", "meaning": "Libertà di scelta tra due vie."},
            5: {"moving": "Drago volante nel cielo. Propizio è vedere il grande uomo.", "meaning": "Il momento del massimo influsso è giunto."},
            6: {"moving": "Drago altezzoso avrà da pentirsi.", "meaning": "Chi sale troppo in alto deve aspettarsi una caduta."},
        }
    },
    2: {
        "sentence_it": "Il Ricettivo opera sublime riuscita. Propizio per la perseveranza di una cavalla.",
        "sentence_en": "The Receptive brings about sublime success. Perseverance of a mare furthers.",
        "image_it": "Lo stato della terra è l'accogliente dedizione. Così il nobile porta il mondo con ampia virtù.",
        "image_en": "The earth's condition is receptive devotion. Thus the superior man carries the outer world with broad virtue.",
        "trigram_above": "☷",
        "trigram_below": "☷",
        "lines": {
            1: {"moving": "Brina sotto i piedi. Il ghiaccio compatto è vicino.", "meaning": "Primi segni di un cambiamento."},
            2: {"moving": "Diritto, quadrato, grande. Senza scopo, eppure nulla rimane non favorito.", "meaning": "La natura agisce senza intenzione."},
            3: {"moving": "Linee celate. Essere capaci di rimanere perseveranti.", "meaning": "Trattenere i propri talenti."},
            4: {"moving": "Sacco legato. Nessuna macchia, nessuna lode.", "meaning": "Estrema riservatezza."},
            5: {"moving": "Veste gialla reca sublime salute.", "meaning": "Bellezza interiore che traspare."},
            6: {"moving": "Draghi combattono nel prato. Il loro sangue è nero e giallo.", "meaning": "Conflitto tra forze opposte."},
        }
    },
    39: {
        "sentence_it": "L'Impedimento. Propizio è il Sud-Ovest. Non propizio è il Nord-Est. Propizio è vedere il grande uomo. Perseveranza reca salute.",
        "sentence_en": "Obstruction. The southwest furthers. The northeast does not further. It furthers one to see the great man. Perseverance brings good fortune.",
        "image_it": "Acqua sulla montagna: l'immagine dell'Impedimento. Così il nobile volge la sua persona e coltiva la sua virtù.",
        "image_en": "Water on the mountain: the image of Obstruction. Thus the superior man turns his attention to himself and molds his character.",
        "trigram_above": "☵",
        "trigram_below": "☶",
        "lines": {
            1: {"moving": "Andare conduce ad impedimenti, venire incontra lode.", "meaning": "Non è il momento di avanzare; meglio attendere."},
            2: {"moving": "Il servitore del re incontra impedimento su impedimento, ma non per colpa sua.", "meaning": "Gli ostacoli non dipendono da te."},
            3: {"moving": "Andare conduce a impedimenti, perciò egli viene.", "meaning": "Chi sa tornare indietro trova la via."},
            4: {"moving": "Andare conduce a impedimenti, venire conduce all'unione.", "meaning": "Attendendo si troveranno alleati."},
            5: {"moving": "In mezzo ai più grandi impedimenti vengono amici.", "meaning": "Nel momento più difficile arriva l'aiuto."},
            6: {"moving": "Andare conduce ad impedimenti, venire conduce a grande salute.", "meaning": "Il saggio che aiuta appare."},
        }
    },
    55: {
        "sentence_it": "L'Abbondanza ha riuscita. Il re la raggiunge. Non essere triste. Conviene essere come il sole a mezzogiorno.",
        "sentence_en": "Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.",
        "image_it": "Tuono e lampo vengono insieme: l'immagine dell'Abbondanza. Così il nobile decide cause e esegue punizioni.",
        "image_en": "Thunder and lightning come together: the image of Abundance. Thus the superior man decides lawsuits and carries out punishments.",
        "trigram_above": "☳",
        "trigram_below": "☲",
        "lines": {
            1: {"moving": "Incontrando il suo signore come pari. Anche dieci giorni nessuna macchia. Andare trova riconoscimento.", "meaning": "L'incontro tra uguali porta fortuna."},
            2: {"moving": "Il velario è così folto che a mezzogiorno si vedono le stelle polari.", "meaning": "Momento di oscuramento temporaneo."},
            3: {"moving": "Il sottobosco è così folto che a mezzogiorno si vedono le piccole stelle.", "meaning": "L'oscurità aumenta ma non durerà."},
            4: {"moving": "Il velario è così folto che a mezzogiorno si vedono le stelle polari.", "meaning": "Attraverso l'oscurità si intravede la luce."},
            5: {"moving": "Vengono linee. Benedizione e fama si avvicinano. Salute.", "meaning": "L'abbondanza si manifesta pienamente."},
            6: {"moving": "La sua casa è piena d'abbondanza. Egli protegge la sua famiglia. Spiando attraverso il portone non vede nessuno.", "meaning": "L'isolamento nella ricchezza."},
        }
    },
}

# Add more hexagrams with basic structure
for i in range(1, 65):
    if i not in HEXAGRAM_TRADITIONAL:
        HEXAGRAM_TRADITIONAL[i] = {
            "sentence_it": "",
            "sentence_en": "",
            "image_it": "",
            "image_en": "",
            "trigram_above": "",
            "trigram_below": "",
            "lines": {
                1: {"moving": "", "meaning": ""},
                2: {"moving": "", "meaning": ""},
                3: {"moving": "", "meaning": ""},
                4: {"moving": "", "meaning": ""},
                5: {"moving": "", "meaning": ""},
                6: {"moving": "", "meaning": ""},
            }
        }

def get_hexagram_traditional_data(hex_number: int, language: str = "it") -> dict:
    """Get traditional hexagram data"""
    data = HEXAGRAM_TRADITIONAL.get(hex_number, {})
    suffix = "_it" if language == "it" else "_en"
    
    return {
        "sentence": data.get(f"sentence{suffix}", ""),
        "image": data.get(f"image{suffix}", ""),
        "trigram_above": data.get("trigram_above", ""),
        "trigram_below": data.get("trigram_below", ""),
        "lines": data.get("lines", {})
    }

def get_trigram_info(symbol: str, language: str = "it") -> dict:
    """Get trigram information"""
    trigram = TRIGRAMS.get(symbol, {})
    suffix = "_it" if language == "it" else "_en"
    element_key = "element" if language == "it" else "element_en"
    name_key = f"name{suffix}"
    
    return {
        "symbol": symbol,
        "name": trigram.get("name", ""),
        "name_local": trigram.get(name_key, ""),
        "element": trigram.get(element_key, ""),
        "quality": trigram.get("quality", ""),
        "color": trigram.get("color", "#666666")
    }

def get_moving_lines_text(hex_number: int, moving_lines: list, language: str = "it") -> list:
    """Get text for moving lines"""
    data = HEXAGRAM_TRADITIONAL.get(hex_number, {})
    lines_data = data.get("lines", {})
    result = []
    
    for line_num in moving_lines:
        line_info = lines_data.get(line_num, {})
        result.append({
            "position": line_num,
            "text": line_info.get("moving", ""),
            "meaning": line_info.get("meaning", "")
        })
    
    return result
