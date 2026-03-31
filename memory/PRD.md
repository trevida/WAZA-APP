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
- **Backend** : FastAPI, PostgreSQL (SQLAlchemy + Alembic), Redis, Celery, ReportLab (PDF)
- **Deploiement** : Railway (Backend) + Vercel (Frontend)

---

## Implementation Status

### Phase 1-6 — COMPLETE (Auth, Dashboard, Admin, Legal Pages, Demo, Email Verification, i18n FR/EN)

### Phase 9 : Analytics Avances (COMPLETE - Feb 2026)
- [x] GET /api/admin/analytics/advanced
- [x] Taux de conversion (Free vs Payants)
- [x] Taux de retention (utilisateurs actifs)
- [x] Tendance inscriptions 30j (AreaChart)
- [x] Funnel de conversion par plan (BarChart horizontal)
- [x] Activite par heure - heatmap (BarChart 24h)
- [x] Top agents par messages
- [x] Repartition geographique par pays
- [x] Page /admin/analytics avec KPIs + 6 graphiques

### Phase 10 : Audit Log Admin (COMPLETE - Feb 2026)
- [x] Modele AuditLog (admin_email, action, target_type, target_id, details, ip)
- [x] Tracking auto: suspend/reactivate user, plan change, delete user, payment config update, PDF export
- [x] GET /api/admin/audit-logs avec pagination + filtre par action
- [x] Page /admin/audit-log avec table, badges couleur, filtre, pagination
- [x] Navigation sidebar admin mise a jour

### Phase 11 : Export PDF (COMPLETE - Feb 2026)
- [x] GET /api/admin/export/users-pdf (ReportLab, table formattee)
- [x] GET /api/admin/export/revenues-pdf (MRR, distribution plans, transactions)
- [x] Bouton Export PDF sur page Utilisateurs admin
- [x] Bouton Export PDF sur page Revenus admin
- [x] Export cree automatiquement un audit log entry
- [x] Test 100% backend (29/29) + 100% frontend

---

## Prioritized Backlog

### P1 — Prochaines
- [ ] WebSocket conversations temps reel

### P2 — Futur
- [ ] Email verification reel (SMTP / SendGrid)
- [ ] WhatsApp Business API reel
- [ ] CinetPay/Flutterwave reel
- [ ] Celery beat broadcasts programmes
- [ ] Traduction pages legales en anglais
- [ ] A/B testing broadcasts
- [ ] API rate limiting
