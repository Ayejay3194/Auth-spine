AVAILABILITY CONFLICT HARDENING
===============================

Common failures:
- two users book same slot concurrently
- staff edits availability while booking is in checkout
- timezone mismatch creates overlaps

Hardening:
- database-level unique constraint (provider_id + start_time)
- transactional booking creation
- idempotency keys for booking attempts
- lock window during checkout (temporary hold / soft lock)
- conflict detector job (sweeps for overlaps)

Resolution:
- auto-flag conflict -> admin alert
- suggested fixes:
  - move booking to nearest available slot
  - offer alternate provider
  - offer refund or credit
- admin override requires reason + audit log
