# How To Run a Next.js + Prisma Starter App

Assume you have a repo with:

- `package.json`
- `prisma/schema.prisma`
- `src/app/...` (Next.js App Router)
- `.env.example`

## 1. Clone the Repo

```bash
git clone <your-repo-url>.git
cd <your-repo-folder>
```

## 2. Install Dependencies

Using pnpm (recommended):

```bash
pnpm install
```

If using npm:

```bash
npm install
```

## 3. Create `.env`

Copy the example:

```bash
cp .env.example .env
```

Edit `.env` and fill in:

- `DATABASE_URL` (for SQLite, something like `file:./dev.db`)
- Any API keys if present (Stripe, auth providers, etc.).

For the starter phase, you can leave Stripe and auth secrets as placeholders if not in use yet.

## 4. Run Prisma Migrations

For SQLite or Postgres, run:

```bash
pnpm prisma migrate dev --name init
```

This will:

- Create the database file (if SQLite).
- Apply schema to the DB.

If there's a seed script, run:

```bash
pnpm prisma:seed
```

or

```bash
pnpm prisma db seed
```

(depends on your `package.json` scripts).

## 5. Start the Dev Server

```bash
pnpm dev
```

Then open:

- `http://localhost:3000` in your browser.

If everything is fine, you should see the home page.

## 6. Basic Sanity Checks

- Go to `/dashboard` if it exists.
- Go to `/blog` or `/projects` pages if scaffolded.
- Try adding or editing something if there is a form.

If you hit errors:

- Check the terminal for stack traces.
- Read the message and file path.
- Fix missing env vars or typos.
