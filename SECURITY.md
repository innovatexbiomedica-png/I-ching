# Security configuration & runbook

Tutta la configurazione che ha impatto di sicurezza, in un solo posto.

---

## 1. Environment variables obbligatorie su Render

Vai su Render → servizio `iching-backend` → tab **Environment**. Le seguenti
DEVONO essere settate altrimenti il backend rifiuta di avviarsi (o gli
endpoint sensibili rispondono 503):

| Variabile | Esempio / requisito | Come generarla |
|---|---|---|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/?...` | Dal cluster MongoDB Atlas |
| `DB_NAME` | `iching_db` | Dato |
| `JWT_SECRET` | almeno 32 byte random | `openssl rand -base64 48` |
| `ADMIN_SECRET` | almeno 32 byte random | `openssl rand -hex 32` |
| `STRIPE_API_KEY` | `sk_live_…` per prod / `sk_test_…` per staging | Dashboard Stripe → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Stripe → Webhooks → endpoint → Signing secret |
| `GEMINI_API_KEY` | `AIza…` | [console.cloud.google.com](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_ID` | `…apps.googleusercontent.com` | Google Cloud Console → OAuth |

## 2. Environment variables opzionali

| Variabile | Default | Effetto |
|---|---|---|
| `CORS_ORIGINS` | whitelist sicura (chingbenessere.it + Capacitor) | CSV di origini consentite |
| `ADMIN_EMAILS` | 3 email dell'owner | CSV di email che ottengono Premium automatico |
| `SENTRY_DSN` | (vuoto) | Se settato → ogni errore arriva su Sentry in tempo reale |
| `SENTRY_ENVIRONMENT` | `production` | Etichetta per filtrare ambienti |
| `RENDER` | settato auto da Render | Triggera modalità prod (JWT_SECRET obbligatorio) |
| `STRIPE_WEBHOOK_INSECURE` | (vuoto) | **MAI settare in prod** — bypassa verifica firma webhook, solo per testing locale con Stripe CLI |

## 3. Environment variables su Vercel (frontend)

| Variabile | Esempio | Note |
|---|---|---|
| `REACT_APP_BACKEND_URL` | `https://iching-backend-ac3n.onrender.com` | Già hardcoded come fallback |
| `REACT_APP_SENTRY_DSN` | (vuoto = disattivato) | Se settato → tracking errori React in produzione |
| `REACT_APP_SENTRY_ENVIRONMENT` | `production` | Etichetta filtro |

## 4. Genera nuovi segreti (one-shot)

```bash
# JWT_SECRET — chiave HMAC firma JWT (256 bit minimum)
openssl rand -base64 48

# ADMIN_SECRET — header X-Admin-Secret per /admin/* endpoints
openssl rand -hex 32

# Test rapido che siano abbastanza lunghi
echo -n "<INSERIRE_VALORE>" | wc -c   # deve essere ≥ 32
```

Mai committarli su git. Mai condividerli in chat.

---

## 5. Rotazione segreti (se compromessi)

Se sospetti che un segreto sia stato esposto:

1. **JWT_SECRET** → genera nuovo → aggiorna su Render → restart.
   Effetto collaterale: tutti gli utenti loggati vengono buttati fuori
   (i loro token vecchi non sono più validi). Comunica con `toast.error`
   "Sessione scaduta, accedi di nuovo".
2. **ADMIN_SECRET** → aggiorna su Render. Aggiorna il client admin (cosa
   sapeva la versione vecchia).
3. **STRIPE_API_KEY** → Stripe dashboard → roll → key nuova → Render →
   restart. Nessun effetto sull'utente finale.
4. **GEMINI_API_KEY** → Google Cloud → revoca → genera nuova → Render →
   restart.
5. **MONGO_URL password** → Atlas → Database Access → rotate user →
   aggiorna Render.

---

## 6. Hardening lato applicazione (già implementato)

- ✅ **JWT** HS256, scadenza 30 giorni, algorithm whitelist
- ✅ **Password** bcrypt 12 rounds (~250ms per hash)
- ✅ **Reset codes** 8 cifre, generati con `secrets.choice`, scadenza 1h
- ✅ **Rate limiting**: login 20/min, register 10/h, reset 5/h, verify 10/h,
   consultations 30/h
- ✅ **Stripe webhook signature** sempre verificata (refuse se manca env var)
- ✅ **CORS** whitelist concreta + headers limitati
- ✅ **Security headers**: HSTS 180gg, X-Frame-Options DENY, X-Content-Type-
   Options nosniff, Referrer-Policy strict-origin, Permissions-Policy che
   disabilita geo/cam/mic/payment API non usate
- ✅ **CSP frontend** via meta tag con whitelist (Google Sign-In, Stripe,
   Sentry, backend, fonts)
- ✅ **Admin endpoint** protetti da `X-Admin-Secret` con `hmac.compare_digest`
   (timing-safe)
- ✅ **GDPR**: consenso esplicito alla registrazione, audit trail (ip+ua),
   diritto di recesso 14 gg implementato

---

## 7. Cose non fatte e perché

| Item | Motivo |
|---|---|
| Upgrade CRA → Vite | 10 high vuln sono SOLO in deps build-time (nth-check, serialize-javascript, underscore) e non finiscono nel bundle servito al browser. Rischio runtime = nullo. Upgrade richiede 4-6h e test esaustivi. |
| MFA / 2FA | Non richiesto al lancio per consumer app. Implementabile in fase 2 (TOTP via authenticator app). |
| Captcha sul reset | Il rate limiting attuale (5/h per IP) copre il 99% degli abusi. Se diventa un problema, aggiungeremo hCaptcha. |
| WAF (Cloudflare) | Render sta dietro a una rete CDN/edge propria. Aggiungere Cloudflare gratuito davanti potrebbe dare bot protection in più — opzionale. |

---

## 8. Checklist pre-go-live (in ordine di blocco)

- [ ] Su Render: settare `JWT_SECRET` e `ADMIN_SECRET` con valori generati da `openssl rand`
- [ ] Su Render: `STRIPE_API_KEY` = sk_live_… (non sk_test_…)
- [ ] Su Render: `STRIPE_WEBHOOK_SECRET` = whsec_… del webhook **live**
- [ ] Su Stripe: creare webhook **live** che punta a `/api/webhook/stripe`
- [ ] Su Render: rimuovere `STRIPE_WEBHOOK_INSECURE` se mai settato
- [ ] Su Vercel: `REACT_APP_SENTRY_DSN` per attivare monitoring (opzionale ma raccomandato)
- [ ] Su Sentry: creare progetto React + progetto Python
- [ ] Test: registrazione → login → consultazione → acquisto trial €1,99 con carta vera (poi rimborso dal dashboard Stripe)
- [ ] Test: tentativo `/admin/reset-requests` senza header → deve restituire 403/503

---

🛡 **Domande?** Contatta lo sviluppatore prima di toccare le env vars.
