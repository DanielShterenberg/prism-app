---
name: API routes patterns
description: Conventions for Next.js App Router API routes in Prism, including auth stub, response envelope, and test setup
type: project
---

## API Route Conventions

**File structure:**
- `app/api/assessments/route.ts` — collection endpoints (GET list, POST create)
- `app/api/assessments/[id]/route.ts` — single-item endpoints (GET, PUT, DELETE)

**Response envelope:** All routes return `{ data, error }`. On success `error` is `null`. On failure `data` is `null` and `error` is a string.

**HTTP status codes used:**
- 200 — success
- 201 — POST create success
- 400 — invalid JSON body
- 401 — missing/malformed Authorization header
- 403 — record exists but belongs to a different userId
- 404 — record not found
- 500 — Prisma/unexpected error (logged with console.error, message hidden from client)

**Auth stub (`lib/auth.ts`):**
- `getUserId(req: NextRequest): string | null`
- Reads `Authorization: Bearer <token>`; returns the token string as userId (v1 stub — any non-empty token accepted)
- Returns `null` for missing or malformed headers → callers return 401

**Ownership check pattern (GET/PUT/DELETE by id):**
1. `findUnique({ where: { id } })` — 404 if null
2. Compare `existing.userId !== userId` — 403 if mismatch
3. Proceed with operation

**RouteContext params type (Next.js 15+):**
```ts
type RouteContext = { params: Promise<{ id: string }> };
// Usage: const { id } = await context.params;
```

## Testing API Routes

**Jest environment:** Use `@jest-environment node` docblock per file (API routes use `next/server` which doesn't work in jsdom).

**Mocking Prisma:**
```ts
const mockFindMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { assessment: { findMany: (...args) => mockFindMany(...args) } },
}));
// Import route handlers AFTER mocks
import { GET } from "../route";
```

**Making test requests:**
```ts
new NextRequest("http://localhost/api/assessments", {
  method: "GET",
  headers: { authorization: "Bearer tok1" },
});
```

**Params context in tests:**
```ts
const makeContext = (id: string) => ({ params: Promise.resolve({ id }) });
```

**Why:** The standard jest environment is jsdom (set globally in jest.config.ts for the localStorage tests). API route tests need Node. The `@jest-environment node` docblock overrides per-file without changing the global config.
