# SEV1: Webhook forgery (billing/integrations)
- Rotate webhook secrets (per tenant if applicable)
- Enforce signature verification + replay protection
- Review affected events + reconcile billing state
- Add WAF/rate limits on webhook endpoint
