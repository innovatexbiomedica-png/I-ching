# I Ching del Benessere - PRD

## Original Problem Statement
Creare un sito di nome "I Ching del Benessere" basato sulla divinazione antica cinese. Il sito dovrà permettere agli utenti registrati di pagare un abbonamento mensile e consultare le proprie stese attraverso i lanci delle monete, con risposte elaborate da AI in modo naturale.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **AI**: Gemini 3 Flash via Emergent Integrations
- **Payments**: Stripe Checkout

## User Personas
1. **Spiritual Seeker**: Interested in divination and personal growth
2. **I Ching Enthusiast**: Familiar with the tradition, wants digital tool
3. **Curious Explorer**: New to I Ching, attracted by the interface

## Core Requirements (Static)
- [x] User registration with language selection (IT/EN)
- [x] JWT authentication
- [x] Monthly subscription (€9.99) via Stripe
- [x] I Ching consultation with manual coin input (6 tosses, values 6-9)
- [x] Hexagram calculation with moving lines
- [x] AI-powered interpretation (Gemini)
- [x] Consultation history
- [x] Minimalist Zen design

## What's Been Implemented (January 2026)
- [x] Landing page with zen aesthetic
- [x] User auth (register/login) with language selection
- [x] Dashboard with subscription status and recent consultations
- [x] Consultation page with coin toss input (6 lines)
- [x] I Ching calculation engine (64 hexagrams, moving lines, derived hexagram)
- [x] AI interpretation via Gemini 3 Flash
- [x] History page with consultation details
- [x] Pricing page with Stripe checkout
- [x] Multi-language support (IT/EN)
- [x] Payment success polling

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Core I Ching consultation flow
- [x] Subscription system
- [x] User authentication

### P1 (High Priority)
- [ ] Email confirmation on registration
- [ ] Password reset flow
- [ ] Subscription renewal reminders
- [ ] Better error handling on payment failures

### P2 (Medium Priority)
- [ ] Consultation PDF export
- [ ] Share consultation on social
- [ ] Admin dashboard for user management
- [ ] Analytics/usage tracking

### P3 (Low Priority)
- [ ] Multiple subscription tiers
- [ ] Community features (forums)
- [ ] I Ching educational content
- [ ] Mobile app (React Native)

## Next Tasks
1. Add email notifications for subscription
2. Implement password reset
3. Add more hexagram interpretations in database
4. Optimize AI prompts for better responses
