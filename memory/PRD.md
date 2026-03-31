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
- **Backend** : FastAPI, PostgreSQL (SQLAlchemy + Alembic), Redis, Celery, ReportLab (PDF), WebSocket
- **Deploiement** : Railway (Backend) + Vercel (Frontend)

---

## Implementation Status — Tout COMPLETE

### Phase 1-6 : Core (Auth, Dashboard, Admin, Legal Pages, Demo Interactive, Email Verif, i18n)
### Phase 7 : Analytics Avances (conversion funnel, signup trend, heatmap, top agents, geo)
### Phase 8 : Audit Log Admin (tracking auto actions + page /admin/audit-log)
### Phase 9 : Export PDF (users + revenues reports via ReportLab)

### Phase 10 : WebSocket Conversations Temps Reel (COMPLETE - Feb 2026)
- [x] ConnectionManager (ws_manager.py) — gestion connexions par conversation et par user
- [x] WS /api/ws/conversations/{id} — messages temps reel + typing indicator
- [x] WS /api/ws/notifications/{user_id} — notifications globales
- [x] POST /api/conversations/{id}/simulate — simule message entrant + reponse IA
- [x] ConversationDetail mis a jour — merge API messages + WS live messages
- [x] Indicateur "en train d'ecrire..." avec animation
- [x] Badge WS connected/disconnected dans header conversation
- [x] Badge rouge compteur messages non lus dans sidebar Conversations
- [x] Auto-reconnexion WS (3s conversations, 5s notifications)
- [x] Test 100% backend (14/14) + 100% frontend

---

## Prioritized Backlog

### P1 — Prochaines
- [ ] Email verification reel (SMTP / SendGrid)
- [ ] WhatsApp Business API reel (remplacer mock)
- [ ] CinetPay/Flutterwave SDK reel

### P2 — Futur
- [ ] Celery beat broadcasts programmes
- [ ] Traduction pages legales en anglais
- [ ] A/B testing broadcasts
- [ ] API rate limiting
- [ ] Team collaboration (multi-users par workspace)
