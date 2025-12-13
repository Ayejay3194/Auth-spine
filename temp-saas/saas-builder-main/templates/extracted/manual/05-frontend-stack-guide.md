# Frontend Stack Snapshot

We build with:

- React
- Next.js (App Router)
- TailwindCSS
- One main component system (per app):
  - DaisyUI, or
  - MUI, or
  - shadcn/ui
- lucide-react for icons
- React Context for light global state

Rules:
- One primary component library per app.
- Tailwind for base layout/spacing.
- Component library for complex primitives (dialogs, menus, etc.).
- lucide-react for icons everywhere.

See `prompts/ui-stack-prompts.md` and `prompts/context-state-prompts.md` for enforcing this via AI.
