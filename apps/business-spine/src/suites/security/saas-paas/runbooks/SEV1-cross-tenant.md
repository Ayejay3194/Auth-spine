# SEV1: Cross-tenant exposure runbook
1) Contain
- Disable affected endpoint/feature flag
- Invalidate sessions for impacted tenants
- Block abusive API keys
2) Preserve evidence
- Snapshot logs, DB queries, audit logs
3) Assess
- Scope: which tenants, which data, duration
4) Remediate
- Fix tenant scoping + add tests + add DB RLS if missing
5) Notify
- Customer comms + regulatory if required
6) Postmortem
- Root cause, control improvements, follow-up owners
