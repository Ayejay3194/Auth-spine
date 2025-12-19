# PR Checklist (Anti-Vibe-Coding)

## Security (block merge if any are “no”)
- [ ] Auth required on sensitive/state-changing endpoints
- [ ] Authorization enforced server-side
- [ ] Input validation + output encoding
- [ ] No secrets in code, logs, client bundles
- [ ] Rate limiting on auth and abuse-prone endpoints

## Data integrity
- [ ] Transactions for multi-step writes
- [ ] Pagination on lists
- [ ] No N+1 queries on hot paths

## Reliability
- [ ] Errors handled (no silent catches)
- [ ] Idempotency for retries/webhooks

## UX
- [ ] Loading + error states exist
- [ ] Destructive actions confirm
