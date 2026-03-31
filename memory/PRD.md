# WAZA - AI WhatsApp Agent Platform for African Businesses

## Product Requirements Document (PRD)

### Vision
WAZA est une plateforme SaaS qui permet aux entreprises africaines de deployer des agents IA conversationnels sur WhatsApp pour automatiser les ventes, rappels, recouvrements et diffusions.

### Entreprise
- **Nom** : Massudom Silicon Valley
- **Siege** : Bandjoun, Cameroun
- **Contact** : contact@waza.africa | +237 6 99 12 34 56

### Personas
- **Entrepreneur africain** : Proprietaire de PME souhaitant automatiser la communication client via WhatsApp
- **Responsable commercial** : Gere les interactions clients et souhaite un assistant IA 24/7
- **Growth hacker** : Utilise les broadcasts et analytics pour optimiser les conversions

### Architecture Technique
- **Frontend** : React 18, Tailwind CSS, Zustand, React Query, Recharts, Shadcn UI
- **Backend** : FastAPI, PostgreSQL (SQLAlchemy + Alembic), Redis, Celery
- **Integrations** : Claude Sonnet 4.5 (Emergent LLM Key / standard Anthropic SDK fallback), Stripe (test), WhatsApp API (mock), CinetPay (mock)
- **Deploiement** : Railway (Backend) + Vercel (Frontend)

### Plans Tarifaires
| Plan | Messages | Agents | Workspaces | Prix (FCFA) |
|------|----------|--------|------------|-------------|
| Free | 100 | 1 | 1 | 0 |
| Starter | 1,500 | 1 | 1 | 19,900 |
| Pro | 8,000 | 5 | 3 | 49,900 |
| Business | Illimite | Illimite | Illimite | 99,000 |

---

## Implementation Status (Tout COMPLETE)

### Phase 1-3 : Backend + Frontend + Deploiement — COMPLETE
### Phase 4 : Admin Dashboard — COMPLETE
### Phase 5 : Pages Legales & Demo Interactive — COMPLETE
### Phase 6 : Demo Analytics (compteur demos admin) — COMPLETE

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
- [ ] Support multi-langue FR/EN
- [ ] Audit log admin
- [ ] Export PDF rapports
- [ ] Analytics avances
- [ ] WebSocket conversations temps reel
- [ ] Agent conversation analytics (sentiment, topics)
- [ ] Team collaboration (multiple users per workspace)
- [ ] A/B testing for broadcast messages
- [ ] API rate limiting
