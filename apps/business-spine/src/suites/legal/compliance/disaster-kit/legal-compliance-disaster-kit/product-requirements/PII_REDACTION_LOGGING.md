# Product Requirements: PII Redaction (Logs/URLs/Analytics)

## Logs
- Never log: passwords, tokens, auth codes, card data, full addresses, SSNs, DOB
- Mask: emails/phones where needed
- Structured logs with redaction middleware

## URLs
- No PII in paths or query strings
- Use opaque IDs (UUID/ULID)

## Analytics
- No raw PII
- Pseudonymous user IDs
- Consent gate where required + opt-out honored
