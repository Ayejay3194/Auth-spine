TIMEZONE + DST SANITY LAYER
===========================

Rules:
- Store all times in UTC
- Store location timezone (IANA) on booking
- Render times in user timezone at display only
- Include timezone in all confirmations
- Validate DST transitions (skip/duplicate hours)

Tests:
- create booking across DST start/end
- validate reminders send at correct local time
- ensure calendar exports use correct timezone
