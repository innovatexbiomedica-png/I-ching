# I Ching del Benessere - PRD

## Original Problem Statement
Creare un sito "I Ching del Benessere" basato sulla divinazione cinese + astrologia. L'utente ha richiesto:
1. Conversione in PWA / app mobile
2. Sblocco premium per tutti gli utenti (test)
3. Miglioramento qualita interpretazioni AI
4. Sfondo animato con arte cinese
5. Funzionalita Tema Natale completa con export PDF/DOCX/SVG
6. Logout mobile visibile

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI (PWA)
- **Backend**: FastAPI + MongoDB (motor)
- **AI**: Gemini 2.0 Flash via Emergent Integrations (EMERGENT_LLM_KEY)
- **Payments**: Stripe Checkout
- **Astrology**: Kerykeion + Swiss Ephemeris
- **Export**: ReportLab (PDF), python-docx (DOCX), CairoSVG (SVG->PNG)

## Core Requirements
- [x] User registration/login (JWT + Google OAuth)
- [x] I Ching consultation (coin toss, hexagram calc, AI interpretation)
- [x] Consultation history
- [x] Subscription system (Stripe) + auto-premium for testing
- [x] Tema Natale (natal chart) generation with Kerykeion
- [x] Interactive zodiac wheel (SVG)
- [x] AI interpretation of natal chart
- [x] Export: SVG download, PDF with chart image, DOCX editable
- [x] PWA (manifest, service worker)
- [x] Animated background (Chinese art)
- [x] Mobile navigation with logout
- [x] Multi-language (IT/EN)

## What's Been Implemented
- Landing page with zen aesthetic
- Auth (register/login/Google OAuth/password reset)
- Dashboard, consultation flow, history
- I Ching engine (64 hexagrams, moving lines, derived hexagram)
- Deep + Direct AI interpretation styles
- Natal chart generation, interactive SVG wheel
- AI interpretation of natal chart
- Export: SVG, PDF (with chart image + aspects), DOCX (editable, with chart image + aspects)
- PWA manifest + service worker
- Animated Chinese art background
- Mobile navigation with logout
- Auto-premium for all users (testing mode)

## Prioritized Backlog

### P0 - DONE
- [x] All three natal chart exports (SVG, PDF, DOCX) working correctly
- [x] Chart image visible in PDF and DOCX
- [x] Aspect names (planet1_name/planet2_name) correct in exports
- [x] DOCX download button added to frontend

### P1 (High Priority)
- [ ] Build nativi con Capacitor (iOS/Android)
- [ ] Email confirmation on registration
- [ ] Subscription renewal reminders

### P2 (Medium Priority)
- [ ] Notifiche Push (Firebase)
- [ ] Supporto Smartwatch
- [ ] Admin dashboard
- [ ] /api/personalized-advice endpoint fix (returns 500)

### P3 (Low Priority)
- [ ] Ottimizzazione UI Mobile (gesti, animazioni)
- [ ] Community features
- [ ] I Ching educational content

## Next Tasks
1. User verification of export features
2. Capacitor native build configuration
3. Fix /api/personalized-advice endpoint
