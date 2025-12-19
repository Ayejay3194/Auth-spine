AUDIT LOG SPEC
==============

Log these events at minimum:
- login/logout
- role changes
- exports
- refunds
- invoice edits
- payroll runs
- feature flag changes
- kill switches
- vendor bank detail changes

Fields:
- actor_id
- action
- resource_type/resource_id
- before/after (redacted for secrets)
- reason (required for sensitive)
- ip/user_agent
- timestamp
