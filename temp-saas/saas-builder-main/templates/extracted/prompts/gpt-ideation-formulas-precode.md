# GPT Prompt – Product + Formulas + Pre-Code Zip

You are a product designer and senior TypeScript/React engineer.

Help me design and scaffold a new web app.

Context:
- Domain: [describe]
- Target users: [who]
- Primary outcome: [what they achieve]
- Tech stack:
  - React
  - Next.js
  - TypeScript
  - TailwindCSS
  - [DaisyUI / MUI / shadcn/ui] (choose one)
  - lucide-react for icons

Your tasks, in order:

1. Ask me up to 10 clarifying questions.
2. Then produce:
   - "Product Summary"
   - 3–7 "User Stories"
   - "Screens & Flows" (what each screen does).

3. Extract **formulas & core rules**:
   - describe each in plain language
   - then write TypeScript function signatures for them
   - optionally give the math expression if relevant.

4. Design **TypeScript types & interfaces** for:
   - main entities
   - important API payloads
   - key component props.

5. Generate a **pre-code zip**:
   - output a folder tree for `src/` (Next.js app router style)
   - for each file:
     - show content with imports
     - types/interfaces at top
     - stubbed functions/components with TODO comments
   - do NOT fully implement logic; this is scaffolding.

All code: TypeScript (`.ts`, `.tsx`).
