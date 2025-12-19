# Data Retention Policy (Template)

## Principles
- Keep only what we need
- Delete on schedule
- Prove deletion via logs/metrics
- Backups have a maximum life

## Retention table
| Data category | Examples | Retention | Deletion method |
|---|---|---:|---|
| Auth/account | email, MFA | until deletion + legal | hard delete + backup expiry |
| Product content | user uploads | contract term | delete + purge storage |
| Logs | request logs | 30-90 days | redact + rotate |
| Audit logs | admin actions | 1-7 years | immutable store + retention |

## Automation
Nightly job deletes expired records. Export/delete requests processed within [X] days.
