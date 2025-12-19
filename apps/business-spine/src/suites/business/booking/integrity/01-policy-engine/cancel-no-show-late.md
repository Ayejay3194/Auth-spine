CANCELLATION / NO-SHOW / LATE POLICY ENGINE
==========================================

Goal: rules-driven policies, not hardcoded logic.

Policy inputs:
- service_type
- provider_id / location_id / tenant_id
- customer segment (new/returning/high-risk)
- booking lead time (hours before start)
- payment method + deposit status

Core policies:
- Cancellation windows (e.g., 48h/24h/12h/same-day)
- Late cancellation fee (flat or %)
- No-show fee (flat or %)
- Deposit retention rules
- Reschedule rules (counts as cancel? allowed window?)
- Grace periods (e.g., 10 min late tolerated)
- Staff payout handling on cancel/no-show (pay partial? none?)

Outputs:
- charge_action: none | partial | full | fee_only
- payout_action: hold | partial | none | normal
- customer_strike: +0/+1/+2
- message_templates: customer/provider/admin

Admin controls:
- policy editor per tenant
- effective date + versioning
- "preview impact" (simulate for a booking)
- approvals required for money-impacting changes

Audit:
- any policy change logs before/after + reason
