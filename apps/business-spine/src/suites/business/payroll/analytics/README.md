
# Ops Suite (V4) - HR + Payroll + Ops + Bookkeeping

V4 adds the "real bookkeeping" layers:
- Bank reconciliation + matching
- Recurring journal templates (manual run)
- Sales tax rate config (simple)
- Period close/lock (prevents postings)
- Attachments metadata for source docs
- Bank CSV paste-import (V1)

## Run
1) cp .env.example .env (set DATABASE_URL)
2) npm i
3) npm run db:push && npm run db:generate
4) npm run seed
5) npm run dev

## Demo auth (header)
x-user-email: admin@demo.com | hr@demo.com | payroll@demo.com | manager@demo.com | employee@demo.com | accountant@demo.com

## Bookkeeping pages
- /books/accounts
- /books/journal
- /books/invoices
- /books/bills
- /books/banking
- /books/reconcile
- /books/recurring
- /books/settings
- /books/reports


## Analytics
- /analytics (dash)
- /analytics/events
- /analytics/funnels
- /analytics/retention
- /analytics/performance
