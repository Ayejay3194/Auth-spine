Incidents Runbook
=================

Severity definitions
--------------------
critical: security breach, data loss, payment processing broken, production down
high: core path broken for many users, moderation failure, major performance regression
medium: partial outage, degraded performance, some users impacted
low/info: small bug, cosmetic, minor admin issue

Minimum incident packet
-----------------------
- timestamp range
- affected tenant(s)
- error fingerprints
- recent deploy hash
- audit IDs related to the issue
