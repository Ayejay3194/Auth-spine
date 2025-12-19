BOOKING CONFIRMATION INTEGRITY
==============================

Core idea:
- booking_id is immutable
- every change creates a new version record
- confirmation receipts are timestamped

Store:
- booking_v1 (original)
- booking_versions[] (diffs: time/service/provider/status)
- who changed it + why
- confirmation events (email/sms/push) w/ delivery status

Why:
- "I didn't book that" becomes trivial to resolve
- disputes have strong evidence
- audits become easy
