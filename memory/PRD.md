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
- **IMPORTANT** : axios pince a 1.7.9 (sans ^) dans package.json — Vercel bloque sinon

---

## Implementation Status

### Phase 1-6 : Core (Auth, Dashboard, Admin, Legal, Demo, Email Verif, i18n) — COMPLETE
### Phase 7 : Analytics Avances — COMPLETE
### Phase 8 : Audit Log Admin — COMPLETE
### Phase 9 : Export PDF (ReportLab) — COMPLETE
### Phase 10 : WebSocket Conversations Temps Reel — COMPLETE (Feb 2026)

### Phase 11 : WAZA Grow — AI Facebook Ads Manager — COMPLETE (Feb 2026)
- [x] Backend models: GrowSubscription, FacebookAdAccount, GrowCampaign, GrowWaitlist, FeatureFlag
- [x] Backend routes: /api/grow/* (feature-flags, waitlist, plans, subscribe, cancel, fb-account, campaigns, generate-creative, overview)
- [x] Admin routes: /api/admin/feature-flags (GET/PUT), /api/admin/waitlist, /api/admin/grow-stats
- [x] Frontend: GrowPricingPage (public /grow) — plans, waitlist, FAQ, "Comment ca marche"
- [x] Frontend: GrowOverview (/dashboard/grow) — stats dashboard, subscription check
- [x] Frontend: GrowCampaigns (/dashboard/grow/campaigns) — campaign list with status badges
- [x] Frontend: GrowCampaignNew (/dashboard/grow/campaigns/new) — 5-step wizard (Objectif, Audience, Budget, Creatif, Lancer)
- [x] Frontend: GrowCampaignDetail (/dashboard/grow/campaigns/:id) — stats, chart, AI recommendation, WhatsApp report
- [x] Frontend: GrowConnect (/dashboard/grow/connect) — mock Facebook OAuth connection
- [x] App.js routes wired for all Grow pages
- [x] DashboardLayout sidebar: conditional Grow nav (feature flag) + "Coming Soon" teaser
- [x] AdminSettingsPage: Feature Flags tab (grow_enabled/grow_beta toggles, Grow stats, waitlist mgmt)
- [x] LandingPage: WAZA Grow teaser banner + navbar link
- [x] adminService.js: getFeatureFlags, updateFeatureFlags, getGrowStats, getGrowWaitlist, notifyWaitlist, exportWaitlistCsv
- [x] growService.js: all API calls
- [x] Testing: 20/20 backend, 100% frontend — ALL PASSING

---

## Prioritized Backlog

### P1 — Prochaines
- [ ] Email verification reel (SMTP / SendGrid)
- [ ] WhatsApp Business API reel (remplacer mock)
- [ ] CinetPay/Flutterwave SDK reel
- [ ] Meta Marketing API reel pour WAZA Grow (actuellement MOCK)

### P2 — Futur
- [ ] Celery beat broadcasts programmes
- [ ] Traduction pages legales en anglais
- [ ] A/B testing broadcasts
- [ ] API rate limiting
- [ ] Team collaboration (multi-users par workspace)
