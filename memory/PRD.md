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
- **Integrations** : Claude Sonnet 4.5 (Emergent LLM Key), Stripe (test), WhatsApp API (mock), CinetPay (mock)
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
- [x] FastAPI avec tous les routers (auth, workspaces, agents, contacts, conversations, broadcasts, analytics, billing, webhook)
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
- [x] Pages publiques : Login, Register, Forgot Password
- [x] Dashboard Layout avec sidebar navigation
- [x] 13 pages dashboard : Home, Agents, AgentNew, AgentEdit, Contacts, ContactsImport, Conversations, ConversationDetail, Broadcasts, BroadcastNew, Analytics, Billing, Settings, Onboarding

### Phase 3 : Deploiement (COMPLETE)
- [x] railway.json configure (Nixpacks, healthcheck, restart policy)
- [x] Procfile (web + worker)
- [x] vercel.json (SPA rewrites, cache headers)
- [x] CORS configure pour production (FRONTEND_URL + ENVIRONMENT)
- [x] DEPLOYMENT.md avec guide pas-a-pas
- [x] Variables d'environnement documentees

### Testing (COMPLETE)
- [x] Backend : 17/17 API endpoints testes et fonctionnels (100%)
- [x] Frontend : Toutes les pages chargent correctement (100%)
- [x] Test file : /app/backend/tests/test_waza_api.py
- [x] Test report : /app/test_reports/iteration_1.json

---

## Prioritized Backlog

### P0 (Must Have)
- All Phase 1-3 features DONE

### P1 (Should Have)
- [ ] Email verification flow (SMTP integration)
- [ ] WhatsApp Business API real integration (replace mock)
- [ ] CinetPay real integration (replace mock)
- [ ] Celery beat for scheduled broadcasts
- [ ] Real-time conversation updates (WebSocket)

### P2 (Nice to Have)
- [ ] Multi-language support (EN/FR toggle)
- [ ] Agent conversation analytics (sentiment, topics)
- [ ] Custom domain setup guide
- [ ] Mobile responsive optimizations
- [ ] Export data (CSV/PDF)
- [ ] Team collaboration (multiple users per workspace)
- [ ] A/B testing for broadcast messages
- [ ] API rate limiting
