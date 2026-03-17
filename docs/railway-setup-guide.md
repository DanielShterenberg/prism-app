# Railway + PostgreSQL Setup Guide

Do this once before the app can sync data to the cloud.

## Steps

### 1. Create the Railway project

1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project** → **Provision PostgreSQL**
3. Once provisioned, click the PostgreSQL service → **Variables** tab
4. Copy the `DATABASE_URL` value (it looks like `postgresql://postgres:...@...railway.app:5432/railway`)

### 2. Configure local environment

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway
```

### 3. Run the migration

```bash
npm run db:migrate
```

This applies `prisma/migrations/20260318000000_init/migration.sql` — creates the `assessments` table.

### 4. Verify

```bash
npx prisma studio
```

Opens a browser UI showing the empty `assessments` table. If you see it, you're good.

---

## Vercel environment variables

When you deploy to Vercel (issue #20), add `DATABASE_URL` to the Vercel project:

1. Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add `DATABASE_URL` with the same Railway value
3. Set it for **Production** + **Preview** environments

---

## Railway production tips

- Railway auto-restarts on crash — no extra config needed
- Enable **Private Networking** in Railway if you want the DB only accessible from Railway services (not required for v1)
- The free tier is sufficient for Ynam's usage in v1
