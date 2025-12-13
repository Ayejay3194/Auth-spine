# App Conversion Guide

This guide explains *how* to use the starter + tools to go from
"generic SaaS shell" to "specific, shippable product".

It follows the same phases as the checklist:

- Phase 0: Decide what the app is and who it's for.
- Phase 1: Boot the stack and confirm the starter runs.
- Phase 2: Wire real auth so users and sessions are real.
- Phase 3: Extend the Prisma schema with your actual domain models.
- Phase 4: Build one complete vertical slice (list + create + edit + delete).
- Phase 5: Add billing if you want to charge money now.
- Phase 6: Brand + UX polish.
- Phase 7: Safety + observability.

Use:
- `conversion_checklist.md` as your tactical to-do list.
- `master_prompt.txt` inside Cursor / Claude when you want a "senior engineer"
  to take the next structural steps for you inside the codebase.
- The CLI and recipes in this pack to automate repetitive steps.
