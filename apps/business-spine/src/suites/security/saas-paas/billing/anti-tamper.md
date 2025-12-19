# Billing anti-tamper rules
- Never trust price/plan from client
- Server derives plan from subscription state
- Webhook is source-of-truth for payment state
- Use idempotency keys on subscription changes
- Log plan changes + actor + reason
- Reject proration calculations from client
