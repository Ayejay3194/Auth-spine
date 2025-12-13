# Docker Dev Environment

This repo includes a simple `docker-compose.dev.yml` for running Postgres locally.

## Usage

From the repo root:

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

This will:

- start a local Postgres container
- expose it on `localhost:5432`
- create a database `app_db` with user/password `app` / `app`

Set your `.env` accordingly, for example:

```env
DATABASE_URL="postgresql://app:app@localhost:5432/app_db"
```

Then you can run:

```bash
npx prisma migrate dev
pnpm dev
```
