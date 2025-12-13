# TypeScript as Your Safety Net

Why we insist on TypeScript:

- Catches shape mismatches early.
- Forces you to model your domain clearly.
- Makes refactors safer when using AI.

Principles:

1. **Type your domain first**
   - Entities
   - API inputs/outputs
   - Component props

2. **Narrow types, don't widen**
   - Prefer specific unions / enums over `string`.
   - Prefer `number` over `any`.

3. **Leverage inference**
   - Let TS infer return types from well-typed inputs.
   - Don't fight the type system; flow with it.

4. **When in doubt, ask the model:**
   > "Given this domain and these examples, propose strict but ergonomic TypeScript types for this feature."

Use TS as the guardrails so you can "vibe code" without silently creating landmines.
