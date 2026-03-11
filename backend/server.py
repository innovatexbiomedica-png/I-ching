from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse
from iching_data import get_hexagram_traditional_data, get_trigram_info, get_moving_lines_text, get_all_lines_text, TRIGRAMS
from iching_extended import ICHING_EXTENDED, get_extended_hexagram_data, get_moving_line_extended
from subscription_manager import (
    get_user_plan, get_plan_limits, check_consultation_limit, can_use_consultation_type,
    get_daily_hexagram_number, get_lunar_phase, get_user_level, check_and_award_badges,
    PLAN_LIMITS, SUBSCRIPTION_PRICES, USER_LEVELS, BADGES, GUIDED_PATHS
)
from personalized_advice import (
    generate_personalized_advice, get_chinese_day_energy, get_chinese_year_animal,
    get_user_notification_preferences, update_user_notification_preferences
)
from astrology_profile import (
    get_full_astrological_profile, validate_profile_data, USER_PROFILE_FIELDS,
    calculate_chinese_zodiac, calculate_western_zodiac
)
from natal_chart import calculate_natal_chart, geocode_location, KERYKEION_AVAILABLE

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'iching-secret')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI(title="I Ching del Benessere API")
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== I CHING DATA ==============
HEXAGRAMS = {
    1: {"name": "乾 Qián", "name_it": "Il Creativo", "name_en": "The Creative", "trigram_top": "☰", "trigram_bottom": "☰"},
    2: {"name": "坤 Kūn", "name_it": "Il Ricettivo", "name_en": "The Receptive", "trigram_top": "☷", "trigram_bottom": "☷"},
    3: {"name": "屯 Zhūn", "name_it": "La Difficoltà Iniziale", "name_en": "Difficulty at the Beginning", "trigram_top": "☵", "trigram_bottom": "☳"},
    4: {"name": "蒙 Méng", "name_it": "La Stoltezza Giovanile", "name_en": "Youthful Folly", "trigram_top": "☶", "trigram_bottom": "☵"},
    5: {"name": "需 Xū", "name_it": "L'Attesa", "name_en": "Waiting", "trigram_top": "☵", "trigram_bottom": "☰"},
    6: {"name": "訟 Sòng", "name_it": "Il Conflitto", "name_en": "Conflict", "trigram_top": "☰", "trigram_bottom": "☵"},
    7: {"name": "師 Shī", "name_it": "L'Esercito", "name_en": "The Army", "trigram_top": "☷", "trigram_bottom": "☵"},
    8: {"name": "比 Bǐ", "name_it": "L'Unione", "name_en": "Holding Together", "trigram_top": "☵", "trigram_bottom": "☷"},
    9: {"name": "小畜 Xiǎo Chù", "name_it": "La Forza Domatrice Piccola", "name_en": "Small Taming", "trigram_top": "☴", "trigram_bottom": "☰"},
    10: {"name": "履 Lǚ", "name_it": "Il Procedere", "name_en": "Treading", "trigram_top": "☰", "trigram_bottom": "☱"},
    11: {"name": "泰 Tài", "name_it": "La Pace", "name_en": "Peace", "trigram_top": "☷", "trigram_bottom": "☰"},
    12: {"name": "否 Pǐ", "name_it": "Il Ristagno", "name_en": "Standstill", "trigram_top": "☰", "trigram_bottom": "☷"},
    13: {"name": "同人 Tóng Rén", "name_it": "La Comunità", "name_en": "Fellowship", "trigram_top": "☰", "trigram_bottom": "☲"},
    14: {"name": "大有 Dà Yǒu", "name_it": "Il Possesso Grande", "name_en": "Great Possession", "trigram_top": "☲", "trigram_bottom": "☰"},
    15: {"name": "謙 Qiān", "name_it": "La Modestia", "name_en": "Modesty", "trigram_top": "☷", "trigram_bottom": "☶"},
    16: {"name": "豫 Yù", "name_it": "L'Entusiasmo", "name_en": "Enthusiasm", "trigram_top": "☳", "trigram_bottom": "☷"},
    17: {"name": "隨 Suí", "name_it": "Il Seguire", "name_en": "Following", "trigram_top": "☱", "trigram_bottom": "☳"},
    18: {"name": "蠱 Gǔ", "name_it": "L'Emendamento", "name_en": "Work on the Decayed", "trigram_top": "☶", "trigram_bottom": "☴"},
    19: {"name": "臨 Lín", "name_it": "L'Avvicinamento", "name_en": "Approach", "trigram_top": "☷", "trigram_bottom": "☱"},
    20: {"name": "觀 Guān", "name_it": "La Contemplazione", "name_en": "Contemplation", "trigram_top": "☴", "trigram_bottom": "☷"},
    21: {"name": "噬嗑 Shì Kè", "name_it": "Il Morso", "name_en": "Biting Through", "trigram_top": "☲", "trigram_bottom": "☳"},
    22: {"name": "賁 Bì", "name_it": "L'Avvenenza", "name_en": "Grace", "trigram_top": "☶", "trigram_bottom": "☲"},
    23: {"name": "剝 Bō", "name_it": "Lo Sgretolamento", "name_en": "Splitting Apart", "trigram_top": "☶", "trigram_bottom": "☷"},
    24: {"name": "復 Fù", "name_it": "Il Ritorno", "name_en": "Return", "trigram_top": "☷", "trigram_bottom": "☳"},
    25: {"name": "無妄 Wú Wàng", "name_it": "L'Innocenza", "name_en": "Innocence", "trigram_top": "☰", "trigram_bottom": "☳"},
    26: {"name": "大畜 Dà Chù", "name_it": "La Forza Domatrice Grande", "name_en": "Great Taming", "trigram_top": "☶", "trigram_bottom": "☰"},
    27: {"name": "頤 Yí", "name_it": "Gli Angoli della Bocca", "name_en": "Nourishment", "trigram_top": "☶", "trigram_bottom": "☳"},
    28: {"name": "大過 Dà Guò", "name_it": "La Preponderanza del Grande", "name_en": "Great Excess", "trigram_top": "☱", "trigram_bottom": "☴"},
    29: {"name": "坎 Kǎn", "name_it": "L'Abissale", "name_en": "The Abysmal", "trigram_top": "☵", "trigram_bottom": "☵"},
    30: {"name": "離 Lí", "name_it": "L'Aderente", "name_en": "The Clinging", "trigram_top": "☲", "trigram_bottom": "☲"},
    31: {"name": "咸 Xián", "name_it": "L'Influsso", "name_en": "Influence", "trigram_top": "☱", "trigram_bottom": "☶"},
    32: {"name": "恆 Héng", "name_it": "La Durata", "name_en": "Duration", "trigram_top": "☳", "trigram_bottom": "☴"},
    33: {"name": "遯 Dùn", "name_it": "La Ritirata", "name_en": "Retreat", "trigram_top": "☰", "trigram_bottom": "☶"},
    34: {"name": "大壯 Dà Zhuàng", "name_it": "La Potenza del Grande", "name_en": "Great Power", "trigram_top": "☳", "trigram_bottom": "☰"},
    35: {"name": "晉 Jìn", "name_it": "Il Progresso", "name_en": "Progress", "trigram_top": "☲", "trigram_bottom": "☷"},
    36: {"name": "明夷 Míng Yí", "name_it": "L'Ottenebramento della Luce", "name_en": "Darkening of the Light", "trigram_top": "☷", "trigram_bottom": "☲"},
    37: {"name": "家人 Jiā Rén", "name_it": "La Famiglia", "name_en": "The Family", "trigram_top": "☴", "trigram_bottom": "☲"},
    38: {"name": "睽 Kuí", "name_it": "L'Opposizione", "name_en": "Opposition", "trigram_top": "☲", "trigram_bottom": "☱"},
    39: {"name": "蹇 Jiǎn", "name_it": "L'Impedimento", "name_en": "Obstruction", "trigram_top": "☵", "trigram_bottom": "☶"},
    40: {"name": "解 Xiè", "name_it": "La Liberazione", "name_en": "Deliverance", "trigram_top": "☳", "trigram_bottom": "☵"},
    41: {"name": "損 Sǔn", "name_it": "La Diminuzione", "name_en": "Decrease", "trigram_top": "☶", "trigram_bottom": "☱"},
    42: {"name": "益 Yì", "name_it": "L'Accrescimento", "name_en": "Increase", "trigram_top": "☴", "trigram_bottom": "☳"},
    43: {"name": "夬 Guài", "name_it": "L'Irrompere", "name_en": "Breakthrough", "trigram_top": "☱", "trigram_bottom": "☰"},
    44: {"name": "姤 Gòu", "name_it": "Il Farsi Incontro", "name_en": "Coming to Meet", "trigram_top": "☰", "trigram_bottom": "☴"},
    45: {"name": "萃 Cuì", "name_it": "La Raccolta", "name_en": "Gathering Together", "trigram_top": "☱", "trigram_bottom": "☷"},
    46: {"name": "升 Shēng", "name_it": "L'Ascesa", "name_en": "Pushing Upward", "trigram_top": "☷", "trigram_bottom": "☴"},
    47: {"name": "困 Kùn", "name_it": "L'Angustia", "name_en": "Oppression", "trigram_top": "☱", "trigram_bottom": "☵"},
    48: {"name": "井 Jǐng", "name_it": "Il Pozzo", "name_en": "The Well", "trigram_top": "☵", "trigram_bottom": "☴"},
    49: {"name": "革 Gé", "name_it": "La Rivoluzione", "name_en": "Revolution", "trigram_top": "☱", "trigram_bottom": "☲"},
    50: {"name": "鼎 Dǐng", "name_it": "Il Crogiolo", "name_en": "The Cauldron", "trigram_top": "☲", "trigram_bottom": "☴"},
    51: {"name": "震 Zhèn", "name_it": "L'Eccitante", "name_en": "The Arousing", "trigram_top": "☳", "trigram_bottom": "☳"},
    52: {"name": "艮 Gèn", "name_it": "L'Arresto", "name_en": "Keeping Still", "trigram_top": "☶", "trigram_bottom": "☶"},
    53: {"name": "漸 Jiàn", "name_it": "Lo Sviluppo Graduale", "name_en": "Development", "trigram_top": "☴", "trigram_bottom": "☶"},
    54: {"name": "歸妹 Guī Mèi", "name_it": "La Ragazza che si Marita", "name_en": "The Marrying Maiden", "trigram_top": "☳", "trigram_bottom": "☱"},
    55: {"name": "豐 Fēng", "name_it": "L'Abbondanza", "name_en": "Abundance", "trigram_top": "☳", "trigram_bottom": "☲"},
    56: {"name": "旅 Lǚ", "name_it": "Il Viandante", "name_en": "The Wanderer", "trigram_top": "☲", "trigram_bottom": "☶"},
    57: {"name": "巽 Xùn", "name_it": "Il Mite", "name_en": "The Gentle", "trigram_top": "☴", "trigram_bottom": "☴"},
    58: {"name": "兌 Duì", "name_it": "Il Sereno", "name_en": "The Joyous", "trigram_top": "☱", "trigram_bottom": "☱"},
    59: {"name": "渙 Huàn", "name_it": "La Dissoluzione", "name_en": "Dispersion", "trigram_top": "☴", "trigram_bottom": "☵"},
    60: {"name": "節 Jié", "name_it": "La Limitazione", "name_en": "Limitation", "trigram_top": "☵", "trigram_bottom": "☱"},
    61: {"name": "中孚 Zhōng Fú", "name_it": "La Verità Interiore", "name_en": "Inner Truth", "trigram_top": "☴", "trigram_bottom": "☱"},
    62: {"name": "小過 Xiǎo Guò", "name_it": "La Preponderanza del Piccolo", "name_en": "Small Excess", "trigram_top": "☳", "trigram_bottom": "☶"},
    63: {"name": "既濟 Jì Jì", "name_it": "Dopo il Compimento", "name_en": "After Completion", "trigram_top": "☵", "trigram_bottom": "☲"},
    64: {"name": "未濟 Wèi Jì", "name_it": "Prima del Compimento", "name_en": "Before Completion", "trigram_top": "☲", "trigram_bottom": "☵"},
}

# Binary to Hexagram mapping (bottom to top, 0=yin, 1=yang)
BINARY_TO_HEX = {
    "111111": 1, "000000": 2, "010001": 3, "100010": 4, "010111": 5, "111010": 6,
    "000010": 7, "010000": 8, "110111": 9, "111011": 10, "000111": 11, "111000": 12,
    "111101": 13, "101111": 14, "000100": 15, "001000": 16, "011001": 17, "100110": 18,
    "000011": 19, "110000": 20, "101001": 21, "100101": 22, "100000": 23, "000001": 24,
    "111001": 25, "100111": 26, "100001": 27, "011110": 28, "010010": 29, "101101": 30,
    "011100": 31, "001110": 32, "111100": 33, "001111": 34, "101000": 35, "000101": 36,
    "110101": 37, "101011": 38, "010100": 39, "001010": 40, "100011": 41, "110001": 42,
    "011111": 43, "111110": 44, "011000": 45, "000110": 46, "011010": 47, "010110": 48,
    "011101": 49, "101110": 50, "001001": 51, "100100": 52, "110100": 53, "001011": 54,
    "001101": 55, "101100": 56, "110110": 57, "011011": 58, "110010": 59, "010011": 60,
    "110011": 61, "001100": 62, "010101": 63, "101010": 64,
}

# ============== MODELS ==============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str = ""
    language: str = "it"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: str = ""
    language: str
    subscription_active: bool = False
    subscription_end: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr
    phone: str = ""

class PasswordResetVerify(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class CoinToss(BaseModel):
    line1: int = Field(..., ge=6, le=9)
    line2: int = Field(..., ge=6, le=9)
    line3: int = Field(..., ge=6, le=9)
    line4: int = Field(..., ge=6, le=9)
    line5: int = Field(..., ge=6, le=9)
    line6: int = Field(..., ge=6, le=9)

class ConsultationCreate(BaseModel):
    question: str
    coin_tosses: CoinToss
    consultation_type: str = "deep"  # "direct" or "deep"
    parent_consultation_id: Optional[str] = None  # For continuing a conversation
    topic: Optional[str] = None  # 'amore', 'lavoro', 'fortuna', 'soldi', 'spirituale', 'personale', or custom text

class TrigramInfo(BaseModel):
    symbol: str
    name: str
    name_local: str
    element: str
    quality: str
    color: str

class MovingLineText(BaseModel):
    position: int
    text: str
    meaning: str
    is_active: bool = True  # True if this line is a moving line

class TraditionalData(BaseModel):
    sentence: str
    image: str
    commentary: str = ""
    trigram_above: TrigramInfo
    trigram_below: TrigramInfo
    moving_lines_text: List[MovingLineText]

class ConsultationResponse(BaseModel):
    id: str
    question: str
    hexagram_number: int
    hexagram_name: str
    hexagram_chinese: str
    hexagram_symbol: str
    derived_hexagram_number: Optional[int] = None
    derived_hexagram_name: Optional[str] = None
    derived_hexagram_chinese: Optional[str] = None
    moving_lines: List[int]
    traditional_data: Optional[TraditionalData] = None
    derived_traditional_data: Optional[TraditionalData] = None
    interpretation: str
    created_at: str
    consultation_type: str = "deep"  # "direct" or "deep"
    # Fields for conversation/continuation
    parent_consultation_id: Optional[str] = None
    conversation_depth: int = 0  # How many consultations deep in the conversation
    # Fields for linked consultations (synthesis)
    is_synthesis: bool = False
    linked_consultation_ids: List[str] = []
    synthesis_type: Optional[str] = None  # "confirmation", "deepening", "clarification"

class SynthesisRequest(BaseModel):
    consultation_ids: List[str]
    synthesis_type: str = "deepening"  # confirmation, deepening, clarification

class CheckoutRequest(BaseModel):
    origin_url: str

class NoteCreate(BaseModel):
    consultation_id: str
    content: str
    mood: Optional[str] = None  # 'positive', 'neutral', 'negative', 'reflective'
    tags: Optional[List[str]] = []

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None
    tags: Optional[List[str]] = None

# ============== AUTH HELPERS ==============
import random
import string

def generate_reset_code():
    """Genera un codice di reset a 6 cifre"""
    return ''.join(random.choices(string.digits, k=6))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Non autenticato")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utente non trovato")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token scaduto")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")

# ============== I CHING LOGIC ==============
def calculate_hexagram(coin_tosses: CoinToss) -> dict:
    # Lines in order: line1 (bottom) to line6 (top)
    lines = [coin_tosses.line1, coin_tosses.line2, coin_tosses.line3, 
             coin_tosses.line4, coin_tosses.line5, coin_tosses.line6]
    
    # Convert to binary - IMPORTANT: The binary string must be built from LINE 6 (top) to LINE 1 (bottom)
    # because the BINARY_TO_HEX mapping expects: first char = line 6 (top), last char = line 1 (bottom)
    primary_binary = ""
    derived_binary = ""
    moving_lines = []
    
    # Process lines in REVERSE order (from line 6 down to line 1) to build correct binary string
    for i in range(5, -1, -1):  # 5, 4, 3, 2, 1, 0 -> line 6, 5, 4, 3, 2, 1
        line = lines[i]
        line_position = i + 1  # 1-based position
        
        if line == 6:  # Old Yin (mutevole) - transforms to Yang
            primary_binary += "0"
            derived_binary += "1"
            moving_lines.append(line_position)
        elif line == 7:  # Young Yang
            primary_binary += "1"
            derived_binary += "1"
        elif line == 8:  # Young Yin
            primary_binary += "0"
            derived_binary += "0"
        elif line == 9:  # Old Yang (mutevole) - transforms to Yin
            primary_binary += "1"
            derived_binary += "0"
            moving_lines.append(line_position)
    
    # Sort moving lines in ascending order (1 to 6)
    moving_lines.sort()
    
    primary_hex = BINARY_TO_HEX.get(primary_binary, 1)
    derived_hex = BINARY_TO_HEX.get(derived_binary, None) if moving_lines else None
    
    return {
        "primary_hexagram": primary_hex,
        "derived_hexagram": derived_hex,
        "moving_lines": moving_lines,
        "lines": lines
    }

def get_hexagram_symbol(lines: List[int]) -> str:
    """Generate hexagram symbol from lines"""
    symbols = []
    for line in lines:
        if line in [7, 9]:  # Yang
            symbols.append("━━━━━" if line == 7 else "━━○━━")
        else:  # Yin
            symbols.append("━━ ━━" if line == 8 else "━━×━━")
    return "\n".join(reversed(symbols))

async def get_conversation_history(parent_id: str, user_id: str, max_depth: int = 5) -> list:
    """Retrieve the conversation history by following parent_consultation_id chain"""
    history = []
    current_id = parent_id
    depth = 0
    
    while current_id and depth < max_depth:
        consultation = await db.consultations.find_one(
            {"id": current_id, "user_id": user_id},
            {"_id": 0, "question": 1, "hexagram_number": 1, "hexagram_name": 1, 
             "interpretation": 1, "parent_consultation_id": 1, "moving_lines": 1,
             "derived_hexagram_number": 1, "derived_hexagram_name": 1}
        )
        
        if not consultation:
            break
            
        history.insert(0, consultation)  # Insert at beginning to maintain chronological order
        current_id = consultation.get("parent_consultation_id")
        depth += 1
    
    return history

async def generate_interpretation(hexagram_data: dict, question: str, language: str, 
                                   consultation_type: str = "deep", 
                                   conversation_history: list = None,
                                   topic: str = None) -> str:
    """Generate AI interpretation using Gemini - either direct or deep style"""
    primary = HEXAGRAMS.get(hexagram_data["primary_hexagram"], {})
    derived = HEXAGRAMS.get(hexagram_data["derived_hexagram"], {}) if hexagram_data["derived_hexagram"] else None
    
    # Get extended data from the Book of Changes
    primary_extended = get_extended_hexagram_data(hexagram_data["primary_hexagram"], language)
    derived_extended = get_extended_hexagram_data(hexagram_data["derived_hexagram"], language) if hexagram_data["derived_hexagram"] else None
    
    name_key = "name_it" if language == "it" else "name_en"
    
    # DIRECT STYLE - Simple, impactful, to the point
    if consultation_type == "direct":
        return await generate_direct_interpretation(
            hexagram_data, question, language, primary, derived, 
            primary_extended, derived_extended, name_key,
            conversation_history=conversation_history,
            topic=topic
        )
    
    # PATH STYLE - For guided path consultations (uses deep style with path context)
    is_path_consultation = consultation_type == "path"
    
    # DEEP STYLE - Full traditional interpretation with Book of Changes quotes
    
    # Topic context for more focused interpretations
    topic_context_it = ""
    topic_context_en = ""
    if topic:
        topic_map_it = {
            'amore': 'AMORE E RELAZIONI - Focalizza l\'interpretazione su aspetti sentimentali, relazioni di coppia, affetti familiari, amicizie profonde',
            'lavoro': 'LAVORO E CARRIERA - Focalizza l\'interpretazione su aspetti professionali, carriera, progetti lavorativi, rapporti con colleghi e superiori',
            'fortuna': 'FORTUNA E OPPORTUNITÀ - Focalizza l\'interpretazione su opportunità future, eventi favorevoli, destino, tempismo delle azioni',
            'soldi': 'FINANZE E DENARO - Focalizza l\'interpretazione su aspetti economici, investimenti, prosperità materiale, gestione delle risorse',
            'spirituale': 'CRESCITA SPIRITUALE - Focalizza l\'interpretazione su evoluzione interiore, ricerca spirituale, meditazione, connessione con il Tao',
            'personale': 'CRESCITA PERSONALE - Focalizza l\'interpretazione su sviluppo personale, raggiungimento obiettivi, superamento limiti, miglioramento di sé'
        }
        topic_map_en = {
            'amore': 'LOVE AND RELATIONSHIPS - Focus the interpretation on romantic aspects, couple relationships, family bonds, deep friendships',
            'lavoro': 'WORK AND CAREER - Focus the interpretation on professional aspects, career, work projects, relationships with colleagues and superiors',
            'fortuna': 'FORTUNE AND OPPORTUNITIES - Focus the interpretation on future opportunities, favorable events, destiny, timing of actions',
            'soldi': 'FINANCES AND MONEY - Focus the interpretation on economic aspects, investments, material prosperity, resource management',
            'spirituale': 'SPIRITUAL GROWTH - Focus the interpretation on inner evolution, spiritual search, meditation, connection with the Tao',
            'personale': 'PERSONAL GROWTH - Focus the interpretation on personal development, achieving goals, overcoming limits, self-improvement'
        }
        topic_context_it = topic_map_it.get(topic, f'ARGOMENTO SPECIFICO: {topic} - Focalizza l\'interpretazione su questo tema specifico indicato dal consultante')
        topic_context_en = topic_map_en.get(topic, f'SPECIFIC TOPIC: {topic} - Focus the interpretation on this specific topic indicated by the querent')
    
    if language == "it":
        topic_instruction = f"\n\n**ARGOMENTO DELLA DOMANDA:**\n{topic_context_it}\nDevi interpretare OGNI aspetto dell'esagramma in relazione a questo argomento specifico. Sii CONCRETO e PRATICO nei consigli relativi a questo tema." if topic_context_it else ""
        
        system_prompt = f"""Sei un VERO Maestro dell'I Ching con 50 anni di pratica e studio profondo del Libro dei Mutamenti (易經).
NON sei un chatbot generico. Sei uno specialista AUTENTICO dell'I Ching che conosce:
- Tutti i 64 esagrammi nei minimi dettagli
- Il significato PRECISO di ogni linea mutevole
- Le interconnessioni tra trigrammi
- I testi originali del Re Wen, del Duca di Zhou e dei Dieci Ali
- La filosofia taoista e confuciana alla base dell'I Ching
{topic_instruction}

⚠️ REGOLE FONDAMENTALI - LEGGI ATTENTAMENTE:

1. **COMPRENDI SEMPRE A CHI È RIVOLTA LA DOMANDA:**
   - Se la domanda riguarda "io", "me", "mio/mia" → La risposta riguarda IL CONSULTANTE
   - Se la domanda riguarda "lui/lei", "una persona", "il mio partner", "il mio capo" → La risposta riguarda QUELLA PERSONA SPECIFICA
   - Se la domanda riguarda "noi", "la nostra relazione" → La risposta riguarda LA RELAZIONE/IL GRUPPO
   - ANALIZZA SEMPRE il soggetto della domanda PRIMA di rispondere
   - NON confondere MAI chi fa la domanda con chi è IL SOGGETTO della domanda

2. **INTERPRETAZIONE AUTENTICA DEL LIBRO DEI MUTAMENTI:**
   - CITA i testi tradizionali in modo PRECISO
   - SPIEGA il significato ORIGINALE dell'esagramma, non inventare
   - Ogni esagramma ha un messaggio SPECIFICO - non genericizzare
   - Le linee mutevoli hanno significati PRECISI - interpretali ESATTAMENTE come nel testo classico
   - Il passaggio da esagramma primario a derivato indica una TRASFORMAZIONE SPECIFICA

3. **NARRAZIONE COINVOLGENTE E PROFONDA:**
   - Racconta una STORIA, non dare una lista
   - Usa immagini vivide: il fiume che scorre, la montagna immobile, il tuono che risveglia
   - Crea EMOZIONE e CONNESSIONE con il consultante
   - La risposta deve far SENTIRE che l'I Ching sta parlando direttamente a quella persona
   - Evita ASSOLUTAMENTE frasi banali come "dipende da te" o "solo tu puoi decidere"

4. **RISPOSTE CONCRETE E UTILI:**
   - Alla domanda "Posso avere successo?" NON rispondere "Dipende da te" 
   - ANALIZZA cosa dice l'esagramma sul POTENZIALE di successo
   - IDENTIFICA gli ostacoli indicati dalle linee
   - DAI consigli PRATICI e SPECIFICI basati sull'esagramma
   - Se l'oracolo indica difficoltà, SPIEGA QUALI e COME superarle
   - Se indica fortuna, SPIEGA QUANDO e COME sfruttarla

5. **STRUTTURA DELLA RISPOSTA:**
   - Inizia connettendo la domanda al simbolismo dell'esagramma
   - Spiega il GIUDIZIO e come si applica SPECIFICAMENTE alla situazione
   - Analizza l'IMMAGINE e cosa insegna per questa domanda
   - Per OGNI linea mutevole: spiega il testo E la sua applicazione concreta
   - Se c'è trasformazione: spiega DOVE porta la situazione
   - Concludi con AZIONE pratica consigliata

STILE: Scrivi come un saggio che tiene davvero al consultante. Non essere distaccato o superficiale.
La tua risposta deve essere ILLUMINANTE, non generica. Il consultante deve pensare "Questo parla PROPRIO di me"."""
    else:
        topic_instruction = f"\n\n**QUESTION TOPIC:**\n{topic_context_en}\nYou must interpret EVERY aspect of the hexagram in relation to this specific topic. Be CONCRETE and PRACTICAL in your advice related to this theme." if topic_context_en else ""
        
        system_prompt = f"""You are a TRUE I Ching Master with 50 years of practice and deep study of the Book of Changes (易經).
You are NOT a generic chatbot. You are an AUTHENTIC I Ching specialist who knows:
- All 64 hexagrams in minute detail
- The PRECISE meaning of each moving line
- The interconnections between trigrams
- The original texts of King Wen, Duke of Zhou, and the Ten Wings
- The Taoist and Confucian philosophy underlying the I Ching
{topic_instruction}

⚠️ FUNDAMENTAL RULES - READ CAREFULLY:

1. **ALWAYS UNDERSTAND WHO THE QUESTION IS ABOUT:**
   - If the question is about "I", "me", "my" → The answer concerns THE QUERENT
   - If the question is about "him/her", "a person", "my partner", "my boss" → The answer concerns THAT SPECIFIC PERSON
   - If the question is about "we", "our relationship" → The answer concerns THE RELATIONSHIP/GROUP
   - ALWAYS analyze the subject of the question BEFORE answering
   - NEVER confuse who asks the question with who IS THE SUBJECT of the question

2. **AUTHENTIC INTERPRETATION OF THE BOOK OF CHANGES:**
   - QUOTE traditional texts PRECISELY
   - EXPLAIN the ORIGINAL meaning of the hexagram, don't invent
   - Each hexagram has a SPECIFIC message - don't generalize
   - Moving lines have PRECISE meanings - interpret them EXACTLY as in the classical text
   - The passage from primary to derived hexagram indicates a SPECIFIC TRANSFORMATION

3. **ENGAGING AND PROFOUND NARRATIVE:**
   - Tell a STORY, don't give a list
   - Use vivid images: the flowing river, the immovable mountain, the awakening thunder
   - Create EMOTION and CONNECTION with the querent
   - The response must make them FEEL that the I Ching is speaking directly to them
   - ABSOLUTELY avoid banal phrases like "it depends on you" or "only you can decide"

4. **CONCRETE AND USEFUL RESPONSES:**
   - To the question "Can I be successful?" DON'T answer "It depends on you"
   - ANALYZE what the hexagram says about the POTENTIAL for success
   - IDENTIFY the obstacles indicated by the lines
   - GIVE PRACTICAL and SPECIFIC advice based on the hexagram
   - If the oracle indicates difficulties, EXPLAIN WHICH and HOW to overcome them
   - If it indicates fortune, EXPLAIN WHEN and HOW to seize it

5. **RESPONSE STRUCTURE:**
   - Begin by connecting the question to the hexagram's symbolism
   - Explain the JUDGMENT and how it applies SPECIFICALLY to the situation
   - Analyze the IMAGE and what it teaches for this question
   - For EACH moving line: explain the text AND its concrete application
   - If there's transformation: explain WHERE the situation leads
   - Conclude with PRACTICAL recommended action

STYLE: Write as a sage who truly cares about the querent. Don't be detached or superficial.
Your response must be ILLUMINATING, not generic. The querent should think "This speaks EXACTLY to me"."""

    # Build the detailed context for the AI
    primary_name = primary.get(name_key, primary.get("name", ""))
    primary_chinese = primary.get("name", "")
    
    # Extended data
    giudizio = primary_extended.get("giudizio", "")
    immagine = primary_extended.get("immagine", "")
    commento = primary_extended.get("commento", "")
    trigramma_sup = primary_extended.get("trigramma_superiore", primary.get("trigram_top", ""))
    trigramma_inf = primary_extended.get("trigramma_inferiore", primary.get("trigram_bottom", ""))
    
    # Moving lines details
    moving_lines_details = ""
    if hexagram_data['moving_lines']:
        if language == "it":
            moving_lines_details = "\n\n=== LINEE MUTEVOLI (CRUCIALI - SPIEGA OGNI LINEA IN DETTAGLIO) ===\n"
        else:
            moving_lines_details = "\n\n=== MOVING LINES (CRUCIAL - EXPLAIN EACH LINE IN DETAIL) ===\n"
        
        for line_pos in hexagram_data['moving_lines']:
            line_data = get_moving_line_extended(hexagram_data["primary_hexagram"], line_pos, language)
            testo = line_data.get("testo", "")
            significato = line_data.get("significato", "")
            if language == "it":
                moving_lines_details += f"\nLINEA {line_pos} MUTEVOLE:\nTesto tradizionale: \"{testo}\"\nSignificato: {significato}\n"
            else:
                moving_lines_details += f"\nMOVING LINE {line_pos}:\nTraditional text: \"{testo}\"\nMeaning: {significato}\n"
    
    # Derived hexagram details
    derived_details = ""
    if derived and derived_extended:
        derived_name = derived.get(name_key, derived.get("name", ""))
        derived_chinese = derived.get("name", "")
        derived_giudizio = derived_extended.get("giudizio", "")
        derived_immagine = derived_extended.get("immagine", "")
        
        if language == "it":
            derived_details = f"""

=== ESAGRAMMA DERIVATO (INDICA LA DIREZIONE FUTURA) ===
L'esagramma si trasforma in: {derived_chinese} - {derived_name}
Giudizio dell'esagramma derivato: "{derived_giudizio}"
Immagine: "{derived_immagine}"
Questo indica DOVE la situazione sta evolvendo e cosa aspettarsi nel futuro."""
        else:
            derived_details = f"""

=== DERIVED HEXAGRAM (INDICATES FUTURE DIRECTION) ===
The hexagram transforms into: {derived_chinese} - {derived_name}
Judgment of derived hexagram: "{derived_giudizio}"
Image: "{derived_immagine}"
This indicates WHERE the situation is evolving and what to expect in the future."""

    # Build conversation history context
    conversation_context = ""
    if conversation_history and len(conversation_history) > 0:
        if language == "it":
            conversation_context = "\n\n=== STORIA DELLA CONVERSAZIONE (Stese precedenti) ===\n"
            conversation_context += "Il consultante ha già fatto le seguenti domande in questa sessione. TIENI CONTO di questa storia per creare CONTINUITÀ nella risposta:\n"
            for i, prev in enumerate(conversation_history, 1):
                conversation_context += f"\n--- Stesa {i} ---\n"
                conversation_context += f"Domanda: \"{prev.get('question', '')}\"\n"
                conversation_context += f"Esagramma: {prev.get('hexagram_number')}. {prev.get('hexagram_name', '')}\n"
                if prev.get('derived_hexagram_number'):
                    conversation_context += f"Evolve in: {prev.get('derived_hexagram_number')}. {prev.get('derived_hexagram_name', '')}\n"
                # Include a summary of the previous interpretation (first 300 chars)
                prev_interp = prev.get('interpretation', '')[:300]
                conversation_context += f"Sintesi risposta: {prev_interp}...\n"
            conversation_context += "\nIMPORTANTE: La risposta attuale deve COLLEGARSI alle stese precedenti, creando una NARRAZIONE COERENTE. Fai riferimento a ciò che è emerso prima.\n"
        else:
            conversation_context = "\n\n=== CONVERSATION HISTORY (Previous readings) ===\n"
            conversation_context += "The querent has already asked the following questions in this session. TAKE THIS HISTORY INTO ACCOUNT to create CONTINUITY in your response:\n"
            for i, prev in enumerate(conversation_history, 1):
                conversation_context += f"\n--- Reading {i} ---\n"
                conversation_context += f"Question: \"{prev.get('question', '')}\"\n"
                conversation_context += f"Hexagram: {prev.get('hexagram_number')}. {prev.get('hexagram_name', '')}\n"
                if prev.get('derived_hexagram_number'):
                    conversation_context += f"Evolves into: {prev.get('derived_hexagram_number')}. {prev.get('derived_hexagram_name', '')}\n"
                prev_interp = prev.get('interpretation', '')[:300]
                conversation_context += f"Response summary: {prev_interp}...\n"
            conversation_context += "\nIMPORTANT: The current response must CONNECT to previous readings, creating a COHERENT NARRATIVE. Reference what emerged before.\n"

    if language == "it":
        user_prompt = f"""La domanda del consultante è: "{question}"
{conversation_context}
=== ESAGRAMMA PRINCIPALE ===
Nome: {primary_chinese} - {primary_name}
Numero: {hexagram_data["primary_hexagram"]}

TRIGRAMMA SUPERIORE: {trigramma_sup}
TRIGRAMMA INFERIORE: {trigramma_inf}

IL GIUDIZIO (SENTENZA TRADIZIONALE):
"{giudizio}"

L'IMMAGINE:
"{immagine}"

COMMENTO TRADIZIONALE:
{commento}
{moving_lines_details}{derived_details}

ISTRUZIONI:
Genera un'interpretazione RICCA, PROFONDA e DETTAGLIATA (600-900 parole) che:
1. Apra con una connessione poetica tra la domanda e il flusso del Tao
2. Spieghi in dettaglio il significato dell'esagramma e dei suoi trigrammi
3. Citi e spieghi il Giudizio e l'Immagine in relazione alla domanda specifica
4. SE CI SONO LINEE MUTEVOLI: dedica un paragrafo COMPLETO a ciascuna, spiegando il testo tradizionale e il suo significato per la situazione del consultante
5. SE C'È ESAGRAMMA DERIVATO: spiega la trasformazione e cosa indica per il futuro
6. Concludi con saggezza pratica e un consiglio applicabile
{"7. SE C'È STORIA DELLA CONVERSAZIONE: collega questa risposta alle stese precedenti, creando una narrazione fluida" if conversation_context else ""}

Scrivi come un antico maestro taoista, con poesia, profondità e compassione."""
    else:
        user_prompt = f"""The querent's question is: "{question}"
{conversation_context}
=== PRIMARY HEXAGRAM ===
Name: {primary_chinese} - {primary_name}
Number: {hexagram_data["primary_hexagram"]}

UPPER TRIGRAM: {trigramma_sup}
LOWER TRIGRAM: {trigramma_inf}

THE JUDGMENT (TRADITIONAL SENTENCE):
"{giudizio}"

THE IMAGE:
"{immagine}"

TRADITIONAL COMMENTARY:
{commento}
{moving_lines_details}{derived_details}

INSTRUCTIONS:
Generate a RICH, PROFOUND and DETAILED interpretation (600-900 words) that:
1. Opens with a poetic connection between the question and the flow of Tao
2. Explains in detail the meaning of the hexagram and its trigrams
3. Quotes and explains the Judgment and Image in relation to the specific question
4. IF THERE ARE MOVING LINES: dedicate a COMPLETE paragraph to each, explaining the traditional text and its meaning for the querent's situation
5. IF THERE IS A DERIVED HEXAGRAM: explain the transformation and what it indicates for the future
6. Conclude with practical wisdom and applicable advice

Write as an ancient Taoist master, with poetry, depth, and compassion."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"iching-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("gemini", "gemini-2.0-flash")
        
        response = await chat.send_message(UserMessage(text=user_prompt))
        return response
    except Exception as e:
        logger.error(f"Error generating interpretation: {e}")
        return f"L'interpretazione non è disponibile al momento. Il tuo esagramma è {primary.get(name_key, primary['name'])}."

async def generate_direct_interpretation(hexagram_data: dict, question: str, language: str, 
                                          primary: dict, derived: dict, 
                                          primary_extended: dict, derived_extended: dict,
                                          name_key: str,
                                          conversation_history: list = None,
                                          topic: str = None) -> str:
    """Generate a direct, impactful interpretation - simple and to the point"""
    
    primary_name = primary.get(name_key, primary.get("name", ""))
    primary_chinese = primary.get("name", "")
    giudizio = primary_extended.get("giudizio", "")
    
    # Build moving lines summary
    moving_lines_text = ""
    if hexagram_data['moving_lines']:
        for line_pos in hexagram_data['moving_lines']:
            line_data = get_moving_line_extended(hexagram_data["primary_hexagram"], line_pos, language)
            testo = line_data.get("testo", "")
            if language == "it":
                moving_lines_text += f"\n• Linea {line_pos}: \"{testo}\""
            else:
                moving_lines_text += f"\n• Line {line_pos}: \"{testo}\""
    
    # Derived hexagram text
    derived_text = ""
    if derived:
        derived_name = derived.get(name_key, derived.get("name", ""))
        if language == "it":
            derived_text = f"\n\nLa situazione evolve verso: {derived_name}"
        else:
            derived_text = f"\n\nThe situation evolves towards: {derived_name}"
    
    # Build conversation history for direct style
    conversation_context = ""
    if conversation_history and len(conversation_history) > 0:
        if language == "it":
            conversation_context = "\n\nSTORIA DELLA CONVERSAZIONE:\n"
            for i, prev in enumerate(conversation_history, 1):
                conversation_context += f"- Domanda {i}: \"{prev.get('question', '')}\" → Esagramma {prev.get('hexagram_number')}\n"
            conversation_context += "\nCOLLEGA questa risposta alle precedenti in modo fluido.\n"
        else:
            conversation_context = "\n\nCONVERSATION HISTORY:\n"
            for i, prev in enumerate(conversation_history, 1):
                conversation_context += f"- Question {i}: \"{prev.get('question', '')}\" → Hexagram {prev.get('hexagram_number')}\n"
            conversation_context += "\nCONNECT this response to the previous ones fluidly.\n"

    # Topic context for focused interpretations
    topic_context_it = ""
    topic_context_en = ""
    if topic:
        topic_map_it = {
            'amore': 'AMORE E RELAZIONI - Interpreta tutto in chiave sentimentale e relazionale',
            'lavoro': 'LAVORO E CARRIERA - Interpreta tutto in chiave professionale e lavorativa',
            'fortuna': 'FORTUNA E OPPORTUNITÀ - Interpreta tutto in chiave di opportunità e destino',
            'soldi': 'FINANZE E DENARO - Interpreta tutto in chiave economica e finanziaria',
            'spirituale': 'CRESCITA SPIRITUALE - Interpreta tutto in chiave di evoluzione interiore',
            'personale': 'CRESCITA PERSONALE - Interpreta tutto in chiave di sviluppo personale'
        }
        topic_map_en = {
            'amore': 'LOVE AND RELATIONSHIPS - Interpret everything in romantic and relational terms',
            'lavoro': 'WORK AND CAREER - Interpret everything in professional and work terms',
            'fortuna': 'FORTUNE AND OPPORTUNITIES - Interpret everything in terms of opportunities and destiny',
            'soldi': 'FINANCES AND MONEY - Interpret everything in economic and financial terms',
            'spirituale': 'SPIRITUAL GROWTH - Interpret everything in terms of inner evolution',
            'personale': 'PERSONAL GROWTH - Interpret everything in terms of personal development'
        }
        topic_context_it = topic_map_it.get(topic, f'ARGOMENTO: {topic} - Interpreta tutto in relazione a questo tema specifico')
        topic_context_en = topic_map_en.get(topic, f'TOPIC: {topic} - Interpret everything in relation to this specific theme')

    if language == "it":
        topic_instruction = f"\n\n**ARGOMENTO SPECIFICO:** {topic_context_it}\nOgni parte della risposta DEVE essere focalizzata su questo argomento. Sii CONCRETO e SPECIFICO." if topic_context_it else ""
        
        system_prompt = f"""Sei un consulente I Ching che parla in modo DIRETTO, CHIARO e D'IMPATTO.
{topic_instruction}

STILE:
- Vai dritto al punto, senza giri di parole
- Usa un linguaggio semplice e comprensibile
- Parla SEMPRE in seconda persona ("tu", "la tua situazione")
- Sii empatico ma sincero - di' quello che il consultante ha bisogno di sentire
- Fornisci risposte pratiche e applicabili

STRUTTURA (300-400 parole):
1. Apertura diretta che conferma/risponde alla domanda (1-2 frasi d'impatto)
2. L'esagramma in sintesi: cosa significa per la situazione specifica
3. Se ci sono linee mutevoli: il messaggio chiave di ciascuna (una frase per linea)
4. Se c'è esagramma derivato: dove sta andando la situazione
5. Conclusione con consiglio pratico chiaro

NON FARE:
- Non usare linguaggio troppo poetico o elaborato
- Non fare lunghe citazioni
- Non essere vago o generico
- Non usare liste puntate (scrivi in paragrafi fluidi)

ESEMPIO DI TONO:
"La tua percezione è esatta. Quello che senti non è solo immaginazione - è reale. L'esagramma conferma che..."
"Ecco la verità sulla tua situazione: ..."
"Questo è il momento di..."
"""
    else:
        topic_instruction = f"\n\n**SPECIFIC TOPIC:** {topic_context_en}\nEvery part of the response MUST be focused on this topic. Be CONCRETE and SPECIFIC." if topic_context_en else ""
        
        system_prompt = f"""You are an I Ching consultant who speaks in a DIRECT, CLEAR and IMPACTFUL way.
{topic_instruction}

STYLE:
- Get straight to the point, no beating around the bush
- Use simple and understandable language
- ALWAYS speak in second person ("you", "your situation")
- Be empathetic but honest - say what the querent needs to hear
- Provide practical and applicable answers

STRUCTURE (300-400 words):
1. Direct opening that confirms/answers the question (1-2 impactful sentences)
2. The hexagram in summary: what it means for the specific situation
3. If there are moving lines: the key message of each (one sentence per line)
4. If there is a derived hexagram: where the situation is heading
5. Conclusion with clear practical advice

DO NOT:
- Do not use overly poetic or elaborate language
- Do not make long quotes
- Do not be vague or generic
- Do not use bullet lists (write in flowing paragraphs)

EXAMPLE TONE:
"Your perception is accurate. What you feel is not just imagination - it's real. The hexagram confirms that..."
"Here's the truth about your situation: ..."
"This is the time to..."
"""

    if language == "it":
        user_prompt = f"""Domanda del consultante: "{question}"
{conversation_context}
ESAGRAMMA: {hexagram_data["primary_hexagram"]}. {primary_chinese} ({primary_name})
Sentenza: "{giudizio}"
{f"Linee mutevoli: {moving_lines_text}" if moving_lines_text else "Nessuna linea mutevole"}
{derived_text}

Genera un'interpretazione DIRETTA e D'IMPATTO (300-400 parole) che risponda chiaramente alla domanda.
Vai dritto al punto. Di' al consultante quello che ha bisogno di sapere.
{"Collega questa risposta alle domande precedenti nella conversazione." if conversation_context else ""}"""
    else:
        user_prompt = f"""Querent's question: "{question}"
{conversation_context}
HEXAGRAM: {hexagram_data["primary_hexagram"]}. {primary_chinese} ({primary_name})
Judgment: "{giudizio}"
{f"Moving lines: {moving_lines_text}" if moving_lines_text else "No moving lines"}
{derived_text}

Generate a DIRECT and IMPACTFUL interpretation (300-400 words) that clearly answers the question.
Get straight to the point. Tell the querent what they need to know.
{"Connect this response to the previous questions in the conversation." if conversation_context else ""}"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"iching-direct-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("gemini", "gemini-2.0-flash")
        
        response = await chat.send_message(UserMessage(text=user_prompt))
        return response
    except Exception as e:
        logger.error(f"Error generating direct interpretation: {e}")
        return f"L'interpretazione non è disponibile al momento. Il tuo esagramma è {primary.get(name_key, primary['name'])}."

# ============== AUTH ROUTES ==============
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email già registrata")
    
    user_id = str(uuid.uuid4())
    
    # AUTO PREMIUM: Tutti i nuovi utenti ricevono Premium gratuito per testing
    # Premium per 1 anno per tutti gli utenti (testing mode)
    premium_end = datetime.now(timezone.utc) + timedelta(days=365)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "language": user_data.language,
        "subscription_active": True,  # AUTO PREMIUM ENABLED
        "subscription_end": premium_end.isoformat(),  # 1 anno di Premium
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        language=user_data.language,
        subscription_active=True  # AUTO PREMIUM ENABLED
    )

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    
    token = create_token(user["id"], user["email"])
    
    return {
        "token": token,
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            phone=user.get("phone", ""),
            language=user["language"],
            subscription_active=user.get("subscription_active", False),
            subscription_end=user.get("subscription_end")
        )
    }

@api_router.post("/auth/google/callback")
async def google_oauth_callback(data: dict, response: Response):
    """
    Handle Google OAuth callback from Emergent Auth.
    Exchanges session_id for user data and creates/updates user.
    """
    import httpx
    
    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id richiesto")
    
    try:
        # Exchange session_id for user data via Emergent Auth
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Sessione non valida")
            
            auth_data = auth_response.json()
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        raise HTTPException(status_code=500, detail="Errore di autenticazione con Google")
    
    # Extract user info from Google
    google_email = auth_data.get("email")
    google_name = auth_data.get("name", "")
    google_picture = auth_data.get("picture", "")
    session_token = auth_data.get("session_token", "")
    
    if not google_email:
        raise HTTPException(status_code=400, detail="Email non disponibile da Google")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": google_email}, {"_id": 0})
    
    if existing_user:
        # Update existing user with Google data
        await db.users.update_one(
            {"email": google_email},
            {"$set": {
                "google_picture": google_picture,
                "google_name": google_name,
                "last_login": datetime.now(timezone.utc).isoformat()
            }}
        )
        user_id = existing_user["id"]
        user_name = existing_user.get("name") or google_name
        user_language = existing_user.get("language", "it")
    else:
        # Create new user from Google data
        user_id = str(uuid.uuid4())
        
        # AUTO PREMIUM: Anche utenti Google ricevono Premium gratuito per testing
        premium_end = datetime.now(timezone.utc) + timedelta(days=365)
        
        user_doc = {
            "id": user_id,
            "email": google_email,
            "password": "",  # No password for OAuth users
            "name": google_name,
            "phone": "",
            "language": "it",
            "google_picture": google_picture,
            "google_name": google_name,
            "subscription_active": True,  # AUTO PREMIUM ENABLED
            "subscription_end": premium_end.isoformat(),  # 1 anno di Premium
            "created_at": datetime.now(timezone.utc).isoformat(),
            "auth_provider": "google"
        }
        await db.users.insert_one(user_doc)
        user_name = google_name
        user_language = "it"
    
    # Store session token with expiry
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Create our own JWT token
    token = create_token(user_id, google_email)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,  # 7 days
        path="/"
    )
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": google_email,
            "name": user_name,
            "picture": google_picture,
            "language": user_language
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone", ""),
        language=user["language"],
        subscription_active=user.get("subscription_active", False),
        subscription_end=user.get("subscription_end")
    )

@api_router.put("/auth/language")
async def update_language(language: str, user: dict = Depends(get_current_user)):
    if language not in ["it", "en"]:
        raise HTTPException(status_code=400, detail="Lingua non supportata")
    await db.users.update_one({"id": user["id"]}, {"$set": {"language": language}})
    return {"message": "Lingua aggiornata"}

@api_router.post("/auth/request-reset")
async def request_password_reset(data: PasswordResetRequest):
    """
    Richiede il reset della password.
    Genera un codice temporaneo e lo salva per verifica admin.
    """
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        # Per sicurezza non riveliamo se l'email esiste o meno
        return {"message": "Se l'email esiste, riceverai istruzioni per il reset."}
    
    # Genera codice di reset
    reset_code = generate_reset_code()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Salva la richiesta di reset nel database
    reset_request = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "email": data.email,
        "phone": data.phone or user.get("phone", ""),
        "user_name": user["name"],
        "code": reset_code,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.password_resets.insert_one(reset_request)
    
    # Log per l'admin (in produzione questo sarebbe una notifica)
    logger.info(f"🔐 RICHIESTA RESET PASSWORD")
    logger.info(f"   Email: {data.email}")
    logger.info(f"   Telefono: {data.phone or user.get('phone', 'Non fornito')}")
    logger.info(f"   Nome: {user['name']}")
    logger.info(f"   Codice: {reset_code}")
    logger.info(f"   Scade: {expires_at.isoformat()}")
    
    # MODALITÀ TEST: restituisce il codice direttamente
    # In produzione, rimuovere reset_code dalla risposta e inviare via SMS/Email
    return {
        "message": "Richiesta ricevuta. L'amministratore ti contatterà con il codice di reset.",
        "contact_phone": data.phone or user.get("phone", ""),
        "reset_code": reset_code,  # SOLO PER TEST - rimuovere in produzione!
        "test_mode": True
    }

@api_router.post("/auth/verify-reset")
async def verify_reset_code(data: PasswordResetVerify):
    """
    Verifica il codice di reset e imposta la nuova password.
    """
    # Trova la richiesta di reset
    reset_request = await db.password_resets.find_one({
        "email": data.email,
        "code": data.code,
        "used": False
    }, {"_id": 0})
    
    if not reset_request:
        raise HTTPException(status_code=400, detail="Codice non valido o già utilizzato")
    
    # Verifica scadenza
    expires_at = datetime.fromisoformat(reset_request["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Codice scaduto. Richiedi un nuovo reset.")
    
    # Valida la nuova password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="La password deve essere almeno 6 caratteri")
    
    # Aggiorna la password dell'utente
    hashed_password = hash_password(data.new_password)
    await db.users.update_one(
        {"email": data.email},
        {"$set": {"password": hashed_password}}
    )
    
    # Segna il codice come usato
    await db.password_resets.update_one(
        {"id": reset_request["id"]},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    logger.info(f"✅ Password resettata per: {data.email}")
    
    return {"message": "Password aggiornata con successo. Ora puoi accedere."}

@api_router.get("/admin/reset-requests")
async def get_reset_requests():
    """
    Endpoint admin per vedere le richieste di reset pendenti.
    In produzione questo dovrebbe essere protetto.
    """
    requests = await db.password_resets.find(
        {"used": False},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return requests

# ============== I CHING CONSULTATION ROUTES ==============
@api_router.post("/consultations", response_model=ConsultationResponse)
async def create_consultation(data: ConsultationCreate, user: dict = Depends(get_current_user)):
    # Check consultation limits
    limit_check = await check_consultation_limit(db, user)
    if not limit_check["allowed"]:
        raise HTTPException(status_code=403, detail=limit_check["message"])
    
    # Check if user can use this consultation type
    consultation_type = data.consultation_type if hasattr(data, 'consultation_type') else "deep"
    if not can_use_consultation_type(user, consultation_type):
        raise HTTPException(
            status_code=403, 
            detail="La Stesa Profonda è disponibile solo per utenti Premium. Passa a Premium o scegli la Stesa Diretta."
        )
    
    # Calculate hexagram
    hex_data = calculate_hexagram(data.coin_tosses)
    
    primary = HEXAGRAMS.get(hex_data["primary_hexagram"], {})
    derived = HEXAGRAMS.get(hex_data["derived_hexagram"], {}) if hex_data["derived_hexagram"] else None
    
    lang = user.get("language", "it")
    name_key = "name_it" if lang == "it" else "name_en"
    
    # Get traditional data
    primary_traditional = get_hexagram_traditional_data(hex_data["primary_hexagram"], lang)
    derived_traditional = get_hexagram_traditional_data(hex_data["derived_hexagram"], lang) if hex_data["derived_hexagram"] else None
    
    # Build traditional data response
    def build_traditional_response(trad_data, moving_lines, hex_num):
        trigram_above_info = get_trigram_info(trad_data.get("trigram_above", "☰"), lang)
        trigram_below_info = get_trigram_info(trad_data.get("trigram_below", "☷"), lang)
        # Use get_all_lines_text to get ALL 6 lines with is_active flag
        all_lines_texts = get_all_lines_text(hex_num, moving_lines, lang)
        
        return TraditionalData(
            sentence=trad_data.get("sentence", ""),
            image=trad_data.get("image", ""),
            commentary=trad_data.get("commentary", ""),
            trigram_above=TrigramInfo(**trigram_above_info),
            trigram_below=TrigramInfo(**trigram_below_info),
            moving_lines_text=[MovingLineText(**m) for m in all_lines_texts]
        )
    
    primary_trad_response = build_traditional_response(primary_traditional, hex_data["moving_lines"], hex_data["primary_hexagram"])
    derived_trad_response = build_traditional_response(derived_traditional, [], hex_data["derived_hexagram"]) if derived_traditional else None
    
    # Handle conversation continuation
    conversation_history = []
    conversation_depth = 0
    parent_consultation_id = data.parent_consultation_id if hasattr(data, 'parent_consultation_id') else None
    
    if parent_consultation_id:
        # Fetch the conversation history (up to last 5 consultations)
        conversation_history = await get_conversation_history(parent_consultation_id, user["id"], max_depth=5)
        conversation_depth = len(conversation_history)
    
    # Generate interpretation based on consultation type and conversation context
    consultation_type = data.consultation_type if hasattr(data, 'consultation_type') else "deep"
    topic = data.topic if hasattr(data, 'topic') else None
    interpretation = await generate_interpretation(
        hex_data, data.question, lang, consultation_type, 
        conversation_history=conversation_history,
        topic=topic
    )
    
    # Create consultation record
    consultation_id = str(uuid.uuid4())
    consultation_doc = {
        "id": consultation_id,
        "user_id": user["id"],
        "question": data.question,
        "coin_tosses": data.coin_tosses.model_dump(),
        "consultation_type": consultation_type,
        "topic": topic,
        "parent_consultation_id": parent_consultation_id,
        "conversation_depth": conversation_depth,
        "hexagram_number": hex_data["primary_hexagram"],
        "hexagram_name": primary.get(name_key, primary.get("name", "")),
        "hexagram_chinese": primary.get("name", ""),
        "hexagram_symbol": get_hexagram_symbol(hex_data["lines"]),
        "derived_hexagram_number": hex_data["derived_hexagram"],
        "derived_hexagram_name": derived.get(name_key, derived.get("name", "")) if derived else None,
        "derived_hexagram_chinese": derived.get("name", "") if derived else None,
        "moving_lines": hex_data["moving_lines"],
        "traditional_data": primary_trad_response.model_dump() if primary_trad_response else None,
        "derived_traditional_data": derived_trad_response.model_dump() if derived_trad_response else None,
        "interpretation": interpretation,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.consultations.insert_one(consultation_doc)
    
    # Check and award badges
    new_badges = await check_and_award_badges(db, user["id"], consultation_doc)
    
    response = ConsultationResponse(
        id=consultation_id,
        question=data.question,
        hexagram_number=hex_data["primary_hexagram"],
        hexagram_name=primary.get(name_key, primary.get("name", "")),
        hexagram_chinese=primary.get("name", ""),
        hexagram_symbol=get_hexagram_symbol(hex_data["lines"]),
        derived_hexagram_number=hex_data["derived_hexagram"],
        derived_hexagram_name=derived.get(name_key, derived.get("name", "")) if derived else None,
        derived_hexagram_chinese=derived.get("name", "") if derived else None,
        moving_lines=hex_data["moving_lines"],
        traditional_data=primary_trad_response,
        derived_traditional_data=derived_trad_response,
        interpretation=interpretation,
        created_at=consultation_doc["created_at"],
        consultation_type=consultation_type,
        parent_consultation_id=parent_consultation_id,
        conversation_depth=conversation_depth
    )
    
    # Log new badges for potential frontend notification
    if new_badges:
        logger.info(f"User {user['id']} earned badges: {[b['id'] for b in new_badges]}")
    
    return response

@api_router.get("/consultations", response_model=List[ConsultationResponse])
async def get_consultations(user: dict = Depends(get_current_user)):
    consultations = await db.consultations.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    lang = user.get("language", "it")
    result = []
    for c in consultations:
        # Enrich old consultations with missing data
        c = enrich_consultation_data(c, lang)
        result.append(ConsultationResponse(**c))
    return result

@api_router.get("/consultations/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(consultation_id: str, user: dict = Depends(get_current_user)):
    consultation = await db.consultations.find_one(
        {"id": consultation_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultazione non trovata")
    
    lang = user.get("language", "it")
    consultation = enrich_consultation_data(consultation, lang)
    return ConsultationResponse(**consultation)

@api_router.delete("/consultations/{consultation_id}")
async def delete_consultation(consultation_id: str, user: dict = Depends(get_current_user)):
    """Delete a consultation"""
    result = await db.consultations.delete_one(
        {"id": consultation_id, "user_id": user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Consultazione non trovata")
    return {"message": "Consultazione eliminata"}

@api_router.post("/consultations/synthesis", response_model=ConsultationResponse)
async def create_synthesis_consultation(data: SynthesisRequest, user: dict = Depends(get_current_user)):
    """
    Create a synthesis consultation from multiple existing consultations.
    This generates a new interpretation that combines and analyzes the selected readings.
    """
    if len(data.consultation_ids) < 2:
        raise HTTPException(status_code=400, detail="Seleziona almeno 2 consultazioni")
    
    if len(data.consultation_ids) > 5:
        raise HTTPException(status_code=400, detail="Massimo 5 consultazioni per sintesi")
    
    # Fetch all selected consultations
    consultations = []
    for cid in data.consultation_ids:
        c = await db.consultations.find_one(
            {"id": cid, "user_id": user["id"]},
            {"_id": 0}
        )
        if not c:
            raise HTTPException(status_code=404, detail=f"Consultazione {cid} non trovata")
        consultations.append(c)
    
    # Sort by creation date
    consultations.sort(key=lambda x: x.get("created_at", ""))
    
    lang = user.get("language", "it")
    
    # Build synthesis prompt
    synthesis_type_labels = {
        "confirmation": "conferma o smentita" if lang == "it" else "confirmation or denial",
        "deepening": "approfondimento" if lang == "it" else "deepening",
        "clarification": "chiarimento" if lang == "it" else "clarification"
    }
    synthesis_label = synthesis_type_labels.get(data.synthesis_type, synthesis_type_labels["deepening"])
    
    # Generate synthesis interpretation
    synthesis_interpretation = await generate_synthesis_interpretation(
        consultations, 
        data.synthesis_type, 
        lang
    )
    
    # Create combined question
    questions = [c.get("question", "") for c in consultations]
    combined_question = f"[SINTESI - {synthesis_label.upper()}]\n" + "\n→ ".join(questions)
    
    # Use the most recent hexagram as the "primary" for the synthesis
    latest = consultations[-1]
    
    # Create synthesis consultation record
    consultation_id = str(uuid.uuid4())
    consultation_doc = {
        "id": consultation_id,
        "user_id": user["id"],
        "question": combined_question,
        "hexagram_number": latest.get("hexagram_number", 1),
        "hexagram_name": latest.get("hexagram_name", ""),
        "hexagram_chinese": latest.get("hexagram_chinese", ""),
        "hexagram_symbol": latest.get("hexagram_symbol", ""),
        "derived_hexagram_number": latest.get("derived_hexagram_number"),
        "derived_hexagram_name": latest.get("derived_hexagram_name"),
        "derived_hexagram_chinese": latest.get("derived_hexagram_chinese"),
        "moving_lines": latest.get("moving_lines", []),
        "traditional_data": latest.get("traditional_data"),
        "derived_traditional_data": latest.get("derived_traditional_data"),
        "interpretation": synthesis_interpretation,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_synthesis": True,
        "linked_consultation_ids": data.consultation_ids,
        "synthesis_type": data.synthesis_type
    }
    
    await db.consultations.insert_one(consultation_doc)
    
    return ConsultationResponse(
        id=consultation_id,
        question=combined_question,
        hexagram_number=latest.get("hexagram_number", 1),
        hexagram_name=latest.get("hexagram_name", ""),
        hexagram_chinese=latest.get("hexagram_chinese", ""),
        hexagram_symbol=latest.get("hexagram_symbol", ""),
        derived_hexagram_number=latest.get("derived_hexagram_number"),
        derived_hexagram_name=latest.get("derived_hexagram_name"),
        derived_hexagram_chinese=latest.get("derived_hexagram_chinese"),
        moving_lines=latest.get("moving_lines", []),
        traditional_data=TraditionalData(**latest["traditional_data"]) if latest.get("traditional_data") else None,
        derived_traditional_data=TraditionalData(**latest["derived_traditional_data"]) if latest.get("derived_traditional_data") else None,
        interpretation=synthesis_interpretation,
        created_at=consultation_doc["created_at"],
        is_synthesis=True,
        linked_consultation_ids=data.consultation_ids,
        synthesis_type=data.synthesis_type
    )

async def generate_synthesis_interpretation(consultations: List[dict], synthesis_type: str, language: str) -> str:
    """Generate AI interpretation that synthesizes multiple consultations"""
    if not EMERGENT_LLM_KEY:
        return "Interpretazione di sintesi non disponibile."
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"synthesis-{uuid.uuid4()}",
            system_message="""Sei un maestro di I Ching con profonda saggezza taoista. 
Il tuo compito è analizzare MULTIPLE consultazioni fatte dallo stesso consultante e creare una SINTESI che:
- Trova il filo conduttore tra le diverse stese
- Identifica conferme, contraddizioni o approfondimenti
- Offre una visione d'insieme illuminante
- Mantiene un tono rispettoso, profondo ma accessibile

Non usare elenchi puntati. Scrivi in modo fluido e narrativo.
Parla sempre in seconda persona al consultante."""
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Build the consultation summaries
        summaries = []
        for i, c in enumerate(consultations, 1):
            hex_name = c.get("hexagram_name", "")
            hex_num = c.get("hexagram_number", 0)
            question = c.get("question", "")
            interpretation = c.get("interpretation", "")[:500]  # Limit length
            derived = c.get("derived_hexagram_name", "")
            moving = c.get("moving_lines", [])
            
            summary = f"""
STESA {i}:
- Domanda: {question}
- Esagramma: {hex_num}. {hex_name}
- Linee mutevoli: {moving if moving else 'Nessuna'}
- Esagramma derivato: {derived if derived else 'Nessuno'}
- Interpretazione originale (estratto): {interpretation}...
"""
            summaries.append(summary)
        
        synthesis_instructions = {
            "confirmation": {
                "it": "Analizza se le stese successive CONFERMANO o SMENTISCONO il messaggio della prima. Cerca coerenza o contraddizioni.",
                "en": "Analyze whether the subsequent readings CONFIRM or DENY the message of the first. Look for coherence or contradictions."
            },
            "deepening": {
                "it": "Approfondisci il significato complessivo, trovando connessioni nascoste tra le stese. Offri una comprensione più profonda.",
                "en": "Deepen the overall meaning, finding hidden connections between the readings. Offer a deeper understanding."
            },
            "clarification": {
                "it": "Chiarisci eventuali ambiguità, offrendo una lettura definitiva che risolva dubbi o incertezze emerse.",
                "en": "Clarify any ambiguities, offering a definitive reading that resolves doubts or uncertainties."
            }
        }
        
        instruction = synthesis_instructions.get(synthesis_type, synthesis_instructions["deepening"])
        instruction_text = instruction.get(language, instruction["it"])
        
        if language == "it":
            prompt = f"""Ecco le consultazioni I Ching da sintetizzare:

{"".join(summaries)}

ISTRUZIONI: {instruction_text}

Scrivi una SINTESI DIVINATORIA (300-500 parole) che:
1. Identifica il tema comune o l'evoluzione tra le stese
2. Analizza come gli esagrammi dialogano tra loro
3. Offre una conclusione illuminante per il consultante
4. Se ci sono linee mutevoli, considera la direzione del cambiamento

Concludi con un consiglio pratico basato sulla sintesi."""
        else:
            prompt = f"""Here are the I Ching consultations to synthesize:

{"".join(summaries)}

INSTRUCTIONS: {instruction_text}

Write a DIVINATORY SYNTHESIS (300-500 words) that:
1. Identifies the common theme or evolution between readings
2. Analyzes how the hexagrams dialogue with each other
3. Offers an illuminating conclusion for the querent
4. If there are moving lines, consider the direction of change

Conclude with practical advice based on the synthesis."""
        
        response = await chat.send_message(UserMessage(text=prompt))
        return response
        
    except Exception as e:
        logger.error(f"Error generating synthesis: {e}")
        if language == "it":
            return "La sintesi delle tue consultazioni rivela un percorso di crescita. Gli esagrammi che hai ricevuto dialogano tra loro, suggerendo un'evoluzione del tuo cammino. Medita su come i messaggi si collegano nella tua situazione attuale."
        return "The synthesis of your consultations reveals a path of growth. The hexagrams you received dialogue with each other, suggesting an evolution of your journey. Meditate on how the messages connect in your current situation."

def enrich_consultation_data(consultation: dict, language: str) -> dict:
    """Add missing traditional data to old consultations"""
    hex_num = consultation.get("hexagram_number")
    derived_num = consultation.get("derived_hexagram_number")
    moving_lines = consultation.get("moving_lines", [])
    
    # Add hexagram_chinese if missing
    if not consultation.get("hexagram_chinese"):
        primary = HEXAGRAMS.get(hex_num, {})
        consultation["hexagram_chinese"] = primary.get("name", "")
    
    # Add derived_hexagram_chinese if missing
    if derived_num and not consultation.get("derived_hexagram_chinese"):
        derived = HEXAGRAMS.get(derived_num, {})
        consultation["derived_hexagram_chinese"] = derived.get("name", "")
    
    # Add traditional_data if missing
    if not consultation.get("traditional_data"):
        trad_data = get_hexagram_traditional_data(hex_num, language)
        trigram_above_info = get_trigram_info(trad_data.get("trigram_above", "☰"), language)
        trigram_below_info = get_trigram_info(trad_data.get("trigram_below", "☷"), language)
        # Use get_all_lines_text to get ALL 6 lines
        all_lines_texts = get_all_lines_text(hex_num, moving_lines, language)
        
        consultation["traditional_data"] = {
            "sentence": trad_data.get("sentence", ""),
            "image": trad_data.get("image", ""),
            "commentary": trad_data.get("commentary", ""),
            "trigram_above": trigram_above_info,
            "trigram_below": trigram_below_info,
            "moving_lines_text": all_lines_texts
        }
    
    # Add derived_traditional_data if missing
    if derived_num and not consultation.get("derived_traditional_data"):
        derived_trad = get_hexagram_traditional_data(derived_num, language)
        d_trigram_above = get_trigram_info(derived_trad.get("trigram_above", "☰"), language)
        d_trigram_below = get_trigram_info(derived_trad.get("trigram_below", "☷"), language)
        
        consultation["derived_traditional_data"] = {
            "sentence": derived_trad.get("sentence", ""),
            "image": derived_trad.get("image", ""),
            "commentary": derived_trad.get("commentary", ""),
            "trigram_above": d_trigram_above,
            "trigram_below": d_trigram_below,
            "moving_lines_text": []
        }
    
    # Add synthesis fields if missing (for backward compatibility)
    if "is_synthesis" not in consultation:
        consultation["is_synthesis"] = False
    if "linked_consultation_ids" not in consultation:
        consultation["linked_consultation_ids"] = []
    if "synthesis_type" not in consultation:
        consultation["synthesis_type"] = None
    
    # Add consultation_type if missing (for backward compatibility)
    if "consultation_type" not in consultation:
        consultation["consultation_type"] = "deep"  # Default to deep for old consultations
    
    # Add conversation fields if missing
    if "parent_consultation_id" not in consultation:
        consultation["parent_consultation_id"] = None
    if "conversation_depth" not in consultation:
        consultation["conversation_depth"] = 0
    
    return consultation

# ============== SHARE CONSULTATION ==============
@api_router.post("/consultations/{consultation_id}/share")
async def create_share_link(consultation_id: str, user: dict = Depends(get_current_user)):
    """Generate a public share token for a consultation"""
    consultation = await db.consultations.find_one(
        {"id": consultation_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultazione non trovata")
    
    # Generate share token if not exists
    share_token = consultation.get("share_token")
    if not share_token:
        share_token = str(uuid.uuid4())[:12]
        await db.consultations.update_one(
            {"id": consultation_id},
            {"$set": {"share_token": share_token, "is_public": True}}
        )
    
    return {"share_token": share_token, "consultation_id": consultation_id}

@api_router.get("/shared/{share_token}")
async def get_shared_consultation(share_token: str):
    """Get a publicly shared consultation (no auth required)"""
    consultation = await db.consultations.find_one(
        {"share_token": share_token, "is_public": True},
        {"_id": 0, "user_id": 0}  # Exclude user info for privacy
    )
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultazione non trovata o non condivisa")
    
    return {
        "id": consultation["id"],
        "question": consultation["question"],
        "hexagram_number": consultation["hexagram_number"],
        "hexagram_name": consultation["hexagram_name"],
        "derived_hexagram_number": consultation.get("derived_hexagram_number"),
        "derived_hexagram_name": consultation.get("derived_hexagram_name"),
        "moving_lines": consultation["moving_lines"],
        "interpretation": consultation["interpretation"],
        "created_at": consultation["created_at"]
    }


# ============== CONSULTATION FEEDBACK ==============

class FeedbackInput(BaseModel):
    rating: str  # 'yes', 'no', 'other', 'skipped'
    feedback_text: Optional[str] = None


@api_router.post("/consultations/{consultation_id}/feedback")
async def submit_consultation_feedback(consultation_id: str, feedback: FeedbackInput, request: Request):
    """Submit feedback for a consultation to improve interpretation quality"""
    user = await get_current_user(request)
    
    # Verify consultation exists and belongs to user
    consultation = await db.consultations.find_one({
        "id": consultation_id,
        "user_id": user["id"]
    })
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultazione non trovata")
    
    # Check if feedback already submitted
    existing_feedback = await db.consultation_feedback.find_one({
        "consultation_id": consultation_id,
        "user_id": user["id"]
    })
    
    if existing_feedback:
        # Update existing feedback
        await db.consultation_feedback.update_one(
            {"consultation_id": consultation_id, "user_id": user["id"]},
            {"$set": {
                "rating": feedback.rating,
                "feedback_text": feedback.feedback_text,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new feedback
        feedback_doc = {
            "id": str(uuid.uuid4()),
            "consultation_id": consultation_id,
            "user_id": user["id"],
            "rating": feedback.rating,
            "feedback_text": feedback.feedback_text,
            # Include consultation context for ML training
            "hexagram_number": consultation.get("hexagram_number"),
            "derived_hexagram_number": consultation.get("derived_hexagram_number"),
            "moving_lines": consultation.get("moving_lines"),
            "consultation_type": consultation.get("consultation_type"),
            "topic": consultation.get("topic"),
            "question_length": len(consultation.get("question", "")),
            "interpretation_length": len(consultation.get("interpretation", "")),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.consultation_feedback.insert_one(feedback_doc)
    
    # Update consultation with feedback status
    await db.consultations.update_one(
        {"id": consultation_id},
        {"$set": {"has_feedback": True, "feedback_rating": feedback.rating}}
    )
    
    # Log for analytics
    logger.info(f"Feedback received: consultation={consultation_id}, rating={feedback.rating}")
    
    return {"message": "Feedback salvato con successo", "rating": feedback.rating}


@api_router.get("/feedback/stats")
async def get_feedback_statistics(request: Request):
    """Get aggregated feedback statistics (admin only or for ML training)"""
    user = await get_current_user(request)
    
    # Count by rating
    pipeline = [
        {"$group": {
            "_id": "$rating",
            "count": {"$sum": 1}
        }}
    ]
    
    rating_counts = {}
    async for doc in db.consultation_feedback.aggregate(pipeline):
        rating_counts[doc["_id"]] = doc["count"]
    
    total = sum(rating_counts.values())
    
    return {
        "total_feedback": total,
        "ratings": rating_counts,
        "positive_rate": round((rating_counts.get("yes", 0) / total * 100), 1) if total > 0 else 0,
        "needs_improvement_rate": round(((rating_counts.get("no", 0) + rating_counts.get("other", 0)) / total * 100), 1) if total > 0 else 0
    }


# ============== STRIPE PAYMENT ROUTES ==============
SUBSCRIPTION_PRICE = 9.99  # Monthly price in EUR

@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{data.origin_url}/pricing"
    
    checkout_request = CheckoutSessionRequest(
        amount=SUBSCRIPTION_PRICE,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "user_email": user["email"],
            "type": "monthly_subscription"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["id"],
        "amount": SUBSCRIPTION_PRICE,
        "currency": "eur",
        "status": "pending",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(get_current_user)):
    host_url = "https://benessere-mobile-1.preview.emergentagent.com"
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction record
    if status.payment_status == "paid":
        # Check if already processed
        existing = await db.payment_transactions.find_one({
            "session_id": session_id,
            "payment_status": "paid"
        })
        
        if not existing:
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": status.status,
                    "payment_status": status.payment_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Activate subscription for 30 days
            subscription_end = datetime.now(timezone.utc) + timedelta(days=30)
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "subscription_active": True,
                    "subscription_end": subscription_end.isoformat()
                }}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")
    
    try:
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, sig_header)
        
        if webhook_response.payment_status == "paid":
            user_id = webhook_response.metadata.get("user_id")
            if user_id:
                # Check if already processed
                existing = await db.payment_transactions.find_one({
                    "session_id": webhook_response.session_id,
                    "payment_status": "paid"
                })
                
                if not existing:
                    # Update transaction
                    await db.payment_transactions.update_one(
                        {"session_id": webhook_response.session_id},
                        {"$set": {
                            "status": "complete",
                            "payment_status": "paid",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    
                    # Activate subscription
                    subscription_end = datetime.now(timezone.utc) + timedelta(days=30)
                    await db.users.update_one(
                        {"id": user_id},
                        {"$set": {
                            "subscription_active": True,
                            "subscription_end": subscription_end.isoformat()
                        }}
                    )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ============== HEXAGRAM INFO ROUTE ==============
@api_router.get("/hexagrams")
async def get_hexagrams():
    return HEXAGRAMS

@api_router.get("/hexagrams/{number}")
async def get_hexagram(number: int):
    if number < 1 or number > 64:
        raise HTTPException(status_code=404, detail="Esagramma non trovato")
    return HEXAGRAMS.get(number, {})


# ============== SUBSCRIPTION & LIMITS ==============

@api_router.get("/subscription/status")
async def get_subscription_status(request: Request):
    """Get user's subscription status and limits"""
    user = await get_current_user(request)
    plan = get_user_plan(user)
    limits = get_plan_limits(plan)
    
    # Get consultation count this month
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_count = await db.consultations.count_documents({
        "user_id": user["id"],
        "created_at": {"$gte": start_of_month}
    })
    
    remaining = limits["monthly_consultations"] - monthly_count if limits["monthly_consultations"] != -1 else -1
    
    return {
        "plan": plan,
        "limits": limits,
        "usage": {
            "monthly_consultations": monthly_count,
            "remaining": remaining
        },
        "subscription_end": user.get("subscription_end"),
        "prices": SUBSCRIPTION_PRICES
    }


@api_router.get("/subscription/check-limit")
async def check_limit(request: Request):
    """Check if user can make a consultation"""
    user = await get_current_user(request)
    result = await check_consultation_limit(db, user)
    result["plan"] = get_user_plan(user)
    return result


@api_router.post("/admin/activate-premium-all")
async def activate_premium_for_all():
    """
    ADMIN ENDPOINT: Attiva Premium per TUTTI gli utenti esistenti.
    Usare per testing - non richiede autenticazione.
    """
    premium_end = datetime.now(timezone.utc) + timedelta(days=365)
    
    result = await db.users.update_many(
        {},  # Tutti gli utenti
        {
            "$set": {
                "subscription_active": True,
                "subscription_end": premium_end.isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "message": f"Premium attivato per {result.modified_count} utenti",
        "modified_count": result.modified_count,
        "premium_until": premium_end.isoformat()
    }


@api_router.post("/admin/activate-premium/{email}")
async def activate_premium_for_user(email: str):
    """
    ADMIN ENDPOINT: Attiva Premium per un utente specifico.
    """
    premium_end = datetime.now(timezone.utc) + timedelta(days=365)
    
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "subscription_active": True,
                "subscription_end": premium_end.isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Utente {email} non trovato")
    
    return {
        "success": True,
        "message": f"Premium attivato per {email}",
        "email": email,
        "premium_until": premium_end.isoformat()
    }


# ============== DAILY HEXAGRAM ==============

@api_router.get("/daily-hexagram")
async def get_daily_hexagram(request: Request):
    """Get the hexagram of the day"""
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    hex_number = get_daily_hexagram_number()
    hex_data = HEXAGRAMS.get(hex_number, {})
    extended = get_extended_hexagram_data(hex_number, lang)
    traditional = get_hexagram_traditional_data(hex_number, lang)
    lunar = get_lunar_phase()
    
    name_key = "name_it" if lang == "it" else "name_en"
    
    # Generate a short daily message
    daily_messages_it = [
        f"Oggi il Tao ti parla attraverso {hex_data.get(name_key)}. Lascia che la sua energia ti guidi.",
        f"L'esagramma {hex_number} illumina il tuo cammino oggi. Ascolta il suo messaggio.",
        f"{hex_data.get(name_key)} ti accompagna in questa giornata. Cosa vuole insegnarti?",
    ]
    daily_messages_en = [
        f"Today the Tao speaks to you through {hex_data.get(name_key)}. Let its energy guide you.",
        f"Hexagram {hex_number} illuminates your path today. Listen to its message.",
        f"{hex_data.get(name_key)} accompanies you on this day. What does it want to teach you?",
    ]
    
    import random
    random.seed(int(datetime.now(timezone.utc).strftime("%Y%m%d")))
    message = random.choice(daily_messages_it if lang == "it" else daily_messages_en)
    random.seed()
    
    return {
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "hexagram_number": hex_number,
        "hexagram_name": hex_data.get(name_key, ""),
        "hexagram_chinese": hex_data.get("name", ""),
        "sentence": extended.get("giudizio", traditional.get("sentence", "")),
        "image": extended.get("immagine", traditional.get("image", "")),
        "daily_message": message,
        "lunar_phase": lunar
    }


# ============== LUNAR CALENDAR ==============

@api_router.get("/lunar-calendar")
async def get_lunar_calendar():
    """Get current lunar phase and I Ching advice"""
    phase = get_lunar_phase()
    return phase


# ============== I CHING LIBRARY ==============

@api_router.get("/library/hexagrams")
async def get_library_hexagrams(request: Request):
    """Get all 64 hexagrams for the library"""
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    name_key = "name_it" if lang == "it" else "name_en"
    
    hexagrams_list = []
    for num in range(1, 65):
        hex_data = HEXAGRAMS.get(num, {})
        extended = ICHING_EXTENDED.get(num, {})
        
        hexagrams_list.append({
            "number": num,
            "name": hex_data.get(name_key, ""),
            "chinese": hex_data.get("name", ""),
            "trigram_above": hex_data.get("trigram_top", ""),
            "trigram_below": hex_data.get("trigram_bottom", ""),
            "giudizio": extended.get("giudizio", "")[:100] + "..." if extended.get("giudizio") else ""
        })
    
    return hexagrams_list


@api_router.get("/library/hexagrams/{number}")
async def get_library_hexagram_detail(number: int, request: Request):
    """Get detailed info for a specific hexagram"""
    if number < 1 or number > 64:
        raise HTTPException(status_code=404, detail="Esagramma non trovato")
    
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    hex_data = HEXAGRAMS.get(number, {})
    extended = ICHING_EXTENDED.get(number, {})
    traditional = get_hexagram_traditional_data(number, lang)
    
    name_key = "name_it" if lang == "it" else "name_en"
    
    # Get all 6 lines
    lines = []
    for line_num in range(1, 7):
        line_data = extended.get("linee", {}).get(line_num, {})
        lines.append({
            "position": line_num,
            "text": line_data.get("testo", ""),
            "meaning": line_data.get("significato", "")
        })
    
    # Get trigram info - use traditional data if available, otherwise fallback to HEXAGRAMS
    trig_above_symbol = traditional.get("trigram_above") or hex_data.get("trigram_top", "☰")
    trig_below_symbol = traditional.get("trigram_below") or hex_data.get("trigram_bottom", "☷")
    trigram_above = get_trigram_info(trig_above_symbol, lang)
    trigram_below = get_trigram_info(trig_below_symbol, lang)
    
    return {
        "number": number,
        "name": hex_data.get(name_key, ""),
        "chinese": hex_data.get("name", ""),
        "chinese_name": extended.get("nome_cinese", ""),
        "giudizio": extended.get("giudizio", traditional.get("sentence", "")),
        "immagine": extended.get("immagine", traditional.get("image", "")),
        "commento": extended.get("commento", traditional.get("commentary", "")),
        "trigram_above": trigram_above,
        "trigram_below": trigram_below,
        "lines": lines
    }


@api_router.get("/library/trigrams")
async def get_library_trigrams(request: Request):
    """Get all 8 trigrams info"""
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    trigrams_list = []
    for symbol in TRIGRAMS.keys():
        info = get_trigram_info(symbol, lang)
        trigrams_list.append(info)
    
    return trigrams_list


# ============== PERSONAL DIARY / NOTES ==============

@api_router.post("/notes")
async def create_note(data: NoteCreate, request: Request):
    """Add a personal note to a consultation (Premium only)"""
    user = await get_current_user(request)
    
    # Check if premium
    plan = get_user_plan(user)
    if plan != "premium":
        raise HTTPException(status_code=403, detail="Funzionalità Premium. Abbonati per aggiungere note personali.")
    
    # Verify consultation exists and belongs to user
    consultation = await db.consultations.find_one({
        "id": data.consultation_id,
        "user_id": user["id"]
    })
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultazione non trovata")
    
    note_id = str(uuid.uuid4())
    note_doc = {
        "id": note_id,
        "user_id": user["id"],
        "consultation_id": data.consultation_id,
        "content": data.content,
        "mood": data.mood,
        "tags": data.tags or [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notes.insert_one(note_doc)
    
    return {"id": note_id, "message": "Nota salvata"}


@api_router.get("/notes")
async def get_user_notes(request: Request, consultation_id: str = None):
    """Get user's notes, optionally filtered by consultation"""
    user = await get_current_user(request)
    
    query = {"user_id": user["id"]}
    if consultation_id:
        query["consultation_id"] = consultation_id
    
    notes = await db.notes.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return notes


@api_router.put("/notes/{note_id}")
async def update_note(note_id: str, data: NoteUpdate, request: Request):
    """Update a note"""
    user = await get_current_user(request)
    
    note = await db.notes.find_one({"id": note_id, "user_id": user["id"]})
    if not note:
        raise HTTPException(status_code=404, detail="Nota non trovata")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.content is not None:
        update_data["content"] = data.content
    if data.mood is not None:
        update_data["mood"] = data.mood
    if data.tags is not None:
        update_data["tags"] = data.tags
    
    await db.notes.update_one({"id": note_id}, {"$set": update_data})
    return {"message": "Nota aggiornata"}


@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str, request: Request):
    """Delete a note"""
    user = await get_current_user(request)
    
    result = await db.notes.delete_one({"id": note_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nota non trovata")
    
    return {"message": "Nota eliminata"}


# ============== STATISTICS ==============

@api_router.get("/statistics")
async def get_user_statistics(request: Request):
    """Get user's consultation statistics (Premium only)"""
    user = await get_current_user(request)
    
    # Check if premium for full stats
    plan = get_user_plan(user)
    
    # Basic stats for everyone
    total_consultations = await db.consultations.count_documents({"user_id": user["id"]})
    
    # Get level info
    level_info = get_user_level(total_consultations)
    
    # Get badges
    user_badges = user.get("badges", [])
    badges_detail = [b for b in BADGES if b["id"] in user_badges]
    
    basic_stats = {
        "total_consultations": total_consultations,
        "level": level_info,
        "badges": badges_detail,
        "plan": plan
    }
    
    if plan != "premium":
        basic_stats["premium_required"] = True
        basic_stats["message"] = "Abbonati a Premium per vedere le statistiche complete"
        return basic_stats
    
    # Premium stats
    # Most frequent hexagrams
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$group": {"_id": "$hexagram_number", "count": {"$sum": 1}, "name": {"$first": "$hexagram_name"}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    frequent_hexagrams = await db.consultations.aggregate(pipeline).to_list(5)
    
    # Topics distribution
    pipeline_topics = [
        {"$match": {"user_id": user["id"], "topic": {"$ne": None}}},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    topics_distribution = await db.consultations.aggregate(pipeline_topics).to_list(10)
    
    # Moving lines frequency
    pipeline_lines = [
        {"$match": {"user_id": user["id"]}},
        {"$unwind": "$moving_lines"},
        {"$group": {"_id": "$moving_lines", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    lines_frequency = await db.consultations.aggregate(pipeline_lines).to_list(6)
    
    # Unique hexagrams encountered
    unique_hexagrams = await db.consultations.distinct("hexagram_number", {"user_id": user["id"]})
    
    # Consultations by type
    direct_count = await db.consultations.count_documents({"user_id": user["id"], "consultation_type": "direct"})
    deep_count = await db.consultations.count_documents({"user_id": user["id"], "consultation_type": "deep"})
    
    # Monthly trend (last 6 months)
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
    pipeline_monthly = [
        {"$match": {"user_id": user["id"], "created_at": {"$gte": six_months_ago}}},
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 7]},  # YYYY-MM
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    monthly_trend = await db.consultations.aggregate(pipeline_monthly).to_list(6)
    
    return {
        **basic_stats,
        "premium_required": False,
        "frequent_hexagrams": [{"number": h["_id"], "name": h["name"], "count": h["count"]} for h in frequent_hexagrams],
        "topics_distribution": {t["_id"]: t["count"] for t in topics_distribution},
        "lines_frequency": {str(l["_id"]): l["count"] for l in lines_frequency},
        "unique_hexagrams_count": len(unique_hexagrams),
        "unique_hexagrams": unique_hexagrams,
        "consultation_types": {"direct": direct_count, "deep": deep_count},
        "monthly_trend": [{"month": m["_id"], "count": m["count"]} for m in monthly_trend]
    }


# ============== GUIDED PATHS ==============

@api_router.get("/paths/completed")
async def get_completed_paths(request: Request):
    """Get all completed paths with synthesis for current user"""
    user = await get_current_user(request)
    
    completed = await db.completed_paths.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("completed_at", -1).to_list(100)
    
    return completed


@api_router.get("/paths/completed/{completed_path_id}")
async def get_completed_path_detail(completed_path_id: str, request: Request):
    """Get detail of a specific completed path"""
    user = await get_current_user(request)
    
    completed_path = await db.completed_paths.find_one(
        {"id": completed_path_id, "user_id": user["id"]},
        {"_id": 0}
    )
    
    if not completed_path:
        raise HTTPException(status_code=404, detail="Percorso completato non trovato")
    
    # Mark as read
    if not completed_path.get("is_read"):
        await db.completed_paths.update_one(
            {"id": completed_path_id},
            {"$set": {"is_read": True}}
        )
    
    return completed_path


@api_router.get("/paths/unread-count")
async def get_unread_paths_count(request: Request):
    """Get count of unread completed paths for notification badge"""
    user = await get_current_user(request)
    
    count = await db.completed_paths.count_documents({
        "user_id": user["id"],
        "is_read": False
    })
    
    return {"count": count}


@api_router.get("/paths")
async def get_guided_paths(request: Request):
    """Get available guided paths"""
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    name_key = "name_it" if lang == "it" else "name_en"
    desc_key = "description_it" if lang == "it" else "description_en"
    
    paths_list = []
    for path_id, path in GUIDED_PATHS.items():
        paths_list.append({
            "id": path["id"],
            "name": path[name_key],
            "description": path[desc_key],
            "emoji": path["emoji"],
            "total_steps": len(path["steps"])
        })
    
    return paths_list


@api_router.get("/paths/{path_id}")
async def get_path_detail(path_id: str, request: Request):
    """Get details of a specific guided path"""
    user = await get_current_user(request)
    lang = user.get("language", "it")
    
    path = GUIDED_PATHS.get(path_id)
    if not path:
        raise HTTPException(status_code=404, detail="Percorso non trovato")
    
    name_key = "name_it" if lang == "it" else "name_en"
    desc_key = "description_it" if lang == "it" else "description_en"
    question_key = "question_it" if lang == "it" else "question_en"
    
    # Get user's progress on this path
    user_path = await db.user_paths.find_one({
        "user_id": user["id"],
        "path_id": path_id
    })
    
    completed_steps = user_path.get("completed_steps", []) if user_path else []
    
    steps = []
    for step in path["steps"]:
        steps.append({
            "day": step["day"],
            "question": step[question_key],
            "completed": step["day"] in completed_steps
        })
    
    return {
        "id": path["id"],
        "name": path[name_key],
        "description": path[desc_key],
        "emoji": path["emoji"],
        "steps": steps,
        "total_steps": len(path["steps"]),
        "completed_steps": len(completed_steps),
        "started": user_path is not None,
        "started_at": user_path.get("started_at") if user_path else None
    }


@api_router.post("/paths/{path_id}/start")
async def start_path(path_id: str, request: Request):
    """Start a guided path"""
    user = await get_current_user(request)
    
    path = GUIDED_PATHS.get(path_id)
    if not path:
        raise HTTPException(status_code=404, detail="Percorso non trovato")
    
    # Check if already started
    existing = await db.user_paths.find_one({
        "user_id": user["id"],
        "path_id": path_id
    })
    
    if existing:
        return {"message": "Percorso già iniziato", "path_id": path_id}
    
    # Create path record
    await db.user_paths.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "path_id": path_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_steps": [],
        "consultations": []
    })
    
    return {"message": "Percorso iniziato", "path_id": path_id}


@api_router.post("/paths/{path_id}/complete-step")
async def complete_path_step(path_id: str, request: Request, step_day: int = 1, consultation_id: str = None):
    """Mark a step as completed"""
    user = await get_current_user(request)
    
    user_path = await db.user_paths.find_one({
        "user_id": user["id"],
        "path_id": path_id
    })
    
    if not user_path:
        raise HTTPException(status_code=404, detail="Percorso non iniziato")
    
    update_data = {
        "$addToSet": {"completed_steps": step_day}
    }
    
    if consultation_id:
        update_data["$push"] = {"consultations": {
            "step_day": step_day,
            "consultation_id": consultation_id,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    
    await db.user_paths.update_one(
        {"user_id": user["id"], "path_id": path_id},
        update_data
    )
    
    # Check if path is now complete and generate synthesis
    path_info = GUIDED_PATHS.get(path_id)
    if path_info:
        total_steps = len(path_info.get("steps", []))
        completed_steps = len(user_path.get("completed_steps", [])) + 1  # Include current step
        
        if completed_steps >= total_steps:
            # Path completed! Generate synthesis
            await generate_path_synthesis(db, user, path_id, path_info)
    
    return {"message": "Passo completato", "step_day": step_day}


async def generate_path_synthesis(db, user, path_id: str, path_info: dict):
    """Generate AI synthesis for completed path"""
    lang = user.get("language", "it")
    
    # Get all consultations for this path
    user_path = await db.user_paths.find_one({
        "user_id": user["id"],
        "path_id": path_id
    })
    
    if not user_path:
        return
    
    consultation_ids = [c["consultation_id"] for c in user_path.get("consultations", [])]
    
    # Fetch all consultations
    consultations = await db.consultations.find({
        "id": {"$in": consultation_ids}
    }).to_list(100)
    
    if not consultations:
        return
    
    # Build context for AI synthesis
    hexagrams_info = []
    for consultation in consultations:
        hex_num = consultation.get("hexagram_number")
        hex_data = get_hexagram_traditional_data(hex_num) if hex_num else {}
        moving_lines = consultation.get("moving_lines", [])
        
        hexagrams_info.append({
            "question": consultation.get("question", ""),
            "hexagram_number": hex_num,
            "hexagram_name": hex_data.get("name", ""),
            "hexagram_meaning": hex_data.get("meaning_it" if lang == "it" else "meaning_en", ""),
            "judgment": hex_data.get("judgment_it" if lang == "it" else "judgment_en", ""),
            "moving_lines": moving_lines,
            "interpretation": consultation.get("interpretation", "")
        })
    
    # Generate AI synthesis
    synthesis_prompt = f"""Sei un saggio maestro dell'I Ching. Un utente ha completato il percorso "{path_info.get('name_it' if lang == 'it' else 'name_en', path_id)}".

Durante il percorso ha consultato l'oracolo con le seguenti domande e ha ricevuto questi esagrammi:

"""
    
    for i, info in enumerate(hexagrams_info, 1):
        synthesis_prompt += f"""
--- Consultazione {i} ---
Domanda: {info['question']}
Esagramma: {info['hexagram_number']} - {info['hexagram_name']}
Significato: {info['hexagram_meaning']}
Giudizio: {info['judgment']}
Linee mutanti: {', '.join(map(str, info['moving_lines'])) if info['moving_lines'] else 'Nessuna'}
"""

    if lang == "it":
        synthesis_prompt += """

Basandoti su TUTTI questi esagrammi e le loro interazioni, crea una SINTESI UNICA e COMPLETA che:

1. **ANALISI COMPLESSIVA**: Identifica il tema centrale che emerge dalla combinazione di tutti gli esagrammi
2. **PUNTI DI FORZA**: Quali qualità e risorse l'utente può sfruttare
3. **AREE DI MIGLIORAMENTO**: Aspetti su cui lavorare per la crescita personale
4. **PIANO D'AZIONE**: Passi concreti e specifici da seguire (minimo 5 punti)
5. **CONSIGLIO FINALE**: Un messaggio di saggezza che integra tutti gli insegnamenti

Scrivi in modo profondo ma accessibile, come un maestro saggio che guida un allievo. Non elencare semplicemente i significati degli esagrammi, ma crea una visione INTEGRATA e PERSONALIZZATA per il percorso di crescita dell'utente.
"""
    else:
        synthesis_prompt += """

Based on ALL these hexagrams and their interactions, create a UNIQUE and COMPLETE SYNTHESIS that:

1. **OVERALL ANALYSIS**: Identify the central theme emerging from the combination of all hexagrams
2. **STRENGTHS**: What qualities and resources the user can leverage
3. **AREAS FOR IMPROVEMENT**: Aspects to work on for personal growth
4. **ACTION PLAN**: Concrete and specific steps to follow (minimum 5 points)
5. **FINAL ADVICE**: A wisdom message that integrates all teachings

Write in a deep but accessible way, like a wise master guiding a student. Don't simply list hexagram meanings, but create an INTEGRATED and PERSONALIZED vision for the user's growth path.
"""
    
    try:
        llm = LlmChat(api_key=os.getenv("EMERGENT_LLM_KEY"))
        response = await llm.send_message_async(
            message=UserMessage(text=synthesis_prompt),
            model="anthropic/claude-sonnet-4-20250514",
            max_tokens=2000
        )
        synthesis_text = response.text
    except Exception as e:
        logger.error(f"Error generating path synthesis: {e}")
        synthesis_text = "Sintesi non disponibile al momento." if lang == "it" else "Synthesis not available at the moment."
    
    # Save completed path with synthesis
    completed_path_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "path_id": path_id,
        "path_name": path_info.get("name_it" if lang == "it" else "name_en", path_id),
        "path_emoji": path_info.get("emoji", "🎯"),
        "consultations": hexagrams_info,
        "synthesis": synthesis_text,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "is_read": False  # For notification badge
    }
    
    await db.completed_paths.insert_one(completed_path_doc)
    
    # Update user_path to mark as synthesis_generated
    await db.user_paths.update_one(
        {"user_id": user["id"], "path_id": path_id},
        {"$set": {"synthesis_generated": True, "completed_path_id": completed_path_doc["id"]}}
    )


# ============== PROGRESSION SYSTEM ==============

@api_router.get("/progression")
async def get_user_progression(request: Request):
    """Get user's progression (level, badges, etc.)"""
    user = await get_current_user(request)
    lang = user.get("language", "it")
    
    total = await db.consultations.count_documents({"user_id": user["id"]})
    level_info = get_user_level(total)
    
    # Get user badges
    user_badges = user.get("badges", [])
    badges_detail = []
    for badge in BADGES:
        badge_copy = badge.copy()
        badge_copy["earned"] = badge["id"] in user_badges
        badge_copy["name"] = badge["name_it"] if lang == "it" else badge["name_en"]
        badge_copy["description"] = badge["description_it"] if lang == "it" else badge["description_en"]
        badges_detail.append(badge_copy)
    
    # Format level info
    level_info["current"]["title"] = level_info["current"]["title_it"] if lang == "it" else level_info["current"]["title_en"]
    if level_info["next"]:
        level_info["next"]["title"] = level_info["next"]["title_it"] if lang == "it" else level_info["next"]["title_en"]
    
    return {
        "level": level_info,
        "badges": badges_detail,
        "total_consultations": total
    }


# ============== PERSONALIZED ADVICE SYSTEM (PREMIUM) ==============

class NotificationPreferencesUpdate(BaseModel):
    enabled: Optional[bool] = None
    frequency: Optional[str] = None  # daily, weekly, monthly
    preferred_time: Optional[str] = None  # HH:MM format
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    fcm_token: Optional[str] = None


@api_router.get("/advice/daily")
async def get_daily_advice(request: Request):
    """
    Get personalized daily advice based on user's paths and Chinese zodiac calendar.
    PREMIUM ONLY feature.
    """
    user = await get_current_user(request)
    plan = get_user_plan(user)
    
    if plan != "premium":
        raise HTTPException(
            status_code=403, 
            detail="Questa funzionalità è disponibile solo per utenti Premium"
        )
    
    lang = user.get("language", "it")
    advice = await generate_personalized_advice(db, user["id"], "daily", lang)
    
    return advice


@api_router.get("/advice/weekly")
async def get_weekly_advice(request: Request):
    """Get personalized weekly advice. PREMIUM ONLY."""
    user = await get_current_user(request)
    plan = get_user_plan(user)
    
    if plan != "premium":
        raise HTTPException(status_code=403, detail="Funzionalità Premium")
    
    lang = user.get("language", "it")
    advice = await generate_personalized_advice(db, user["id"], "weekly", lang)
    
    return advice


@api_router.get("/advice/monthly")
async def get_monthly_advice(request: Request):
    """Get personalized monthly advice. PREMIUM ONLY."""
    user = await get_current_user(request)
    plan = get_user_plan(user)
    
    if plan != "premium":
        raise HTTPException(status_code=403, detail="Funzionalità Premium")
    
    lang = user.get("language", "it")
    advice = await generate_personalized_advice(db, user["id"], "monthly", lang)
    
    return advice


@api_router.get("/advice/current")
async def get_current_advice(request: Request):
    """
    Get the current advice based on user's notification preference frequency.
    Returns daily/weekly/monthly advice based on settings.
    PREMIUM ONLY.
    """
    user = await get_current_user(request)
    plan = get_user_plan(user)
    
    if plan != "premium":
        # Return limited preview for free users
        day_energy = get_chinese_day_energy()
        year_animal = get_chinese_year_animal()
        lang = user.get("language", "it")
        
        return {
            "is_preview": True,
            "preview_message": "Passa a Premium per ricevere consigli personalizzati basati sui tuoi percorsi!" if lang == "it" else "Upgrade to Premium to receive personalized advice based on your paths!",
            "chinese_calendar": {
                "day_energy": day_energy,
                "year_animal": year_animal,
            }
        }
    
    # Get user's preference
    prefs = await get_user_notification_preferences(db, user["id"])
    frequency = prefs.get("frequency", "daily")
    lang = user.get("language", "it")
    
    advice = await generate_personalized_advice(db, user["id"], frequency, lang)
    advice["notification_preferences"] = prefs
    
    return advice


@api_router.get("/chinese-calendar")
async def get_chinese_calendar_info(request: Request):
    """Get Chinese calendar information for today (available to all users)"""
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    day_energy = get_chinese_day_energy()
    year_animal = get_chinese_year_animal()
    lunar_phase = get_lunar_phase()
    
    return {
        "day_energy": day_energy,
        "year_animal": year_animal,
        "lunar_phase": lunar_phase,
        "date": datetime.now(timezone.utc).isoformat(),
    }


@api_router.get("/notifications/preferences")
async def get_notification_preferences(request: Request):
    """Get user's notification preferences"""
    user = await get_current_user(request)
    prefs = await get_user_notification_preferences(db, user["id"])
    
    # Remove internal fields
    return {
        "enabled": prefs.get("enabled", True),
        "frequency": prefs.get("frequency", "daily"),
        "preferred_time": prefs.get("preferred_time", "08:00"),
        "push_enabled": prefs.get("push_enabled", False),
        "in_app_enabled": prefs.get("in_app_enabled", True),
        "has_fcm_token": bool(prefs.get("fcm_token")),
    }


@api_router.put("/notifications/preferences")
async def update_notification_preferences_endpoint(
    request: Request,
    updates: NotificationPreferencesUpdate
):
    """Update user's notification preferences. PREMIUM ONLY."""
    user = await get_current_user(request)
    plan = get_user_plan(user)
    
    if plan != "premium":
        raise HTTPException(
            status_code=403, 
            detail="Le preferenze di notifica sono disponibili solo per utenti Premium"
        )
    
    updates_dict = updates.dict(exclude_none=True)
    
    # Validate frequency
    if "frequency" in updates_dict and updates_dict["frequency"] not in ["daily", "weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="Frequenza non valida. Usa: daily, weekly, monthly")
    
    # Validate time format
    if "preferred_time" in updates_dict:
        try:
            datetime.strptime(updates_dict["preferred_time"], "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato ora non valido. Usa: HH:MM")
    
    updated_prefs = await update_user_notification_preferences(db, user["id"], updates_dict)
    
    return {
        "message": "Preferenze aggiornate",
        "preferences": {
            "enabled": updated_prefs.get("enabled", True),
            "frequency": updated_prefs.get("frequency", "daily"),
            "preferred_time": updated_prefs.get("preferred_time", "08:00"),
            "push_enabled": updated_prefs.get("push_enabled", False),
            "in_app_enabled": updated_prefs.get("in_app_enabled", True),
        }
    }


@api_router.post("/notifications/register-push")
async def register_push_token(request: Request, token: str):
    """
    Register FCM token for push notifications.
    This endpoint will be used when Firebase is configured.
    PREMIUM ONLY.
    """
    user = await get_current_user(request)
    plan = get_user_plan(user)
    
    if plan != "premium":
        raise HTTPException(status_code=403, detail="Push notifications are Premium only")
    
    await update_user_notification_preferences(db, user["id"], {
        "fcm_token": token,
        "push_enabled": True
    })
    
    return {"message": "Token registrato con successo", "push_enabled": True}


# ============== USER PROFILE SYSTEM ==============

class UserProfileUpdate(BaseModel):
    birth_date: Optional[str] = None  # YYYY-MM-DD format
    birth_time: Optional[str] = None  # HH:MM format
    birth_place: Optional[str] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    iching_experience: Optional[str] = None
    activity_level: Optional[str] = None
    wellness_interests: Optional[List[str]] = None


@api_router.get("/profile")
async def get_user_profile(request: Request):
    """Get user's complete profile including astrological data"""
    user = await get_current_user(request)
    lang = user.get("language", "it")
    
    # Get extended profile from user document
    profile_data = user.get("profile", {})
    
    response = {
        "id": user["id"],
        "name": user.get("name"),
        "email": user.get("email"),
        "language": lang,
        "profile_completed": bool(profile_data.get("birth_date")),
        "profile": profile_data,
        "astrological_profile": None,
    }
    
    # Calculate astrological profile if birth_date is available
    if profile_data.get("birth_date"):
        try:
            from datetime import date
            birth_parts = profile_data["birth_date"].split("-")
            birth_date = date(int(birth_parts[0]), int(birth_parts[1]), int(birth_parts[2]))
            
            astro_profile = get_full_astrological_profile(
                birth_date=birth_date,
                birth_time=profile_data.get("birth_time"),
                birth_place=profile_data.get("birth_place"),
                language=lang
            )
            response["astrological_profile"] = astro_profile
        except Exception as e:
            print(f"Error calculating astrological profile: {e}")
    
    return response


@api_router.put("/profile")
async def update_user_profile(request: Request, profile_update: UserProfileUpdate):
    """Update user's profile data"""
    user = await get_current_user(request)
    
    # Prepare update data
    update_data = profile_update.dict(exclude_none=True)
    
    # Validate occupation length
    if "occupation" in update_data and len(update_data["occupation"]) > 30:
        raise HTTPException(status_code=400, detail="Occupation must be max 30 characters")
    
    # Validate gender
    valid_genders = ["male", "female", "other", "prefer_not_say"]
    if "gender" in update_data and update_data["gender"] not in valid_genders:
        raise HTTPException(status_code=400, detail="Invalid gender value")
    
    # Validate iching_experience
    valid_experience = ["beginner", "intermediate", "expert"]
    if "iching_experience" in update_data and update_data["iching_experience"] not in valid_experience:
        raise HTTPException(status_code=400, detail="Invalid experience value")
    
    # Validate activity_level
    valid_activity = ["sedentary", "moderate", "active"]
    if "activity_level" in update_data and update_data["activity_level"] not in valid_activity:
        raise HTTPException(status_code=400, detail="Invalid activity level")
    
    # Validate wellness_interests
    valid_interests = ["meditation", "yoga", "taichi", "qigong"]
    if "wellness_interests" in update_data:
        for interest in update_data["wellness_interests"]:
            if interest not in valid_interests:
                raise HTTPException(status_code=400, detail=f"Invalid wellness interest: {interest}")
    
    # Validate date format
    if "birth_date" in update_data:
        try:
            from datetime import datetime
            datetime.strptime(update_data["birth_date"], "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Validate time format
    if "birth_time" in update_data and update_data["birth_time"]:
        try:
            from datetime import datetime
            datetime.strptime(update_data["birth_time"], "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM")
    
    # Update in database
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Merge with existing profile
    merged_profile = {**user.get("profile", {}), **update_data}
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"profile": merged_profile}}
    )
    
    # AUTO-GENERATE NATAL CHART if birth data is complete
    birth_date = merged_profile.get("birth_date")
    birth_time = merged_profile.get("birth_time")
    birth_place = merged_profile.get("birth_place")
    
    if birth_date and birth_time and birth_place and KERYKEION_AVAILABLE:
        try:
            # Check if natal chart already exists
            existing_chart = user.get("natal_chart")
            if not existing_chart:
                logger.info(f"Auto-generating natal chart for user {user['id']}")
                
                # Geocode the birth place
                coords = geocode_location(birth_place)
                if coords:
                    lat, lon, city_name = coords
                    
                    # Calculate natal chart
                    result = calculate_natal_chart(
                        name=user.get("name", "User"),
                        year=int(birth_date.split("-")[0]),
                        month=int(birth_date.split("-")[1]),
                        day=int(birth_date.split("-")[2]),
                        hour=int(birth_time.split(":")[0]),
                        minute=int(birth_time.split(":")[1]),
                        city=city_name,
                        lat=lat,
                        lon=lon
                    )
                    
                    if result:
                        # Save natal chart to user profile
                        await db.users.update_one(
                            {"id": user["id"]},
                            {"$set": {
                                "natal_chart": result,
                                "natal_chart_generated_at": datetime.now(timezone.utc).isoformat()
                            }}
                        )
                        logger.info(f"Natal chart auto-generated successfully for user {user['id']}")
        except Exception as e:
            logger.error(f"Error auto-generating natal chart: {e}")
            # Don't fail the profile update if natal chart generation fails
    
    # Return updated profile
    return await get_user_profile(request)


@api_router.get("/profile/fields")
async def get_profile_fields(request: Request):
    """Get profile field definitions for form building"""
    try:
        user = await get_current_user(request)
        lang = user.get("language", "it")
    except:
        lang = "it"
    
    # Transform fields for frontend
    fields = []
    for field_name, config in USER_PROFILE_FIELDS.items():
        field = {
            "name": field_name,
            "type": config["type"],
            "required": config["required"],
            "label": config[f"label_{lang}"] if f"label_{lang}" in config else config.get("label_it"),
            "max_length": config.get("max_length"),
        }
        
        if "options" in config:
            field["options"] = [
                {
                    "value": opt["value"],
                    "label": opt[f"label_{lang}"] if f"label_{lang}" in opt else opt.get("label_it")
                }
                for opt in config["options"]
            ]
        
        fields.append(field)
    
    return {"fields": fields}


@api_router.get("/profile/completion-status")
async def get_profile_completion_status(request: Request):
    """Check if user has completed their profile"""
    user = await get_current_user(request)
    profile = user.get("profile", {})
    
    # Check completion
    has_birth_date = bool(profile.get("birth_date"))
    has_basic_info = bool(profile.get("gender") or profile.get("birth_date"))
    
    completion_percentage = 0
    filled_fields = 0
    total_fields = len(USER_PROFILE_FIELDS)
    
    for field_name in USER_PROFILE_FIELDS:
        if profile.get(field_name):
            filled_fields += 1
    
    completion_percentage = int((filled_fields / total_fields) * 100)
    
    return {
        "is_complete": has_birth_date and has_basic_info,
        "completion_percentage": completion_percentage,
        "filled_fields": filled_fields,
        "total_fields": total_fields,
        "missing_essential": not has_birth_date,
        "show_prompt": not has_birth_date,
    }


# ============== NATAL CHART GENERATION ==============

class NatalChartRequest(BaseModel):
    name: Optional[str] = None
    birth_date: str  # YYYY-MM-DD format
    birth_time: str  # HH:MM format
    birth_place: str  # City name or coordinates


@api_router.post("/natal-chart/generate")
async def generate_natal_chart(request: Request, chart_request: NatalChartRequest):
    """
    Generate a complete natal chart with planetary positions, houses, aspects, and SVG diagram.
    Requires birth date, time, and place.
    """
    user = await get_current_user(request)
    lang = user.get("language", "it")
    
    if not KERYKEION_AVAILABLE:
        raise HTTPException(status_code=503, detail="Natal chart service temporarily unavailable")
    
    # Parse birth date
    try:
        birth_parts = chart_request.birth_date.split("-")
        year = int(birth_parts[0])
        month = int(birth_parts[1])
        day = int(birth_parts[2])
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Parse birth time
    try:
        time_parts = chart_request.birth_time.split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1])
    except:
        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM")
    
    # Geocode birth place
    geo_result = await geocode_location(chart_request.birth_place)
    if not geo_result:
        raise HTTPException(status_code=400, detail="Could not find location. Please try a different city name.")
    
    lat = geo_result["lat"]
    lng = geo_result["lng"]
    city = geo_result.get("display_name", chart_request.birth_place)
    
    # Calculate natal chart
    name = chart_request.name or user.get("name", "User")
    result = calculate_natal_chart(
        name=name,
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,
        lat=lat,
        lng=lng,
        city=city,
        language=lang
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Error generating natal chart"))
    
    # Save to user profile
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "natal_chart": result,
            "natal_chart_generated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return result


@api_router.get("/natal-chart")
async def get_saved_natal_chart(request: Request):
    """Get user's saved natal chart if available"""
    user = await get_current_user(request)
    
    natal_chart = user.get("natal_chart")
    if not natal_chart:
        return {"has_chart": False}
    
    return {
        "has_chart": True,
        "chart": natal_chart,
        "generated_at": user.get("natal_chart_generated_at")
    }


@api_router.get("/natal-chart/pdf")
async def generate_natal_chart_pdf(request: Request):
    """Generate a PDF of the user's natal chart"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib.units import cm
    import io
    import base64
    import cairosvg
    
    user = await get_current_user(request)
    lang = user.get("language", "it")
    
    natal_chart = user.get("natal_chart")
    if not natal_chart:
        raise HTTPException(status_code=404, detail="Tema natale non trovato. Genera prima il tema natale.")
    
    # Create PDF buffer
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#C44D38'),
        alignment=1  # Center
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=20,
        textColor=colors.HexColor('#2C2C2C')
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=10,
        textColor=colors.HexColor('#595959')
    )
    
    elements = []
    
    # Title
    title = "Tema Natale" if lang == "it" else "Natal Chart"
    elements.append(Paragraph(title, title_style))
    
    # Birth info
    birth_info = natal_chart.get("birth_info", {})
    info_text = f"""
    <b>{'Nome' if lang == 'it' else 'Name'}:</b> {birth_info.get('name', 'N/A')}<br/>
    <b>{'Data di nascita' if lang == 'it' else 'Birth Date'}:</b> {birth_info.get('date', 'N/A')}<br/>
    <b>{'Ora di nascita' if lang == 'it' else 'Birth Time'}:</b> {birth_info.get('time', 'N/A')}<br/>
    <b>{'Luogo di nascita' if lang == 'it' else 'Birth Place'}:</b> {birth_info.get('place', 'N/A')}
    """
    elements.append(Paragraph(info_text, body_style))
    elements.append(Spacer(1, 20))
    
    # Try to add SVG chart as image
    svg_data = natal_chart.get("chart_svg")
    if svg_data:
        try:
            # Convert SVG to PNG
            png_data = cairosvg.svg2png(bytestring=svg_data.encode('utf-8'), output_width=400)
            img_buffer = io.BytesIO(png_data)
            img = Image(img_buffer, width=14*cm, height=14*cm)
            elements.append(img)
            elements.append(Spacer(1, 20))
        except Exception as e:
            logger.warning(f"Could not convert SVG to image: {e}")
    
    # Planets section
    planets_title = "Posizioni Planetarie" if lang == "it" else "Planetary Positions"
    elements.append(Paragraph(planets_title, subtitle_style))
    
    planets = natal_chart.get("planets", [])
    if planets:
        planet_data = [["Pianeta" if lang == "it" else "Planet", "Segno" if lang == "it" else "Sign", "Gradi" if lang == "it" else "Degrees", "Casa" if lang == "it" else "House"]]
        for p in planets:
            planet_data.append([
                p.get("name", ""),
                p.get("sign", ""),
                f"{p.get('position', 0):.1f}°",
                str(p.get("house", ""))
            ])
        
        planet_table = Table(planet_data, colWidths=[4*cm, 4*cm, 3*cm, 2*cm])
        planet_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#C44D38')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F9F7F2')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1CDC7'))
        ]))
        elements.append(planet_table)
        elements.append(Spacer(1, 20))
    
    # Houses section
    houses_title = "Case Astrologiche" if lang == "it" else "Astrological Houses"
    elements.append(Paragraph(houses_title, subtitle_style))
    
    houses = natal_chart.get("houses", [])
    if houses:
        house_data = [["Casa" if lang == "it" else "House", "Segno" if lang == "it" else "Sign", "Cuspide" if lang == "it" else "Cusp"]]
        for h in houses:
            house_data.append([
                str(h.get("number", "")),
                h.get("sign", ""),
                f"{h.get('position', 0):.1f}°"
            ])
        
        house_table = Table(house_data, colWidths=[3*cm, 5*cm, 4*cm])
        house_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C2C2C')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F9F7F2')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1CDC7'))
        ]))
        elements.append(house_table)
        elements.append(Spacer(1, 20))
    
    # Aspects section
    aspects_title = "Aspetti Principali" if lang == "it" else "Main Aspects"
    elements.append(Paragraph(aspects_title, subtitle_style))
    
    aspects = natal_chart.get("aspects", [])
    if aspects:
        aspect_data = [["Pianeta 1" if lang == "it" else "Planet 1", "Aspetto" if lang == "it" else "Aspect", "Pianeta 2" if lang == "it" else "Planet 2", "Orbe" if lang == "it" else "Orb"]]
        for a in aspects[:15]:  # Limit to 15 aspects
            aspect_data.append([
                a.get("planet1", ""),
                a.get("aspect", ""),
                a.get("planet2", ""),
                f"{a.get('orb', 0):.1f}°"
            ])
        
        aspect_table = Table(aspect_data, colWidths=[3.5*cm, 4*cm, 3.5*cm, 2*cm])
        aspect_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8A9A5B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F9F7F2')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1CDC7'))
        ]))
        elements.append(aspect_table)
    
    # Footer
    elements.append(Spacer(1, 30))
    footer_text = "I Ching del Benessere - L'antica saggezza per il mondo moderno" if lang == "it" else "I Ching del Benessere - Ancient wisdom for the modern world"
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#888888'),
        alignment=1
    )
    elements.append(Paragraph(footer_text, footer_style))
    
    # Build PDF
    doc.build(elements)
    
    # Return PDF
    buffer.seek(0)
    pdf_content = buffer.getvalue()
    
    from fastapi.responses import Response
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=tema_natale_{user.get('name', 'chart')}.pdf"
        }
    )


@api_router.get("/geocode")
async def geocode_city(city: str):
    """Geocode a city name to get coordinates"""
    result = await geocode_location(city)
    if not result:
        raise HTTPException(status_code=404, detail="Location not found")
    return result


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
