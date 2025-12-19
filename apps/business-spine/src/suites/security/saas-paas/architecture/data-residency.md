# Data residency & sovereignty (template)

## Tenant selectable regions
- region: US | EU | APAC
- residency enforced by:
  - DB location (or db-per-tenant)
  - storage bucket region
  - backups stored in-region
  - logs and analytics rules (no PII cross-region)

## Cross-region transfer controls
- replication only if tenant allows
- SCC/BCR documented for EU transfers
- explicit transparency: show data region in customer portal
