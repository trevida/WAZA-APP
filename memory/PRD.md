# WAZA - AI WhatsApp Agent Platform for African Businesses

## Product Requirements Document (PRD)

### Vision
WAZA est une plateforme SaaS qui permet aux entreprises africaines de deployer des agents IA conversationnels sur WhatsApp pour automatiser les ventes, rappels, recouvrements et diffusions.

### Entreprise
- **Nom** : Massudom Silicon Valley
- **Siege** : Bandjoun, Cameroun
- **Contact** : contact@waza.africa | +237 6 99 12 34 56

### Architecture Technique
- **Frontend** : React 18, Tailwind CSS, Zustand, React Query, Recharts, Shadcn UI, i18next (FR/EN)
- **Backend** : FastAPI, PostgreSQL (SQLAlchemy + Alembic), Redis, Celery
- **Deploiement** : Railway (Backend) + Vercel (Frontend)

---

## Implementation Status

### Phase 1-4 : Backend + Frontend + Deploiement + Admin — COMPLETE
### Phase 5 : Pages Legales & Demo Interactive — COMPLETE
### Phase 6 : Demo Analytics — COMPLETE

### Phase 7 : Email Verification Mock (COMPLETE - Feb 2026)
- [x] Service email mock (logs verification URL dans backend console)
- [x] POST /api/auth/register envoie mock verification email
- [x] POST /api/auth/verify-email verifie le token
- [x] POST /api/auth/resend-verification renvoie un token
- [x] Frontend /verify-email page
- [x] Banner "email non verifie" sur LoginPage
- [x] Ecran "Verifie ton email" apres inscription

### Phase 8 : Multi-langue FR/EN (COMPLETE - Feb 2026)
- [x] i18next + react-i18next setup
- [x] Fichiers traduction /i18n/fr.json et /i18n/en.json
- [x] Composant LanguageToggle (FR/EN) avec localStorage persistence
- [x] Landing page traduite (hero, features, pricing, footer, nav)
- [x] Login, Register, ForgotPassword, VerifyEmail pages traduites
- [x] Dashboard sidebar traduit (navigation + toggle)
- [x] Test 100% frontend + 86% backend (demo user seed fix applied)

---

## Prioritized Backlog

### P1 — En cours
- [ ] Analytics avances (nouveaux graphiques: retention, conversion, top agents)
- [ ] Audit log admin (tracking actions + page /admin/audit-log)
- [ ] Export PDF rapports admin
- [ ] WebSocket conversations temps reel

### P2 — Futur
- [ ] Email verification reel (SMTP integration - remplacer mock)
- [ ] WhatsApp Business API reel (remplacer mock)
- [ ] CinetPay/Flutterwave reel (remplacer mock)
- [ ] Celery beat pour broadcasts programmes
- [ ] Traduction pages legales (privacy, terms, contact, about) en anglais
- [ ] A/B testing broadcasts
- [ ] API rate limiting
