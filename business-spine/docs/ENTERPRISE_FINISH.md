# Enterprise Finish Pack (what you asked for)

## Password Auth + Sessions
- POST /api/auth/register
- POST /api/auth/login_password  (sets httpOnly session cookie)
- POST /api/auth/logout

Sessions are persisted in DB (Session table) and validated in middleware.

## MFA
- Still supported (TOTP + recovery codes)
- login_password requires MFA token if enabled

## CSRF
- GET /api/csrf returns token + sets HttpOnly cookie
- For cookie-session state-changing calls, include header: x-csrf-token

## Webhooks (real delivery)
- Register endpoint already exists
- Worker delivers webhooks with:
  - X-Webhook-Timestamp
  - X-Webhook-Signature (HMAC SHA256 over ts.body)

## Report Exports (real file output)
- POST /api/analytics/export queues a CSV build job
- Worker writes to /public/exports and returns URL
- POST /api/analytics/export/status returns {status,url}

## Terraform
- Minimal runnable AWS skeleton (S3 bucket for exports).
  Expand with VPC, RDS, Redis, and compute.

Run worker:
- npm run worker
