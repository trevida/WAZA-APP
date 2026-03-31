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

## Implementation Status — ALL PHASES COMPLETE

### Phase 1-6 : Core (Auth, Dashboard, Admin, Legal, Demo, Email Verif, i18n) — COMPLETE
### Phase 7 : Analytics Avances — COMPLETE
### Phase 8 : Audit Log Admin — COMPLETE
### Phase 9 : Export PDF (ReportLab) — COMPLETE
### Phase 10 : WebSocket Conversations Temps Reel — COMPLETE
### Phase 11 : WAZA Grow — AI Facebook Ads Manager — COMPLETE
### Phase 12 : Traduction pages legales i18n (FR/EN) — COMPLETE
### Phase 13 : API Rate Limiting (slowapi) — COMPLETE
### Phase 14 : A/B Testing Broadcasts — COMPLETE
### Phase 15 : Broadcasts Programmes (Scheduling) — COMPLETE

### Phase 16 : Team Collaboration — COMPLETE (Feb 2026)
- [x] Model: WorkspaceMember (workspace_id, user_id, email, role, status, invite_token, invited_by)
- [x] Roles: owner (auto), admin, member
- [x] Invitation: POST /api/workspaces/{id}/members/invite (email + role, returns token)
- [x] Accept: POST /api/workspaces/invitations/{token}/accept
- [x] Update role: PUT /api/workspaces/{id}/members/{member_id}
- [x] Remove: DELETE /api/workspaces/{id}/members/{member_id}
- [x] My invitations: GET /api/workspaces/my-invitations
- [x] Workspaces list: includes owned + shared workspaces
- [x] Frontend: /dashboard/team page with members list, invite modal, role management
- [x] Sidebar: "Equipe" link between Analytics and Facturation
- [x] Protections: self-invite, duplicate, invalid role, admin-only actions
- [x] Testing: 16/16 backend, 100% frontend — ALL PASSING

---

## Prioritized Backlog

### P1 — Integrations reelles (necessitent cles API)
- [ ] Email verification reel (SMTP / SendGrid)
- [ ] WhatsApp Business API reel (remplacer mock)
- [ ] CinetPay/Flutterwave SDK reel
- [ ] Meta Marketing API reel pour WAZA Grow (actuellement MOCK)
- [ ] Email d'invitation reel (actuellement token retourne dans API, pas d'email envoye)

### Notes techniques
- WhatsApp send_message est MOCK
- Reply rate simulation est MOCK (20-40% aleatoire)
- Email invitations sont MOCK (token retourne, pas d'email)
- check_scheduled_broadcasts necessite un cron job en production
- workspace_members utilise VARCHAR pour role/status (pas de PostgreSQL enum)
