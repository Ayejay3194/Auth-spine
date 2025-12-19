# Secrets Management (Vault)
This repo supports Vault as an optional source of truth.

Env:
- VAULT_ADDR=https://vault.yourdomain.tld
- VAULT_TOKEN=...

Use:
- src/secrets/vault.ts -> readSecret("secret/data/app")

Recommendation:
- Store Stripe keys, JWT_SECRET/APP_SECRET, provider credentials in Vault.
- Inject into runtime via your deployment platform (not committed .env files).
