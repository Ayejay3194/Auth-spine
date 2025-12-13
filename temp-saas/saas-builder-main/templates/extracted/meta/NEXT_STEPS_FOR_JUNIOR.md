# Next Steps – If You Just Got This Zip

1. Install:
   - Node LTS
   - pnpm (or npm / yarn)
   - Git
   - VS Code / Cursor

2. Open `projects/simple-saas-nextjs` and run:

   ```bash
   pnpm install
   cp .env.example .env
   pnpm prisma:migrate
   pnpm dev
   ```

3. When the app is running, implement:

   - A `Project` list on the dashboard.
   - A "Create Project" form that saves to the DB.

4. Every session:
   - Keep messy notes.
   - Use the DevLog & Ticket Writer prompt to turn them into clean tasks.

If you can run, modify, and extend this app while explaining what you did,
you're not "learning to code" anymore. You're coding.
