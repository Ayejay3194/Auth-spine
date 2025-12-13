# AI Workflow Summary – GPT + chat.z.ai + Claude

## GPT (Idea + Pre-Code)

Use GPT to:

- Clarify product idea.
- Extract formulas and logic rules.
- Define TypeScript types and interfaces.
- Generate pre-code zip:
  - folder tree
  - file stubs
  - TODO comments.

## chat.z.ai / GLM (Structure & Indexing)

Use GLM to:

- Read the pre-code zip.
- Tag files (ui / engine / infra / shared).
- Suggest a clean folder structure.
- Identify pure logic vs UI modules.

## Claude / Code Model in IDE

Use Claude (inside Cursor/Windsurf) to:

- Turn pre-code stubs into real implementations.
- Refactor messy components.
- Extract hooks and utils.
- Maintain and improve TypeScript types.

Your brain remains the **director**.  
The models are just **workers** on the assembly line.
