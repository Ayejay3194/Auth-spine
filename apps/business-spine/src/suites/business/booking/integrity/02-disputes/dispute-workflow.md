DISPUTE RESOLUTION WORKFLOW
===========================

States:
- opened
- evidence_collecting
- reviewing
- resolved_refund
- resolved_no_refund
- escalated_provider
- escalated_platform
- closed

Evidence bundle:
- booking record + version history
- message thread (timestamps)
- payment receipt + processor IDs
- service completion + hours verification
- policy evaluation output (what rule applied)
- screenshots/attachments

Rules:
- Opening a dispute auto-holds payouts
- Dispute SLA timers (e.g., respond within 48h)
- Escalations trigger admin notifications
- Resolution requires a reason code

Admin tools:
- dispute queue with filters (severity, amount, age)
- one-click: refund partial/full (logged)
- one-click: release payout (logged)
- template messages

Anti-abuse:
- rate limit disputes per user
- repeated disputes lower trust score
