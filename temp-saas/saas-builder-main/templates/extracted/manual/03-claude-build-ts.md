# Step 3 – Claude + Editor: Turn Pre-Code into Real TypeScript

At this stage:

- Types exist.
- Function signatures exist.
- Components are sketched.
- File tree is planned.

Now you:

- Open the repo in Windsurf or Cursor.
- Create files from the pre-code zip.
- Use Claude/code models to fill in implementations.

Guidelines:

1. **Always keep `.ts` / `.tsx`**
   - Do not downgrade to plain JS.
   - Ask Claude to keep types intact and expand them when beneficial.

2. **Work in small slices**
   - One feature at a time:
     - API function
     - data hook
     - component
     - route.

3. **Use the builder prompt** in `prompts/claude-builder.md`:
   - Paste relevant files.
   - Describe the next step.
   - Ask for a plan + changes, not a massive rewrite.

4. **Let TS protect you**
   - If types break, fix them first.
   - Treat TypeScript errors as guidance, not enemies.

Result: the skeleton from GPT turns into a functioning app without losing structure.
