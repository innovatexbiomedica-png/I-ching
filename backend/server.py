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
    language: str = "it"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    language: str
    subscription_active: bool = False
    subscription_end: Optional[str] = None

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

class CheckoutRequest(BaseModel):
    origin_url: str

# ============== AUTH HELPERS ==============
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
    lines = [coin_tosses.line1, coin_tosses.line2, coin_tosses.line3, 
             coin_tosses.line4, coin_tosses.line5, coin_tosses.line6]
    
    # Convert to binary (6=old yin->0, 7=young yang->1, 8=young yin->0, 9=old yang->1)
    primary_binary = ""
    derived_binary = ""
    moving_lines = []
    
    for i, line in enumerate(lines):
        if line == 6:  # Old Yin (mutevole)
            primary_binary += "0"
            derived_binary += "1"  # Transforms to Yang
            moving_lines.append(i + 1)
        elif line == 7:  # Young Yang
            primary_binary += "1"
            derived_binary += "1"
        elif line == 8:  # Young Yin
            primary_binary += "0"
            derived_binary += "0"
        elif line == 9:  # Old Yang (mutevole)
            primary_binary += "1"
            derived_binary += "0"  # Transforms to Yin
            moving_lines.append(i + 1)
    
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
    
    name_key = "name_it" if user.get("language", "it") == "it" else "name_en"
    
    # Generate interpretation
    interpretation = await generate_interpretation(hex_data, data.question, user.get("language", "it"))
    
    # Create consultation record
    consultation_id = str(uuid.uuid4())
    consultation_doc = {
        "id": consultation_id,
        "user_id": user["id"],
        "question": data.question,
        "coin_tosses": data.coin_tosses.model_dump(),
        "hexagram_number": hex_data["primary_hexagram"],
        "hexagram_name": primary.get(name_key, primary.get("name", "")),
        "hexagram_symbol": get_hexagram_symbol(hex_data["lines"]),
        "derived_hexagram_number": hex_data["derived_hexagram"],
        "derived_hexagram_name": derived.get(name_key, derived.get("name", "")) if derived else None,
        "moving_lines": hex_data["moving_lines"],
        "interpretation": interpretation,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.consultations.insert_one(consultation_doc)
    
    return ConsultationResponse(
        id=consultation_id,
        question=data.question,
        hexagram_number=hex_data["primary_hexagram"],
        hexagram_name=primary.get(name_key, primary.get("name", "")),
        hexagram_symbol=get_hexagram_symbol(hex_data["lines"]),
        derived_hexagram_number=hex_data["derived_hexagram"],
        derived_hexagram_name=derived.get(name_key, derived.get("name", "")) if derived else None,
        moving_lines=hex_data["moving_lines"],
        interpretation=interpretation,
        created_at=consultation_doc["created_at"]
    )

@api_router.get("/consultations", response_model=List[ConsultationResponse])
async def get_consultations(user: dict = Depends(get_current_user)):
    consultations = await db.consultations.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [ConsultationResponse(**c) for c in consultations]

@api_router.get("/consultations/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(consultation_id: str, user: dict = Depends(get_current_user)):
    consultation = await db.consultations.find_one(
        {"id": consultation_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultazione non trovata")
    return ConsultationResponse(**consultation)

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
    host_url = "https://iching-oracolo.preview.emergentagent.com"
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
