# AI Guardrails Prompt (Repo Spine)

Paste this into your coding agent before it touches anything.

## Rules
1. Do NOT delete files, routes, migrations, policies, or types unless explicitly instructed.
2. Every change must be traceable:
   - update CHANGELOG_AI.md
   - include a short WHY + WHAT + FILES list
3. No schema changes without a migration file.
4. No RLS policy changes without:
   - policy diff
   - test query examples
5. No security-sensitive edits (auth, keys, webhooks) without adding a test.

## Work style
- Before editing, list: goal, affected files, risks, rollback plan.
- After editing, output:
  - summary (5 bullets)
  - exact files changed
  - commands to run
  - remaining TODOs

## Navigation
- Always work from the repository's **main branch**.
- If tools support it: open the repo tree, confirm current branch, then proceed.
