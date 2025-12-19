Feature Flags Runbook
=====================

Rules
-----
- Every new feature ships behind a flag.
- Flags are tenant-scoped when relevant.
- Flag changes are audited.

Emergency rollback
------------------
1) Flip feature flag OFF for affected tenant(s)
2) Confirm health check
3) Open incident ticket with receipts
