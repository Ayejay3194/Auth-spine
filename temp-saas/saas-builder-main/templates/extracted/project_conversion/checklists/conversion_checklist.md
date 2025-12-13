# Project Conversion Checklist

A step-by-step roadmap to convert the generic template into a real production SaaS.

---

## Phase 0 – Lock the concept (2–3 decisions)

- [ ] Define **what this app is** in one line  
  > “This is a __________ for __________.”
- [ ] Define the **core entity/entities**  
  - e.g. `Project`, `Client`, `Reading`, `Session`, `Template`, `Job`
- [ ] Define the **core flow**  
  - New user → does X → sees Y → keeps coming back because Z

---

## Phase 1 – Boot the stack

- [ ] Create a new repo and drop the starter pack in
- [ ] Install dependencies  
  - `pnpm install` (or `npm install` / `yarn`)
- [ ] Copy `.env.example` → `.env` and fill:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - Email + Stripe config (even if dummy for now)
- [ ] Start a local Postgres instance
- [ ] Run Prisma:
  - `npx prisma migrate dev`
  - `npx prisma generate`
- [ ] Run dev server:
  - `pnpm dev`

---

## Phase 2 – Wire auth for real

- [ ] Add `app/api/auth/[...nextauth]/route.ts` with:
  - Email provider (magic link) and/or OAuth (e.g. Google)
- [ ] Use PrismaAdapter for NextAuth
- [ ] Add a helper such as:
  - `getCurrentUser()` or `getServerSession()` wrapper
- [ ] Protect dashboard routes:
  - all `(dashboard)` routes require an authenticated session
- [ ] Test flows:
  - sign up
  - sign in
  - access `/dashboard` when logged in
  - redirect to `/sign-in` when not

---

## Phase 3 – Model your actual data

- [ ] Add your own models to `prisma/schema.prisma`, e.g.:
  - `Project`, `Reading`, `Client`, `Session`, `Template`, etc.
- [ ] Tie them to `Workspace` if multi-tenant, for example:

  ```prisma
  model Project {
    id          String   @id @default(cuid())
    workspaceId String
    name        String
    status      String
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

    @@index([workspaceId])
  }
  ```

- [ ] Run:
  - `npx prisma migrate dev`

---

## Phase 4 – Build one real vertical slice

Pick **one core entity** (e.g. `Project`) and wire it fully end-to-end.

### Backend

- [ ] Create Zod schemas in `lib/validation/project.ts`:
  - `createProjectSchema`
  - `updateProjectSchema`
- [ ] Create server actions or route handlers:
  - `createProject`
  - `updateProject`
  - `deleteProject`
  - `listProjectsByWorkspace`
- [ ] Add workspace scoping:
  - queries always filter by `workspaceId`
- [ ] Add permission checks:
  - only workspace members can access
  - destructive actions restricted to `OWNER` / `ADMIN` where appropriate

### Frontend

- [ ] Add `app/(dashboard)/projects/page.tsx`:
  - fetch list of projects
  - render table / cards
- [ ] Add “Create Project” form:
  - modal or separate page
  - use `react-hook-form` + Zod resolver
- [ ] Add “Edit Project” support
- [ ] Add:
  - empty state (“No projects yet”)
  - visible error state on failures

Once one vertical slice works, you can clone the pattern for other entities.

---

## Phase 5 – Add billing (if you want money now)

If billing comes later, you can skip and return to this phase.  
If now, then:

- [ ] In Stripe Dashboard:
  - create `Pro Monthly` & `Pro Yearly` products
  - copy price IDs into `.env`:
    - `STRIPE_PRICE_PRO_MONTHLY`
    - `STRIPE_PRICE_PRO_YEARLY`
- [ ] Add API routes:
  - `/api/billing/checkout`:
    - creates Stripe Checkout session for a workspace
  - `/api/billing/portal`:
    - returns Stripe customer portal URL
- [ ] Add webhook route:
  - `/api/webhooks/stripe`:
    - listens for:
      - `checkout.session.completed`
      - `customer.subscription.updated`
      - `customer.subscription.deleted`
    - updates the `Subscription` record
- [ ] Update Billing UI:
  - show current plan & status
  - show upgrade/downgrade/cancel controls
  - “Upgrade” button → hits checkout route
- [ ] Add simple gating, e.g.:
  - Free: max 1 project
  - Pro: unlimited projects
  - Check subscription before `createProject`

---

## Phase 6 – Brand & polish

- [ ] Update `metadata` in `app/layout.tsx`
- [ ] Rewrite copy on:
  - marketing page
  - dashboard headers
  - auth pages
- [ ] Update `Sidebar`:
  - rename links to your actual sections
- [ ] Tweak Tailwind theme:
  - adjust color tokens in `globals.css` or Tailwind config
- [ ] Add logo & favicon to `public/`

Goal: a user should understand what the app does in ~5 seconds.

---

## Phase 7 – Safety & observability

- [ ] Create a simple `lib/logger.ts` (wrapper around console or a real logger later)
- [ ] Optionally add an `AuditLog` model:
  - user joined workspace
  - subscription changes
  - critical mutations
- [ ] Add `/api/health`:
  - checks DB connectivity
  - confirms required env vars are set
- [ ] Add tests for:
  - auth guard logic
  - workspace membership rules
  - one entity’s create/update/delete flow

This checklist is the baseline to go from “template” to “real SaaS” with minimal chaos.
