---
name: Prisma v7 setup patterns
description: How Prisma v7 is configured in this project — config file, schema, migrations, and client singleton
type: project
---

## Prisma v7 Configuration Style

Prisma v7 introduced `prisma.config.ts` instead of putting `url =` directly in the datasource block of `schema.prisma`. The datasource `url` is now set via `prisma.config.ts`:

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

The `schema.prisma` datasource block has no `url` field — that is intentional for v7.

## Generated Client

- Output: `lib/generated/prisma` (configured in `schema.prisma` generator block)
- Gitignored — regenerated automatically via `postinstall` npm script
- Run manually: `npm run db:generate` or `npx prisma generate`

## Migrations

- Migrations live in `prisma/migrations/` and MUST be committed to git
- The original `.gitignore` incorrectly excluded `prisma/migrations/` — fixed in #4
- Apply in prod/Railway: `npm run db:migrate` (`prisma migrate deploy`)
- Create new migration in dev: `npm run db:migrate:dev` (`prisma migrate dev`)

## PrismaClient Singleton (`lib/prisma.ts`)

Standard Next.js pattern to avoid exhausting connection pool during hot-reload:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: [...] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
```

## Schema Model

The `Assessment` model maps to the `assessments` table:
- `id`: UUID PK (`@default(uuid()) @db.Uuid`)
- `userId`: TEXT (`@map("user_id")`)
- `data`: JSON (`@db.JsonB`) — full Assessment TypeScript object stored here
- `createdAt`/`updatedAt`: TIMESTAMPTZ(6)
- `status`: TEXT default `'in_progress'`

**Why:** database schema mirrors the TypeScript `Assessment` type from `/types/assessment.ts`.
