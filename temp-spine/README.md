# No‑LLM Business Assistant Spine (StyleSeat-ish, but deterministic)

This is a **rule-based, plugin-loaded assistant kernel** for running a service business:
booking, CRM, payments, marketing, analytics, ops, admin/security.

No large model. No vibes. Just:
- intent detection (patterns)
- entity extraction (regex + light parsing)
- slot-filling flows (ask only what’s missing)
- tools/adapters (DB, calendar, email, payments) behind interfaces
- policies + audit logging (every sensitive action recorded)

## What’s inside
- `src/core/` Orchestrator, intent router, flow runner, audit/policies
- `src/spines/*` Booking/CRM/Payments/Marketing/Analytics/Ops/Admin-Security
- `src/adapters/*` In-memory mock implementations (swap with real DB/services)
- `src/demo.ts` Example “chat/command palette” loop

## Quick start
```bash
npm i
npm run build
npm run dev
```

## How to wire this into a real app
1) Replace `src/adapters/*` with your Postgres/Prisma/etc.
2) Keep the interfaces in `src/core/types.ts` as your “contract”
3) Expose `orchestrator.handle(text, ctx)` from an API route or command palette UI

## Design rules
- Destructive actions require confirmation (`confirm: true`)
- Money/client data writes require permission + audit
- Flows ask for missing slots, then execute tools
- Everything returns **structured output** you can render in UI

## Safety / guardrails (practical ones)
- Role-based permissions
- Rate limiting hooks
- Step-up confirmations for money/refunds/deletes
- Tamper-evident audit chain option (hash linking)

Enjoy turning “run my business” into code instead of chaos.
