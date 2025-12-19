Auth Runbook
============

Symptoms -> Checks -> Fixes

1) Users can't login
-------------------
Checks:
- Are auth env vars set?
- Are sessions expiring immediately?
- Are rate limits locking people out?
Fixes:
- Verify session secret + cookie domain
- Verify clock skew in prod
- Lower lockout aggressiveness if false positives

2) Password reset emails not arriving
-------------------------------------
Checks:
- Email provider status
- SPF/DKIM records
- Queue backlog
Fixes:
- Switch to backup sender
- Throttle retries
