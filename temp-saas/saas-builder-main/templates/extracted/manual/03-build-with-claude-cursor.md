# Step 3 – Build and Refactor with Claude in Windsurf / Cursor

Purpose:
Use a code-focused model to generate, refactor, and maintain actual code in an IDE that understands the repo.

## Setup

- Open the repo in Windsurf or Cursor.
- Ensure TypeScript, Next.js, and Tailwind are already configured (or use the starter).
- Keep a `TODO.md` at the root listing features you want to implement.

## Typical Tasks for Claude / Code Model

- Scaffold new pages and layouts.
- Create React components that match the product spec.
- Wire data fetching hooks and server components.
- Refactor messy components into:
  - smaller components
  - custom hooks
  - utility modules
- Keep styling consistent using Tailwind + chosen component library.

Use the prompt templates in `prompts/claude-builder.md` and `prompts/refactor-cleanup.md` as a base.
Paste them directly into the IDE chat and customize per feature.
