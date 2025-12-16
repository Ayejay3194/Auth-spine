SLOs & ALERTING
===============

Define SLOs (service level objectives) for:
- Payments: webhook success rate, charge success rate
- Scheduling: booking conflict rate, confirmation latency
- Payroll: run success, export success
- Admin: audit log write success

Alerting rules:
- Page for money failure, payroll failure, security breach signals
- Warn for slowdowns, elevated error rates
- Batch non-critical alerts (avoid alert fatigue)

Escalation:
- Sev1: Owner + on-call
- Sev2: Ops + owner
- Sev3: Async ticket
