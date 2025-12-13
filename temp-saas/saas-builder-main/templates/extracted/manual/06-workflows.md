# End-to-End Workflow Recap

**Workflow: Idea → App**

1. GPT:
   - Product spec
   - Formulas
   - Types
   - Pre-code zip

2. Save to `docs/thinking-session-*`.

3. GLM/chat.z.ai:
   - Index & classify the pre-code zip
   - Output manifest + structure suggestions.

4. Editor + Claude/code:
   - Scaffold `.ts` / `.tsx` files
   - Implement logic & UI in small steps
   - Use refactor prompts to keep things clean.

5. Run, test, iterate.

Repeat per feature.
