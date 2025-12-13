# Step 2 – GLM / chat.z.ai: Index the Pre-Code Zip

Now you have:

- Product spec
- Formulas & TypeScript signatures
- A "pre-code zip" (folder tree + stubs)

Your goal with GLM / chat.z.ai:

- Understand and label the structure.
- Tag modules as ui/engine/infra.
- Suggest clean boundaries and placement.
- Point out where to keep logic isolated.

Use the prompt in `prompts/glm-zip-intake.md`, paste:

- The folder tree
- A few representative files (types, one component stub, one logic stub)

Ask it to output:

- A manifest (files + roles)
- Suggested directories (feature folders, ui, lib, etc.)
- Notes on:
  - what counts as "engine" (pure logic)
  - what counts as "view" (React components)
  - what counts as infra (auth, config, db).

This becomes your **plan** for the actual implementation.
