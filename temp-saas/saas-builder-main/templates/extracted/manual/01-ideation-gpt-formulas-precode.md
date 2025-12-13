# Step 1 – GPT: Ideas, Formulas, and Pre-Code Zips

In this phase you are not "coding" yet. You're **thinking in public** with GPT and forcing clarity.

## Objectives

- Define the product and flows.
- Extract core **formulas** / rules / transformations.
- Design **TypeScript types** and interfaces for key entities.
- Generate a **pre-code zip**:
  - folder structure
  - file names
  - skeleton implementations and TODOs.

## Recommended Prompt Structure (to GPT)

Use this in chunks:

### 1. Product & Flows

Ask:

> Help me design a web app with this context:  
> - Domain: [describe]  
> - Users: [who]  
> - Primary outcome: [what they get]  
> Tech stack: React, Next.js, TypeScript, Tailwind, [DaisyUI/MUI/shadcn/ui], lucide-react.  
> 1. Ask me 5–10 questions.  
> 2. Then propose user stories, screens, and an MVP scope.

Once that exists, move to formulas.

### 2. Formulas / Core Logic

Ask:

> Now extract the core **formulas and logic** from this app idea.  
> For each key behavior or calculation:  
> - Describe it in plain language.  
> - Then write TypeScript function signatures for it.  
> - If relevant, express the formula mathematically.  
> Only define behavior, don't write full bodies yet.

Example output:

```ts
export type SubscriptionPlan = "free" | "pro" | "enterprise";

export function canCreateProject(
  plan: SubscriptionPlan,
  currentProjects: number
): boolean;

// rule: free <= 3 projects, pro <= 50, enterprise unlimited.
```

### 3. Types & Data Model

Ask:

> Based on the product and formulas, design TypeScript types & interfaces for:  
> - core entities  
> - API payloads  
> - key component props.  
> Output in a `types.ts` style and keep it strict.

### 4. Pre-Code Zip (Text Only)

Ask GPT:

> Now generate a **pre-code zip** for this app.  
> Output as a folder tree with file contents.  
> Constraints:  
> - Use TypeScript (`.ts`, `.tsx`).  
> - For each file, include:  
>   - imports  
>   - exported types/interfaces  
>   - stubbed functions/components with TODO comments  
> - No heavy implementation, just structured scaffolding.  
> 
> I want something I can paste into an editor to create the actual files.

Example (short):

```txt
src/
  app/
    layout.tsx
    page.tsx
    dashboard/page.tsx
  components/
    ui/button.tsx
    projects/project-list.tsx
  lib/
    types.ts
    permissions.ts
```

With each file shown as:

```ts
// src/lib/types.ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

## Save the Think Session

Take GPT's outputs and store them in your repo:

- `docs/thinking-session-YYYYMMDD/spec.md`
- `docs/thinking-session-YYYYMMDD/formulas.md`
- `docs/thinking-session-YYYYMMDD/precode-zip.txt`

This bundle is what you will feed into GLM/chat.z.ai next.
