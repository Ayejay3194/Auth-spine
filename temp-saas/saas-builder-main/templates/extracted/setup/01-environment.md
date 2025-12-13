# Environment Setup – From Zero to "I Can Run Code"

## 1. Install Node.js

- Go to the official Node.js site.
- Install the **LTS** (Long-Term Support) version.
- After install, run in a terminal:

```bash
node -v
npm -v
```

You should see versions, not errors.

## 2. Install a Package Manager (pnpm recommended)

In a terminal:

```bash
npm install -g pnpm
```

Check:

```bash
pnpm -v
```

## 3. Install Git

- Install Git for your OS.
- Check:

```bash
git --version
```

## 4. Install an Editor (VS Code or similar)

- Install VS Code.
- Add extensions:
  - TypeScript/JavaScript support (built-in)
  - ESLint
  - Tailwind CSS IntelliSense
  - Prisma (optional)

## 5. Optional: Database GUI

If you're using SQLite (common for starters):
- You can open the `.db` file with tools like DB Browser for SQLite.

For Postgres (later):
- Use a managed DB (Railway, Supabase) or local Postgres.
