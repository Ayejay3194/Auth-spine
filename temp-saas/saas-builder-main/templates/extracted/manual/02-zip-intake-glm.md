# Step 2 – Zip Intake & System Mapping (with GLM / chat.z.ai)

Purpose:
Use GLM / chat.z.ai as a librarian to understand existing zips or starters and map them into a structure you can build on.

## Workflow

1. Extract zip(s) locally.
2. Generate file trees (e.g. using `tree` or your IDE).
3. Copy-paste file trees + selected key files into GLM / chat.z.ai.
4. Use the "Zip Intake & Manifest" prompt (provided in `prompts/glm-zip-intake.md`).

## What you ask it to do

- For each zip:
  - Name
  - Purpose
  - Tags (engine/ui/infra/docs/other)
  - Important modules and what they export.
- Suggest where they should live in a future monorepo or app.
- Output a manifest you can store as `docs/manifest.md`.

Do not let it rewrite the core logic. This step is about understanding and organizing, not "improving".
