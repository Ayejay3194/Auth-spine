Launch Runbook
==============

Before launch
-------------
- Run health checks
- Verify backups + restore test
- Verify auth rate limits
- Verify feature flags default safe
- Verify audit logging for sensitive actions

During launch
-------------
- Watch error tracking + uptime
- Watch queue backlogs (emails, jobs, moderation)
- Have rollback plan ready (flag off)
