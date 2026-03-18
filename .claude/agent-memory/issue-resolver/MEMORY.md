# Issue Resolver Memory — Prism

## Memory Index

- [project_setup_learnings.md](project_setup_learnings.md) — Issues #1/#2: broken node_modules/.bin symlinks in worktree, jest config fixes, stacked PR pattern when dependencies aren't merged yet
- [localstorage_patterns.md](localstorage_patterns.md) — Issue #3: localStorage service patterns, key convention, graceful fallback approach
- [prisma_setup.md](prisma_setup.md) — Issue #4: Prisma v7 config style, migration workflow, client singleton pattern
- [api_routes_patterns.md](api_routes_patterns.md) — Issue #5: API route structure, { data, error } envelope, auth stub, test setup with @jest-environment node
- [sync_hook_patterns.md](sync_hook_patterns.md) — Issue #6: useSync hook design, jsdom fetch mock gotcha, state machine test pattern without React component

## Quick Reference

- localStorage key prefix: `prism:assessment:{id}`
- uuid v4 from the `uuid` npm package (already in dependencies)
- Tests live in `__tests__/` subdirectory next to the file under test
- Jest config: `testEnvironment: "jsdom"`, `preset: "ts-jest"`, path alias `@/` maps to project root
- API route tests need `@jest-environment node` docblock (jsdom breaks next/server)
- jsdom does NOT define `Response` constructor — use plain `{ ok: boolean }` objects in fetch mocks
- Issues completed: #2, #1, #3, #4, #5, #6, #7, #8 (new assessment modal), #9 (anamnesis shell), #10 (Block A), #15 (summary screen), #17 (iPad Safari optimization), #21 (privacy onboarding)
- Summary screen pattern: `buildBlockSummaries()` extracts non-empty fields per block using `nonEmpty()` helper; blocks with 0 fields are filtered out; assessment tools array joined as comma-separated string
- When patient name appears both in h1 header and as a block field value, use `getAllByText` or `getByRole('heading', {level:1})` in tests — `getByText` will throw on multiple matches
- Always mock `@/hooks/useSync` in page-level tests (it triggers network calls)
- Mark-as-completed flow: `updateAssessment(id, {status:'completed', syncStatus:'pending'})` → pass result to `setSyncSnapshot` → `useSync` handles cloud sync
- Hebrew block titles for summary: א — זיהוי מטופל, ב — רקע משפחתי, ג — רקע התפתחותי, ד — אבני דרך התפתחותיות, ה — מסגרות וטיפולים
- Block form pattern: component receives `assessment` + `onUpdate` prop; calls `updateAssessment(id, { identification: {...patch}, syncStatus: "pending" })` then passes result to `onUpdate()`; parent wires `useSync` with the snapshot
- Multi-select chips: render as `<button type="button" aria-pressed={selected}>` inside a `role="group"` container; toggle by filter/spread on the array field
- Expanding textarea: `resize-none overflow-hidden`, set `el.style.height = "auto"; el.style.height = el.scrollHeight + "px"` in both `onChange` and `onFocus`
- `identification` object in BlockA memoized with `useMemo(() => assessment.identification ?? {}, [assessment.identification])` to satisfy react-hooks/exhaustive-deps in `useCallback` that depends on it
- @testing-library/react and @testing-library/jest-dom are now installed (added in #7); setupFilesAfterEnv points to jest.setup.ts
- For cloud reconciliation in hooks, write missing records directly via localStorage.setItem with key `prism:assessment:{id}` rather than calling saveAssessment (which generates a new uuid)
- RTL logical CSS property: use `start-6` for FAB (not left/right), so it appears on the correct side in RTL
- Progress indicator counts filled blocks by checking if any field in each block is non-empty (arrays checked by length, strings checked by trim)
- Prisma v7 uses `prisma.config.ts` (not inline `url =` in schema.prisma datasource block)
- Generated Prisma client: `lib/generated/prisma` — gitignored, regenerated via `postinstall` hook
- Migrations: `prisma/migrations/` — must be committed to git (fixed gitignore in #4)
- PrismaClient singleton: `lib/prisma.ts` (dev hot-reload safe via globalThis)
- Auth stub: `lib/auth.ts` — getUserId(req) returns Bearer token string as userId, null if missing/malformed
- iPad Safari patterns: viewport Viewport export in layout.tsx (maximumScale:1, viewportFit:"cover"); safe-bottom/safe-top/safe-inline CSS classes use env(safe-area-inset-*); scrollIntoView({block:"nearest"}) on input focus for keyboard avoidance; scrollbar-none hides scrollbar while allowing scroll; jest.setup.ts guards scrollIntoView mock with typeof window check (API route tests use node env)
- Pre-existing lint errors: Input.tsx, Textarea.tsx, Modal.tsx all have Math.random in render — these are NOT new, do not waste time fixing them unless explicitly asked
- Branch management gotcha: git stash pop can end up on the wrong branch after checkout; always verify current branch with `git branch` after switching; use a fresh branch from origin/master to avoid mixing commits from different issues
