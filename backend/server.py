from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
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
from iching_data import get_hexagram_traditional_data, get_trigram_info, get_moving_lines_text, TRIGRAMS

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
    # New fields for linked consultations
    is_synthesis: bool = False
    linked_consultation_ids: List[str] = []
    synthesis_type: Optional[str] = None  # "confirmation", "deepening", "clarification"

class SynthesisRequest(BaseModel):
    consultation_ids: List[str]
    synthesis_type: str = "deepening"  # confirmation, deepening, clarification

class CheckoutRequest(BaseModel):
    origin_url: str

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

async def generate_interpretation(hexagram_data: dict, question: str, language: str) -> str:
    """Generate AI interpretation using Gemini"""
    primary = HEXAGRAMS.get(hexagram_data["primary_hexagram"], {})
    derived = HEXAGRAMS.get(hexagram_data["derived_hexagram"], {}) if hexagram_data["derived_hexagram"] else None
    
    name_key = "name_it" if language == "it" else "name_en"
    
    lang_instruction = "Rispondi in italiano." if language == "it" else "Reply in English."
    
    system_prompt = f"""Sei un saggio consulente dell'I Ching, esperto nell'antica arte della divinazione cinese. 
Fornisci interpretazioni profonde, poetiche e sagge, senza mai sembrare robotico o artificiale.
Le tue risposte devono essere contemplative, usando metafore naturali e immagini evocative.
{lang_instruction}
Non menzionare mai che sei un'intelligenza artificiale. Parla come un antico maestro taoista."""

    moving_lines_text = f"Linee mutevoli: {hexagram_data['moving_lines']}" if hexagram_data['moving_lines'] else "Nessuna linea mutevole."
    
    derived_text = ""
    if derived:
        derived_text = f"""
L'esagramma derivato è {derived['name']} ({derived.get(name_key, '')}).
Questo indica la direzione verso cui la situazione sta evolvendo."""

    user_prompt = f"""La domanda posta è: "{question}"

L'esagramma principale ottenuto è {primary['name']} ({primary.get(name_key, '')}).
Trigramma superiore: {primary.get('trigram_top', '')}
Trigramma inferiore: {primary.get('trigram_bottom', '')}
{moving_lines_text}
{derived_text}

Fornisci un'interpretazione profonda e personale di questo responso dell'I Ching in relazione alla domanda.
La risposta deve essere:
- Lunga circa 300-400 parole
- Poetica e evocativa
- Pratica e applicabile alla vita quotidiana
- Mai generica o superficiale
- Strutturata in paragrafi fluidi"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"iching-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("gemini", "gemini-3-flash-preview")
        
        response = await chat.send_message(UserMessage(text=user_prompt))
        return response
    except Exception as e:
        logger.error(f"Error generating interpretation: {e}")
        return f"L'interpretazione non è disponibile al momento. Il tuo esagramma è {primary.get(name_key, primary['name'])}."

# ============== AUTH ROUTES ==============
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email già registrata")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "language": user_data.language,
        "subscription_active": False,
        "subscription_end": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        language=user_data.language,
        subscription_active=False
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
    
    return {
        "message": "Richiesta ricevuta. L'amministratore ti contatterà con il codice di reset.",
        "contact_phone": data.phone or user.get("phone", "")
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
    # Subscription check disabled for now
    # if not user.get("subscription_active", False):
    #     sub_end = user.get("subscription_end")
    #     if sub_end:
    #         end_date = datetime.fromisoformat(sub_end.replace("Z", "+00:00"))
    #         if end_date < datetime.now(timezone.utc):
    #             raise HTTPException(status_code=403, detail="Abbonamento non attivo.")
    #     else:
    #         raise HTTPException(status_code=403, detail="Abbonamento non attivo.")
    
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
        moving_texts = get_moving_lines_text(hex_num, moving_lines, lang)
        
        return TraditionalData(
            sentence=trad_data.get("sentence", ""),
            image=trad_data.get("image", ""),
            commentary=trad_data.get("commentary", ""),
            trigram_above=TrigramInfo(**trigram_above_info),
            trigram_below=TrigramInfo(**trigram_below_info),
            moving_lines_text=[MovingLineText(**m) for m in moving_texts]
        )
    
    primary_trad_response = build_traditional_response(primary_traditional, hex_data["moving_lines"], hex_data["primary_hexagram"])
    derived_trad_response = build_traditional_response(derived_traditional, [], hex_data["derived_hexagram"]) if derived_traditional else None
    
    # Generate interpretation
    interpretation = await generate_interpretation(hex_data, data.question, lang)
    
    # Create consultation record
    consultation_id = str(uuid.uuid4())
    consultation_doc = {
        "id": consultation_id,
        "user_id": user["id"],
        "question": data.question,
        "coin_tosses": data.coin_tosses.model_dump(),
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
    
    return ConsultationResponse(
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
        created_at=consultation_doc["created_at"]
    )

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
        moving_texts = get_moving_lines_text(hex_num, moving_lines, language)
        
        consultation["traditional_data"] = {
            "sentence": trad_data.get("sentence", ""),
            "image": trad_data.get("image", ""),
            "commentary": trad_data.get("commentary", ""),
            "trigram_above": trigram_above_info,
            "trigram_below": trigram_below_info,
            "moving_lines_text": moving_texts
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
    host_url = "https://error-zapper-3.preview.emergentagent.com"
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
