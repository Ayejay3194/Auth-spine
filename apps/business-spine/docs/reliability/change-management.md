CHANGE MANAGEMENT
=================

Rules:
- All risky changes behind feature flags
- All money-impacting changes require approval + decision log entry
- All schema changes require migration plan + rollback
- No “quick fixes” in prod without audit trail

Release checklist:
- Feature flags default OFF
- Staged rollout (internal -> beta -> all)
- Observability confirmed (dashboards + alerts)
