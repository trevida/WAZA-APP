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

### Phase 12 : Traduction pages legales i18n (FR/EN) — COMPLETE (Feb 2026)
- [x] Privacy, Terms, About, Contact — toutes traduites via react-i18next
- [x] LanguageToggle sur chaque page publique
- [x] fr.json et en.json mis a jour avec 150+ cles de traduction
- [x] Landing page Grow teaser i18n
- [x] Testing: 100% pass

### Phase 13 : API Rate Limiting (slowapi) — COMPLETE (Feb 2026)
- [x] slowapi integre dans FastAPI
- [x] auth/register: 5/min, auth/login: 10/min
- [x] auth/forgot-password: 3/min, auth/resend-verification: 3/min
- [x] demo/chat: 15/min, grow/waitlist: 5/min
- [x] Default: 120/min
- [x] GET /api/health retourne rate_limits
- [x] HTTP 429 retourne quand limite atteinte
- [x] Testing: 10/10 pass

---

## Prioritized Backlog

### P1 — Prochaines
- [ ] Email verification reel (SMTP / SendGrid)
- [ ] WhatsApp Business API reel (remplacer mock)
- [ ] CinetPay/Flutterwave SDK reel
- [ ] Meta Marketing API reel pour WAZA Grow (actuellement MOCK)

### P2 — Futur
- [ ] A/B testing broadcasts
- [ ] Celery beat broadcasts programmes
- [ ] Team collaboration (multi-users par workspace)
