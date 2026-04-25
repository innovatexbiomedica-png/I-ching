"""
Authoritative I Ching source texts - Richard Wilhelm Italian translation.

Provides per-hexagram traditional texts (Sentence, Image, Moving Lines)
to inject into the AI prompt so interpretations stay faithful to the
original Book of Changes rather than drifting into generic mysticism.

Source: Richard Wilhelm, "I King — Il libro dei mutamenti" (Italian edition)
"""
import json
import os
from pathlib import Path
from typing import Optional, Dict

# Load the extracted hexagram texts once at import time
_BASE = Path(__file__).parent
_SOURCE_FILE = _BASE / "sources" / "wilhelm_hex_extracted.json"

_WILHELM_TEXTS: Dict[str, dict] = {}

try:
    if _SOURCE_FILE.exists():
        with open(_SOURCE_FILE, "r", encoding="utf-8") as f:
            _WILHELM_TEXTS = json.load(f)
except Exception:
    _WILHELM_TEXTS = {}


def get_wilhelm_text(hexagram_number: int, max_chars: int = 6000) -> Optional[str]:
    """
    Return the authoritative Wilhelm text for a given hexagram (1-64).
    Truncates to max_chars to keep prompt size manageable.
    """
    if not 1 <= hexagram_number <= 64:
        return None
    entry = _WILHELM_TEXTS.get(str(hexagram_number))
    if not entry:
        return None
    text = entry.get("wilhelm", "").strip()
    if not text:
        return None
    return text[:max_chars]


def build_authoritative_context(
    primary_number: int,
    derived_number: Optional[int] = None,
    moving_lines: Optional[list] = None,
    language: str = "it",
) -> str:
    """
    Build a context block to inject into the AI prompt containing the
    authoritative Wilhelm texts for the primary and (if any) derived hexagrams.

    The AI is instructed to use these texts as the foundation for its
    interpretation, ensuring fidelity to the traditional Book of Changes.
    """
    if language != "it":
        # Wilhelm source is italian; for other languages just return empty
        # (the AI still has the iching_extended built-in data in english)
        return ""

    primary_text = get_wilhelm_text(primary_number, max_chars=5500)
    if not primary_text:
        return ""

    parts = [
        "═════════════════════════════════════════════════════════",
        "FONTE AUTORITATIVA — Richard Wilhelm, «I King, il libro dei mutamenti»",
        "═════════════════════════════════════════════════════════",
        "Le tue interpretazioni DEVONO essere fedeli al testo originale qui sotto.",
        "Cita la Sentenza e l'Immagine letteralmente quando rilevante.",
        "Per ogni linea mutevole, USA il testo tradizionale corrispondente.",
        "NON inventare elementi che contraddicano il testo tradizionale.",
        "",
        f"━━━ ESAGRAMMA PRIMARIO #{primary_number} (testo originale Wilhelm) ━━━",
        primary_text,
    ]

    if derived_number and derived_number != primary_number:
        derived_text = get_wilhelm_text(derived_number, max_chars=3000)
        if derived_text:
            parts.extend([
                "",
                f"━━━ ESAGRAMMA DERIVATO #{derived_number} (testo originale Wilhelm) ━━━",
                "(Verso cui evolve la situazione attraverso le linee mutevoli)",
                derived_text,
            ])

    if moving_lines:
        parts.extend([
            "",
            f"━━━ LINEE MUTEVOLI ATTIVE: {moving_lines} ━━━",
            "Per ciascuna di queste linee, individua il testo tradizionale "
            "corrispondente nel passaggio sopra (cerca «Nove al ...» o «Sei al ...») "
            "e analizzalo specificamente nel contesto della domanda del consultante.",
        ])

    parts.append("═════════════════════════════════════════════════════════")
    return "\n".join(parts)


def is_loaded() -> bool:
    """Return True if the Wilhelm source data is loaded."""
    return len(_WILHELM_TEXTS) >= 60  # at least most hexagrams


# Module-level diagnostic
if __name__ == "__main__":
    print(f"Wilhelm texts loaded: {len(_WILHELM_TEXTS)} hexagrams")
    sample = get_wilhelm_text(1)
    if sample:
        print("\n--- Esagramma #1 (Ch'ien) primi 500 char ---")
        print(sample[:500])
