# Contributing Guide

This repo is structured as a full-stack SaaS starter. The goal of this guide is
to make it painless for new contributors to understand how to work inside it
without breaking core behavior.

## High-Level Rules

- Do not commit secrets (.env, API keys, etc.)
- Do not change database schema casually; always use Prisma migrations.
- Do not bypass validation and authorization layers.
- Prefer small, focused pull requests.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Node.js

## Branch & PR Workflow

1. Fork or create a feature branch from `main`.
2. Make your changes, keeping commits focused.
3. Run locally:
   - `pnpm lint`
   - `pnpm test` (if configured)
   - `pnpm build`
4. Open a pull request with:
   - a short summary
   - any schema changes noted explicitly
   - manual testing steps

## Code Style

- Use TypeScript everywhere.
- Keep types explicit at module boundaries.
- Use existing utility helpers (e.g. `cn`, shared components).
- Co-locate feature code (components, hooks, etc.) near its usage where possible.

## Database Changes

All schema changes must go through Prisma migrations:

1. Edit `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name descriptive_name`.
3. Commit:
   - updated `schema.prisma`
   - new migration folder

## Frontend

- Pages live in `app/`.
- Reusable components go in `components/`.
- Avoid heavy logic in React components; put it in `lib/` where possible.

## Backend

- Prefer server actions or route handlers under `app/api/`.
- Validate all input with Zod or a similar schema.
- Enforce workspace scoping and permissions in server-side code.

## Testing

- Add tests when adding or changing core behavior.
- Keep tests small and focused on one behavior per test.

This template is designed to be extended into many different products,
so keep abstractions generic and reusable where reasonable.
