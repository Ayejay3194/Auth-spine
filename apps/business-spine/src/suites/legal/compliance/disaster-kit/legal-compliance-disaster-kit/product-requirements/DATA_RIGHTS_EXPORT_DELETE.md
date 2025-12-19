# Product Requirements: Export + Delete

## Export
- Self-serve request, authenticated, rate-limited
- Includes profile, tenant membership, content, config
- Delivered as encrypted download or to customer storage
- Link expires (24-72h)
- Log request + fulfillment

## Delete (Account)
- Self-serve delete with confirmation
- Optional soft-delete window then hard delete
- Cascading deletion: DB + storage + caches + search index
- Backups expire per retention window (document this)
- Log deletion request + completion
