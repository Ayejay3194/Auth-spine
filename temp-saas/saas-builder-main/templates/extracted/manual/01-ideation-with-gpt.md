# Step 1 – Ideation and Product Shape (with a chat model)

Purpose:
Turn vague ideas into a concrete product spec with screens, flows, and data.

## Goals

- Clarify the problem, user, and outcome.
- Define the core entities and relationships.
- List key screens and what appears on each.
- Produce something you can hand to another model as "requirements".

## Recommended Prompt Template

Use this with a general-purpose chat model:

```text
You are a product designer and senior frontend engineer.

I want to design a new web app.

Context:
- Domain: [describe domain]
- Target users: [who they are]
- Primary goal: [what they want to achieve]
- Constraints: [desktop/mobile, auth/no auth, etc.]

Your job:
1. Ask me 5–10 focused questions to clarify the product.
2. Then propose:
   - A 1–2 sentence product description.
   - 3–6 core user stories in "As a [user], I want..." form.
   - A list of core screens, each with:
     - purpose
     - main components
     - key interactions.
3. Suggest a minimal MVP scope:
   - What to build first
   - What to defer
4. Output everything in clear sections.

Assume tech stack will be:
- React
- Next.js
- TailwindCSS
- One component library (DaisyUI, MUI, or shadcn/ui).
```

## Deliverables

By the end of this step you should have:

- Product description.
- MVP scope.
- Screen list.
- Initial entity list (e.g. User, Project, Task, etc.).

Save this into a file like `docs/product-spec.md` in your repo.
