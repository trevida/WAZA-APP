# WAZA - AI WhatsApp Agent Platform for African Businesses

## Product Requirements Document (PRD)

### Vision
WAZA est une plateforme SaaS qui permet aux entreprises africaines de deployer des agents IA conversationnels sur WhatsApp.

### Entreprise
- **Nom** : Massudom Silicon Valley
- **Siege** : Bandjoun, Cameroun
- **Contact** : contact@waza.africa | +237 6 99 12 34 56

### Architecture Technique
- **Frontend** : React 18, Tailwind CSS, Zustand, React Query, Recharts, Shadcn UI, i18next (FR/EN)
- **Backend** : FastAPI, PostgreSQL (SQLAlchemy + Alembic), Redis, Celery, ReportLab (PDF), WebSocket, slowapi (Rate Limiting)
- **Deploiement** : Railway (Backend) + Vercel (Frontend)
- **IMPORTANT** : axios pince a 1.7.9 (sans ^) dans package.json — Vercel bloque sinon

---

## Implementation Status

### Phase 1-6 : Core (Auth, Dashboard, Admin, Legal, Demo, Email Verif, i18n) — COMPLETE
### Phase 7 : Analytics Avances — COMPLETE
### Phase 8 : Audit Log Admin — COMPLETE
### Phase 9 : Export PDF (ReportLab) — COMPLETE
### Phase 10 : WebSocket Conversations Temps Reel — COMPLETE
### Phase 11 : WAZA Grow — AI Facebook Ads Manager — COMPLETE
### Phase 12 : Traduction pages legales i18n (FR/EN) — COMPLETE
### Phase 13 : API Rate Limiting (slowapi) — COMPLETE

### Phase 14 : A/B Testing Broadcasts — COMPLETE (Feb 2026)
- [x] Model: ab_test_enabled, variant_b_template, variant_a/b_sent/delivered/replied, winner
- [x] Backend: Create A/B broadcast, validate variant_b required, stats with ab_test data
- [x] Frontend: 4-step wizard (Agent > Message+A/B > Audience > Send Mode)
- [x] A/B toggle with variant B textarea, 50/50 split info, summary preview
- [x] Stats panel with variant comparison and winner badge
- [x] Testing: 13/13 backend, 100% frontend — ALL PASSING

### Phase 15 : Broadcasts Programmes (Scheduling) — COMPLETE (Feb 2026)
- [x] Backend: scheduled_at validation (future only), status=scheduled on creation
- [x] Backend: cancel-schedule endpoint (back to draft), delete broadcast
- [x] Backend: BroadcastStatus.SENDING added
- [x] Backend: check_scheduled_broadcasts task (checks pending scheduled)
- [x] Frontend: Send mode step (now vs scheduled), datetime picker
- [x] Frontend: Scheduled badge, cancel action, broadcast list with all statuses
- [x] Testing: included in Phase 14 tests — ALL PASSING

---

## Prioritized Backlog

### P1 — Integrations reelles (necessitent cles API)
- [ ] Email verification reel (SMTP / SendGrid)
- [ ] WhatsApp Business API reel (remplacer mock)
- [ ] CinetPay/Flutterwave SDK reel
- [ ] Meta Marketing API reel pour WAZA Grow (actuellement MOCK)

### P2 — Futur
- [ ] Team collaboration (multi-users par workspace)

### Notes techniques
- WhatsApp send_message est MOCK
- Reply rate simulation est MOCK (20-40% aleatoire)
- Celery/Redis non disponibles — BackgroundTasks FastAPI utilise
- check_scheduled_broadcasts necessite un cron job ou Celery beat en production
