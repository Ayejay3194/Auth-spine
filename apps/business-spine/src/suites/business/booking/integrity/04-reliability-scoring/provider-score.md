PROVIDER RELIABILITY SCORE (INTERNAL)
=====================================

Purpose: risk + quality control, not public shaming.

Signals:
- cancellation_rate
- lateness_rate
- no_show_rate
- dispute_rate
- payout_hold_rate
- manual_edit_rate (availability/booking edits)

Uses:
- throttle instant payouts
- require manager verification
- prioritize support monitoring
- trigger coaching prompts in ops dashboard

Output:
- score 0-100
- risk_band: low/med/high
- reasons list (top 3 drivers)
