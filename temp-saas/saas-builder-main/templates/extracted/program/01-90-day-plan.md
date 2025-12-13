# 90-Day Execution Plan – From "I Kinda Code" to "I Ship"

Time assumption: ~2 hours/day, 5–6 days/week.

## Phase 1 (Days 1–14) – Environment & Starter App

Goals:
- Get your starter app running.
- Understand the layout of a Next.js + TypeScript project.

Tasks:
- Follow `setup/01-environment.md` and `setup/02-running-nextjs-app.md`.
- Open all folders and skim.
- Identify:
  - where pages live (`src/app/...`)
  - where components live (`src/components/...`)
  - where DB client lives (`src/lib/db.ts` or similar).

Deliverables:
- App runs locally.
- You can explain, out loud, what each main folder does.

## Phase 2 (Days 15–30) – CRUD + UI

Goals:
- Be able to add a new entity end-to-end.

Tasks:
- Add a new Prisma model: e.g. `Task`.
- Run migrations.
- Create:
  - list page for tasks
  - create form
  - detail view (optional).
- Use Tailwind and your chosen UI library (DaisyUI/MUI/shadcn) for styling.

Deliverables:
- One new working feature: CRUD for a simple entity.

## Phase 3 (Days 31–60) – AI-Driven Features

Goals:
- Learn to use GPT, chat.z.ai, and Claude as collaborators.

Tasks:
- Use GPT to ideate a feature (using the ideation + pre-code prompt).
- Generate TypeScript types and pre-code zip.
- Save to `docs/thinking-session-YYYYMMDD/`.
- Use chat.z.ai to build a manifest and structure.
- Use Claude/Cursor to implement that feature in your repo.

Deliverables:
- At least 2 features built via this workflow.
- A `docs/` folder full of thinking sessions and manifests.

## Phase 4 (Days 61–90) – Polish + Portfolio

Goals:
- Turn this from "practice" into "proof you can ship".

Tasks:
- Clean UI: consistent components, spacing, typography.
- Add a simple admin or settings page.
- Write a short README explaining what the app does.
- Deploy to Vercel or a similar platform.
- Take screenshots and record a short walkthrough video.

Deliverables:
- One live app URL.
- A Git repo with clean code.
- A simple portfolio page linking to your best work.
