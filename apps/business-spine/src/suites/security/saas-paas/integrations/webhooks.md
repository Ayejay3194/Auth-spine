# Webhook security (platform)
- HMAC signatures + replay protection (timestamp + nonce)
- Per-tenant webhook secrets
- Per-tenant rate limits + delivery caps
- Retries with exponential backoff
- DLQ for failures
- Delivery logs visible to tenant admin (no payload secrets)
