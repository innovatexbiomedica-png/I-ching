"""
Email transazionale per I Ching del Benessere via Resend.

Provider: https://resend.com — free tier 3000 email/mese.

Configurazione (env vars su Render):
  RESEND_API_KEY        re_xxx... (Dashboard Resend → API Keys)
  RESEND_FROM_EMAIL     "I Ching del Benessere <noreply@chingbenessere.it>"
                         (dominio deve essere verificato su Resend con record SPF/DKIM)
  APP_URL               https://www.chingbenessere.it (link nelle email)

Senza RESEND_API_KEY l'invio diventa no-op silenzioso (logga warning).
Mai bloccare un'operazione utente se l'email fallisce — meglio una mail
mancante che un signup fallito.

Flussi coperti:
  - send_password_reset()       quando l'utente chiede /auth/request-reset
  - send_welcome()              dopo registrazione
  - send_payment_receipt()      su checkout.session.completed (Stripe webhook)
  - send_subscription_cancelled()   quando l'utente disdice
  - send_withdrawal_confirmed() quando esercita il recesso 14 gg

Tutti gli HTML sono inline, stile sobrio coerente col brand (sumi-ink
+ cinabro + serif per i titoli).
"""

from __future__ import annotations
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────
# Configurazione + bootstrap client Resend
# ──────────────────────────────────────────────────────────────────────
_RESEND_KEY = os.environ.get("RESEND_API_KEY", "").strip()
_FROM = os.environ.get(
    "RESEND_FROM_EMAIL",
    "I Ching del Benessere <noreply@chingbenessere.it>",
).strip()
_APP_URL = os.environ.get("APP_URL", "https://www.chingbenessere.it").rstrip("/")
_REPLY_TO = os.environ.get("RESEND_REPLY_TO", "").strip() or None

_resend = None
if _RESEND_KEY:
    try:
        import resend  # type: ignore
        resend.api_key = _RESEND_KEY
        _resend = resend
        logger.info("✅ Resend email service inizializzato (from=%s)", _FROM)
    except ImportError:
        logger.warning("RESEND_API_KEY presente ma pacchetto 'resend' non installato")
else:
    logger.info("RESEND_API_KEY non configurato — email transazionali in modalita' no-op")


def is_enabled() -> bool:
    """True se il servizio email e' realmente operativo."""
    return _resend is not None


# ──────────────────────────────────────────────────────────────────────
# Helpers di rendering
# ──────────────────────────────────────────────────────────────────────
_BASE_STYLES = """
  body { margin:0; padding:0; background:#F9F7F2; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; color:#2C2C2C; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 24px; }
  .card { background:#FFFFFF; border:1px solid #E5E0D8; border-radius:6px; padding:32px 28px; }
  h1 { font-family:Georgia,'Cormorant Garamond',serif; font-size:24px; margin:0 0 16px; color:#2C2C2C; letter-spacing:-0.01em; }
  h2 { font-family:Georgia,'Cormorant Garamond',serif; font-size:18px; margin:24px 0 8px; color:#2C2C2C; }
  p { line-height:1.6; margin:12px 0; font-size:15px; }
  .code { display:inline-block; font-family:'JetBrains Mono',Menlo,monospace; font-size:28px; letter-spacing:.25em; background:#F9F7F2; border:1px solid #D1CDC7; padding:14px 22px; border-radius:6px; color:#C44D38; font-weight:600; }
  .btn { display:inline-block; background:#C44D38; color:#F9F7F2; text-decoration:none; padding:12px 24px; border-radius:4px; font-weight:500; }
  .muted { color:#7a6f63; font-size:13px; }
  .divider { height:1px; background:#E5E0D8; margin:24px 0; border:0; }
  .footer { text-align:center; color:#9a8f80; font-size:12px; padding:24px 16px; }
  .logo { font-family:Georgia,serif; font-size:18px; color:#2C2C2C; margin-bottom:8px; }
  .ink { color:#C44D38; }
"""


def _wrap(title: str, body_html: str) -> str:
    """Skeleton HTML comune a tutte le email."""
    return f"""<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>{_BASE_STYLES}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="logo">☯ I Ching del Benessere</div>
      {body_html}
    </div>
    <div class="footer">
      I Ching del Benessere · <a href="{_APP_URL}" style="color:#7a6f63">{_APP_URL.replace('https://','')}</a><br>
      Per assistenza scrivici a <a href="mailto:amministrazione@innovatex.it" style="color:#7a6f63">amministrazione@innovatex.it</a>
    </div>
  </div>
</body>
</html>"""


def _plain(text: str) -> str:
    """Versione testo-piano (alcuni client preferiscono questa)."""
    return text.strip()


def _send(to: str, subject: str, html: str, text: str) -> bool:
    """
    Invia un'email tramite Resend. Restituisce True se accettato dal provider,
    False altrimenti. NON solleva eccezioni — l'invio email NON deve mai
    bloccare un'operazione utente.
    """
    if not _resend:
        logger.warning("Email skip (Resend off): to=%s subject=%s", to, subject)
        return False
    if not to or "@" not in to:
        logger.warning("Email skip (destinatario invalido): %r", to)
        return False
    try:
        payload = {
            "from": _FROM,
            "to": [to],
            "subject": subject,
            "html": html,
            "text": text,
        }
        if _REPLY_TO:
            payload["reply_to"] = _REPLY_TO
        result = _resend.Emails.send(payload)
        # resend python ritorna {"id": "..."}, oppure raise
        msg_id = (result or {}).get("id") if isinstance(result, dict) else None
        logger.info("📨 Email inviata to=%s subject=%r id=%s", to, subject, msg_id)
        return True
    except Exception as e:  # noqa: BLE001
        logger.warning("Email send fallito to=%s subject=%r err=%s", to, subject, e)
        return False


# ──────────────────────────────────────────────────────────────────────
# 1) Reset password — sostituisce il leak del codice nella JSON
# ──────────────────────────────────────────────────────────────────────
def send_password_reset(to: str, user_name: str, code: str, expires_minutes: int = 60) -> bool:
    """Invia il codice di reset password a 8 cifre."""
    subject = "Codice di reset password — I Ching del Benessere"
    html_body = f"""
      <h1>Hai chiesto di reimpostare la password</h1>
      <p>Ciao {user_name or 'amico'},</p>
      <p>Inserisci questo codice sulla pagina di reset per scegliere una nuova password. Il codice <strong>scade tra {expires_minutes} minuti</strong>.</p>
      <p style="text-align:center; margin:24px 0;">
        <span class="code">{code}</span>
      </p>
      <p style="text-align:center;">
        <a class="btn" href="{_APP_URL}/forgot-password">Apri la pagina di reset</a>
      </p>
      <hr class="divider">
      <p class="muted">Se non hai richiesto tu il reset, ignora questa email. Nessuna modifica al tuo account avviene finche' non usi il codice.</p>
      <p class="muted">Per la tua sicurezza non condividere mai questo codice con nessuno, nemmeno con chi dice di essere assistenza.</p>
    """
    text_body = _plain(f"""
Hai chiesto di reimpostare la password.

Codice di reset: {code}
Scadenza: {expires_minutes} minuti.

Apri la pagina di reset:
{_APP_URL}/forgot-password

Se non hai richiesto tu il reset, ignora questa email.
I Ching del Benessere
""")
    return _send(to, subject, _wrap(subject, html_body), text_body)


# ──────────────────────────────────────────────────────────────────────
# 2) Benvenuto dopo registrazione
# ──────────────────────────────────────────────────────────────────────
def send_welcome(to: str, user_name: str) -> bool:
    subject = "Benvenuto su I Ching del Benessere"
    html_body = f"""
      <h1>Benvenuto, {user_name or 'amico'}</h1>
      <p>Il tuo account e' stato creato con successo. Da ora puoi consultare l'oracolo e ricevere interpretazioni personalizzate del Libro dei Mutamenti.</p>
      <p style="text-align:center; margin:24px 0;">
        <a class="btn" href="{_APP_URL}/dashboard">Inizia il tuo viaggio</a>
      </p>
      <h2>Cosa puoi fare ora</h2>
      <p>• Consultare l'I Ching con il lancio interattivo delle 3 monete<br>
      • Esplorare la biblioteca con tutti i 64 esagrammi<br>
      • Seguire i percorsi guidati su Amore, Lavoro, Spiritualita'<br>
      • Quando vorrai approfondire, scegliere uno dei piani — anche il <strong>Gettone Prova a 1,99 €</strong> per provare tutto, una volta sola.</p>
      <hr class="divider">
      <p class="muted">Hai ricevuto questa email perche' hai creato un account su I Ching del Benessere. Se non sei stato tu, scrivici subito a amministrazione@innovatex.it.</p>
    """
    text_body = _plain(f"""
Benvenuto su I Ching del Benessere, {user_name}.

Il tuo account e' attivo. Inizia da: {_APP_URL}/dashboard

Hai ricevuto questa email perche' hai creato un account. Se non sei stato tu, scrivici a amministrazione@innovatex.it.
""")
    return _send(to, subject, _wrap(subject, html_body), text_body)


# ──────────────────────────────────────────────────────────────────────
# 3) Ricevuta pagamento — dopo Stripe checkout.session.completed
# ──────────────────────────────────────────────────────────────────────
def send_payment_receipt(
    to: str,
    user_name: str,
    plan_label: str,
    amount_eur: float,
    is_trial: bool = False,
    duration_days: int = 0,
    trial_credits: int = 0,
) -> bool:
    subject = "Ricevuta del tuo acquisto — I Ching del Benessere"
    if is_trial:
        what_html = f"<strong>{trial_credits} consultazioni</strong> complete con tutte le funzioni Premium sbloccate."
        what_txt = f"{trial_credits} consultazioni complete con funzioni Premium sbloccate."
    elif duration_days >= 365:
        what_html = f"Accesso illimitato per <strong>{duration_days} giorni</strong> (versione annuale)."
        what_txt = f"Accesso illimitato per {duration_days} giorni (versione annuale)."
    elif duration_days > 0:
        what_html = f"Accesso illimitato per <strong>{duration_days} giorni</strong> (versione mensile)."
        what_txt = f"Accesso illimitato per {duration_days} giorni (versione mensile)."
    else:
        what_html = "Accesso al servizio acquistato."
        what_txt = what_html

    html_body = f"""
      <h1>Grazie per l'acquisto, {user_name or 'amico'}</h1>
      <p>Il pagamento e' andato a buon fine. Ecco i dettagli:</p>
      <table style="width:100%; margin:16px 0; font-size:15px;">
        <tr><td style="padding:8px 0; color:#7a6f63;">Prodotto</td><td style="text-align:right; font-weight:500;">{plan_label}</td></tr>
        <tr><td style="padding:8px 0; color:#7a6f63;">Importo</td><td style="text-align:right; font-weight:500;" class="ink">€ {amount_eur:.2f}</td></tr>
        <tr><td style="padding:8px 0; color:#7a6f63;">Include</td><td style="text-align:right;">{what_html}</td></tr>
      </table>
      <p style="text-align:center; margin:24px 0;">
        <a class="btn" href="{_APP_URL}/dashboard">Vai alla dashboard</a>
      </p>
      <hr class="divider">
      <p class="muted"><strong>Diritto di recesso:</strong> hai 14 giorni dall'acquisto per esercitare il recesso (art. 52 Codice del Consumo). Puoi farlo dalla tua area abbonamento.</p>
      <p class="muted">Stripe ti invia separatamente la ricevuta fiscale dell'addebito.</p>
    """
    text_body = _plain(f"""
Grazie per l'acquisto, {user_name}.

Prodotto: {plan_label}
Importo: € {amount_eur:.2f}
Include: {what_txt}

Vai alla dashboard: {_APP_URL}/dashboard

Diritto di recesso: 14 giorni dall'acquisto (art. 52 Codice del Consumo).
""")
    return _send(to, subject, _wrap(subject, html_body), text_body)


# ──────────────────────────────────────────────────────────────────────
# 4) Conferma disdetta (senza rimborso) — l'utente disdice il rinnovo
# ──────────────────────────────────────────────────────────────────────
def send_subscription_cancelled(to: str, user_name: str, active_until: Optional[str]) -> bool:
    subject = "Abbonamento disdetto — I Ching del Benessere"
    until_txt = active_until[:10] if active_until and len(active_until) >= 10 else "fine periodo pagato"
    html_body = f"""
      <h1>Abbonamento disdetto</h1>
      <p>Ciao {user_name or 'amico'},</p>
      <p>Abbiamo ricevuto la tua richiesta di disdetta. Continuerai ad avere accesso completo a tutte le funzioni Premium fino al <strong>{until_txt}</strong>, dopo di che il tuo piano tornera' automaticamente a Free senza ulteriori addebiti.</p>
      <p>Se cambi idea, puoi riattivare l'abbonamento dalla tua area in qualsiasi momento.</p>
      <p style="text-align:center; margin:24px 0;">
        <a class="btn" href="{_APP_URL}/subscription">Gestisci il mio piano</a>
      </p>
      <hr class="divider">
      <p class="muted">Se ti serve aiuto, scrivici a amministrazione@innovatex.it — saremo felici di ascoltare i motivi della disdetta per migliorare il servizio.</p>
    """
    text_body = _plain(f"""
Abbonamento disdetto, {user_name}.

Manterrai l'accesso Premium fino al {until_txt}.
Poi tornerai al piano Free senza addebiti.

Gestisci: {_APP_URL}/subscription
""")
    return _send(to, subject, _wrap(subject, html_body), text_body)


# ──────────────────────────────────────────────────────────────────────
# 5) Recesso 14 gg — accesso revocato + rimborso in lavorazione
# ──────────────────────────────────────────────────────────────────────
def send_withdrawal_confirmed(to: str, user_name: str) -> bool:
    subject = "Recesso confermato — I Ching del Benessere"
    html_body = f"""
      <h1>Recesso esercitato correttamente</h1>
      <p>Ciao {user_name or 'amico'},</p>
      <p>Hai esercitato il diritto di recesso entro 14 giorni dall'acquisto (art. 52 Codice del Consumo). L'accesso Premium e' stato revocato immediatamente.</p>
      <p>Il rimborso verra' processato manualmente entro <strong>14 giorni lavorativi</strong>. L'importo tornera' sul metodo di pagamento usato per l'acquisto. Stripe ti invierà una notifica separata quando il rimborso e' completato.</p>
      <p>Se l'acquisto era un Gettone Prova e hai gia' consumato consultazioni, l'importo proporzionale alle consultazioni usate potra' essere trattenuto come previsto dalla legge.</p>
      <hr class="divider">
      <p class="muted">Per qualsiasi domanda sul rimborso, scrivici a amministrazione@innovatex.it citando l'email con cui hai acquistato.</p>
    """
    text_body = _plain(f"""
Recesso confermato, {user_name}.

Accesso Premium revocato. Rimborso entro 14 giorni lavorativi sul metodo di pagamento usato.

Per domande: amministrazione@innovatex.it
""")
    return _send(to, subject, _wrap(subject, html_body), text_body)
