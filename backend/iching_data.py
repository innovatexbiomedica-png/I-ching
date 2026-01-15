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
    29: {
        "sentence_it": "L'Abissale ripetuto. Se sei verace, hai riuscita nel cuore. Ciò che fai ha riuscita.",
        "sentence_en": "The Abysmal repeated. If you are sincere, you have success in your heart. Whatever you do succeeds.",
        "image_it": "L'acqua scorre ininterrotta e raggiunge la meta. Così il nobile cammina in costante virtù.",
        "image_en": "Water flows on without pause. Thus the superior man walks in lasting virtue.",
        "trigram_above": "☵",
        "trigram_below": "☵",
        "lines": {
            1: {"moving": "Ripetizione dell'Abissale. Nell'abisso si cade in una fossa. Sciagura.", "meaning": "Il pericolo si è fatto abitudine."},
            2: {"moving": "L'abisso ha pericoli. Cercare di ottenere solo piccole cose.", "meaning": "Agire con prudenza in tempi difficili."},
            3: {"moving": "Avanti e indietro, abisso su abisso. In pericolo così grande fermati prima.", "meaning": "Ogni movimento conduce a nuovo pericolo."},
            4: {"moving": "Una brocca di vino, una scodella di riso, vasi di creta. Nessuna macchia.", "meaning": "In tempi difficili la semplicità basta."},
            5: {"moving": "L'abisso non è pieno traboccante. Solo fino all'orlo. Nessuna macchia.", "meaning": "Il pericolo non durerà per sempre."},
            6: {"moving": "Legato con corde e funi, rinchiuso tra muri spinosi. Per tre anni non si trova. Sciagura.", "meaning": "Prigionia fisica o spirituale."},
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
            6: {"moving": "Andare conduce ad impedimenti, venire conduce a grande salute. Propizio è vedere il grande uomo.", "meaning": "Il saggio che aiuta appare."},
        }
    },
    40: {
        "sentence_it": "La Liberazione. Propizio è il Sud-Ovest. Se non vi è più nulla cui andare, il ritorno reca salute.",
        "sentence_en": "Deliverance. The southwest furthers. If there is no longer anything to go to, return brings good fortune.",
        "image_it": "Tuono e pioggia si levano: l'immagine della Liberazione. Così il nobile perdona gli errori e condona le colpe.",
        "image_en": "Thunder and rain set in: the image of Deliverance. Thus the superior man pardons mistakes and forgives misdeeds.",
        "trigram_above": "☳",
        "trigram_below": "☵",
        "lines": {
            1: {"moving": "Senza macchia.", "meaning": "L'inizio della liberazione, nessun errore."},
            2: {"moving": "Nel campo si uccidono tre volpi e si ottiene una freccia gialla. Perseveranza reca salute.", "meaning": "Eliminare le influenze negative porta fortuna."},
            3: {"moving": "Portando sulla schiena e anche viaggiando in carrozza si attirano i briganti. Perseveranza reca umiliazione.", "meaning": "L'ostentazione attira i guai."},
            4: {"moving": "Liberati dal tuo alluce. Allora viene il compagno, e puoi fidarti di lui.", "meaning": "Liberarsi dalle cattive compagnie porta veri amici."},
            5: {"moving": "Il nobile si libera. Salute. Così dimostra agli inferiori di essere sincero.", "meaning": "La liberazione interiore convince gli altri."},
            6: {"moving": "Il principe scocca un falco da un alto muro. Lo cattura. Tutto è propizio.", "meaning": "L'ostacolo finale viene superato con successo."},
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
            2: {"moving": "Il velario è così folto che a mezzogiorno si vedono le stelle polari. Andando si incontra sfiducia e odio. Smuovere con verità reca salute.", "meaning": "Oscuramento temporaneo, la verità prevale."},
            3: {"moving": "Il sottobosco è così folto che a mezzogiorno si vedono le piccole stelle. Egli si rompe il braccio destro. Nessuna macchia.", "meaning": "Impedimento fisico ma non morale."},
            4: {"moving": "Il velario è così folto che a mezzogiorno si vedono le stelle polari. Egli incontra il suo signore di pari rango. Salute.", "meaning": "Attraverso l'oscurità si trova un alleato."},
            5: {"moving": "Vengono linee. Benedizione e fama si avvicinano. Salute.", "meaning": "L'abbondanza si manifesta pienamente."},
            6: {"moving": "La sua casa è piena d'abbondanza. Egli protegge la sua famiglia. Spiando attraverso il portone non vede nessuno. Per tre anni non vede nulla. Sciagura.", "meaning": "L'isolamento nella ricchezza porta sfortuna."},
        }
    },
    63: {
        "sentence_it": "Dopo il Compimento. Riuscita nelle piccole cose. Propizia è perseveranza. All'inizio salute, alla fine disordine.",
        "sentence_en": "After Completion. Success in small matters. Perseverance furthers. At the beginning good fortune, at the end disorder.",
        "image_it": "Acqua sopra il fuoco: l'immagine del Dopo il Compimento. Così il nobile medita sulla sventura e si premunisce.",
        "image_en": "Water over fire: the image of After Completion. Thus the superior man takes thought of misfortune and arms himself against it.",
        "trigram_above": "☵",
        "trigram_below": "☲",
        "lines": {
            1: {"moving": "Egli frena le sue ruote. Si bagna la coda. Nessuna macchia.", "meaning": "Prudenza all'inizio del successo."},
            2: {"moving": "La donna perde la cortina della sua carrozza. Non correrle dietro. Entro sette giorni l'otterrai.", "meaning": "Pazienza nella perdita temporanea."},
            3: {"moving": "L'Alto Antenato punisce il paese dei demoni. Dopo tre anni lo conquista. Non usare gente bassa.", "meaning": "Grandi imprese richiedono tempo e nobiltà."},
            4: {"moving": "Le più belle vesti diventano stracci. Sii cauto tutto il giorno.", "meaning": "Anche nel successo resta vigile."},
            5: {"moving": "Il vicino all'Est che macella un bue non ottiene tanta reale felicità quanto il vicino all'Ovest col suo piccolo sacrificio.", "meaning": "La sincerità vale più della pompa."},
            6: {"moving": "Egli si bagna la testa. Pericolo.", "meaning": "Andare troppo oltre porta pericolo."},
        }
    },
    64: {
        "sentence_it": "Prima del Compimento. Riuscita. Ma se la piccola volpe, quasi compiuto il guado, si bagna la coda, non v'è nulla che sia propizio.",
        "sentence_en": "Before Completion. Success. But if the little fox, after nearly completing the crossing, gets his tail in the water, there is nothing that would further.",
        "image_it": "Fuoco sopra l'acqua: l'immagine del Prima del Compimento. Così il nobile è cauto nel distinguere le cose per metterle al loro posto.",
        "image_en": "Fire over water: the image of Before Completion. Thus the superior man is careful in differentiating things in order to put each in its place.",
        "trigram_above": "☲",
        "trigram_below": "☵",
        "lines": {
            1: {"moving": "Egli si bagna la coda. Umiliante.", "meaning": "Tentativo prematuro porta vergogna."},
            2: {"moving": "Egli frena le sue ruote. Perseveranza reca salute.", "meaning": "Attendere il momento giusto."},
            3: {"moving": "Prima del compimento, attacco reca sciagura. Propizio è attraversare la grande acqua.", "meaning": "Non attaccare, ma avanzare con coraggio."},
            4: {"moving": "Perseveranza reca salute. Il pentimento scompare. Scossa usata per punire il paese dei demoni. Per tre anni grandi regni sono ricompensati.", "meaning": "La determinazione porta grandi risultati."},
            5: {"moving": "Perseveranza reca salute. Nessun pentimento. La luce del nobile è verace. Salute.", "meaning": "La virtù interiore brilla."},
            6: {"moving": "Bere vino in sincerità. Nessuna macchia. Ma se ci si bagna la testa si perde questa verità.", "meaning": "Celebra con moderazione o perderai tutto."},
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
