# WAZA - AI WhatsApp Agent Platform for African Businesses

## Product Requirements Document (PRD)

### Vision
WAZA est une plateforme SaaS qui permet aux entreprises africaines de deployer des agents IA conversationnels sur WhatsApp pour automatiser les ventes, rappels, recouvrements et diffusions.

### Personas
- **Entrepreneur africain** : Proprietaire de PME souhaitant automatiser la communication client via WhatsApp
- **Responsable commercial** : Gere les interactions clients et souhaite un assistant IA 24/7
- **Growth hacker** : Utilise les broadcasts et analytics pour optimiser les conversions

### Architecture Technique
- **Frontend** : React 18, Tailwind CSS, Zustand, React Query, Recharts, Shadcn UI
- **Backend** : FastAPI, PostgreSQL (SQLAlchemy + Alembic), Redis, Celery
- **Integrations** : Claude Sonnet 4.5 (Emergent LLM Key / standard Anthropic SDK fallback), Stripe (test, emergent/standard SDK fallback), WhatsApp API (mock), CinetPay (mock)
- **Deploiement** : Railway (Backend + PostgreSQL + Redis + Celery Worker) + Vercel (Frontend)

### Core Features
1. **Authentification** : Register, Login, Refresh Token, Forgot/Reset Password
2. **Workspaces** : CRUD, connexion WhatsApp Business
3. **Agents IA** : CRUD, 4 modules (sell/remind/collect/broadcast), test IA
4. **Contacts** : CRUD, import bulk, tags
5. **Conversations** : Liste, detail avec messages, fermeture
6. **Broadcasts** : Creation, envoi async, statistiques
7. **Analytics** : Vue d'ensemble, messages, conversions
8. **Facturation** : 4 plans (Free/Starter/Pro/Business), Stripe + CinetPay (mock)
9. **Webhook WhatsApp** : Reception et traitement des messages (mock)

### Plans Tarifaires
| Plan | Messages | Agents | Workspaces | Prix (FCFA) |
|------|----------|--------|------------|-------------|
| Free | 100 | 1 | 1 | 0 |
| Starter | 1,500 | 1 | 1 | 19,900 |
| Pro | 8,000 | 5 | 3 | 49,900 |
| Business | Illimite | Illimite | Illimite | 99,000 |

---

## Implementation Status

### Phase 1 : Backend (COMPLETE)
- [x] PostgreSQL + SQLAlchemy + Alembic migrations
- [x] FastAPI avec tous les routers (auth, workspaces, agents, contacts, conversations, broadcasts, analytics, billing, webhook, demo)
- [x] Claude AI integration via Emergent LLM Key
- [x] Stripe integration via emergentintegrations
- [x] WhatsApp API mock
- [x] CinetPay mock
- [x] Redis + Celery setup
- [x] JWT authentication + password hashing
- [x] Plan limits enforcement

### Phase 2 : Frontend (COMPLETE)
- [x] React 18 + Tailwind CSS + dark African theme (vert/marine/or)
- [x] Zustand state management (auth + workspace stores)
- [x] React Query pour les API calls
- [x] Landing page avec branding WAZA
- [x] Pages publiques : Login, Register, Forgot Password, Privacy, Terms, Contact, About
- [x] Dashboard Layout avec sidebar navigation
- [x] 13 pages dashboard

### Phase 3 : Deploiement (COMPLETE)
- [x] Dockerfile, railway.json, Procfile, vercel.json
- [x] CORS, DEPLOYMENT.md, variables d'environnement

### Phase 4 : Admin Dashboard (COMPLETE)
- [x] Backend : 11+ endpoints admin
- [x] Frontend : Overview, Users, Revenues, Workspaces, Settings (Payment Config)

### Phase 5 : Pages Legales & Demo Interactive (COMPLETE - Feb 2026)
- [x] Pages /privacy, /terms, /contact, /about en francais
- [x] Navbar et Footer mis a jour avec liens
- [x] Demo Interactive Modal WhatsApp avec IA Claude
- [x] Backend proxy /api/demo/chat

### Phase 6 : Demo Analytics (COMPLETE - Feb 2026)
- [x] Modele DemoSession (session_id, messages_count, first_message, timestamps)
- [x] Tracking automatique des sessions demo dans /api/demo/chat
- [x] Endpoint admin GET /api/admin/demo-stats (total, today, week, avg msg, daily chart, recent)
- [x] KPI "Demos jouees" (violet) sur Admin Overview
- [x] Graphique "Engagement Demo (14j)" avec barres + sessions recentes

---

## Prioritized Backlog

### P1 (Should Have)
- [ ] Email verification flow (SMTP integration)
- [ ] WhatsApp Business API real integration (replace mock)
- [ ] CinetPay real integration (replace mock)
- [ ] Flutterwave real SDK integration
- [ ] Celery beat for scheduled broadcasts
- [ ] Real-time conversation updates (WebSocket)

### P2 (Nice to Have)
- [ ] Multi-language support (EN/FR toggle)
- [ ] Agent conversation analytics (sentiment, topics)
- [ ] Mobile responsive optimizations
- [ ] Export data (CSV/PDF)
- [ ] Team collaboration (multiple users per workspace)
- [ ] A/B testing for broadcast messages
- [ ] API rate limiting
- [ ] Audit log for admin actions
- [ ] Advanced analytics dashboard
