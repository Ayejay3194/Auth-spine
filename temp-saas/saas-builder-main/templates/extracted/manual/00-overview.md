# Vibe Coding: Overview (Extended)

Core loop:

1. **Think in GPT (Idea + Formulas + Pre-code)**
   - Use GPT to shape the product, data model, and core formulas.
   - Ask it for TypeScript interfaces, function signatures, and module layouts.
   - Have it output a "pre-code zip" (folder tree + file stubs) as text.

2. **Zip the Think Session**
   - Save GPT's outputs (spec, formulas, pre-code zip) into a single folder in your repo
     (e.g. `docs/thinking-session-YYYYMMDD/`).
   - This is your *blueprint zip*.

3. **Index with GLM / chat.z.ai**
   - Paste the pre-code zip (file tree + key files) into GLM/chat.z.ai.
   - Use it as a **zip librarian**:
     - classify files
     - tag modules (ui/engine/infra)
     - suggest clean structure and separation.

4. **Implement with Claude in Windsurf / Cursor**
   - Open the repo.
   - Use Claude/code to:
     - create real `.tsx` / `.ts` files from the pre-code stubs.
     - wire everything into a Next.js + Tailwind app.
     - keep the TypeScript types as the source of truth.

5. **Refine & Clean**
   - Use the refactor prompts to:
     - simplify components
     - extract hooks
     - align UI with DaisyUI/MUI/shadcn/ui + lucide-react
     - keep things modular and readable.

6. **TypeScript as a Safety Net**
   - All new modules should be `.ts` / `.tsx`.
   - Types first: sketch interfaces and function signatures before implementation.
   - Let the compiler and IDE catch mistakes early.

The rest of the manual details each phase, with prompts.
