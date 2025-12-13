# Frontend Stack Guide

This manual assumes a stack centered on:

- React
- Next.js (App Router)
- TailwindCSS
- One primary component library:
  - DaisyUI, or
  - MUI, or
  - shadcn/ui
- lucide-react for icons
- React Context for light global state

## General Rules

1. **One design system per app**
   - Choose a primary component library and stick to it.
   - Do not mix MUI + shadcn + DaisyUI randomly in the same view.

2. **Tailwind as the base**
   - Use Tailwind for spacing, layout, and simple styling.
   - Use the component library for complex interactive components (dialogs, dropdowns, tabs).

3. **Icons via lucide-react**
   - All icons come from lucide-react.
   - Create a `Icon` wrapper if needed to standardize size and color.

4. **React Context**
   - Use for:
     - theme
     - auth/user info
     - lightweight app-wide config
   - Avoid stuffing large data sets or deeply nested feature state into global context. Prefer local state or feature-specific hooks.

## Recommended Folder Structure

```text
src/
  app/             # Next.js routes
  components/
    ui/            # shared primitives (buttons, inputs, cards)
    layout/        # layout components (AppShell, Sidebar, Header)
    features/
      projects/
      auth/
      billing/
  lib/
    api/
    hooks/
    utils/
  context/
    theme-context.tsx
    auth-context.tsx
```

Use the prompts in `prompts/ui-stack-prompts.md` to keep component usage and styling consistent.
