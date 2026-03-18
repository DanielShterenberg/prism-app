---
name: sync_hook_patterns
description: Patterns for implementing and testing the useSync hook and sync state machine
type: project
---

## useSync Implementation (issue #6)

**Files created:**
- `/hooks/useSync.ts` — full sync lifecycle hook
- `/components/SyncIndicator.tsx` — Hebrew status badge
- `/hooks/__tests__/useSync.test.ts` — 15 unit tests

**Key design decisions:**

1. `putAssessment` is exported separately from the hook so it can be unit-tested without mounting a React component (avoids needing @testing-library/react-hooks).

2. The hook is side-effect-only — it does not own assessment state. The caller stores Assessment in localStorage; the hook just drives syncStatus transitions and calls `onSyncStatusChange` after each outcome.

3. Retry queue is a `Set<string>` in a `useRef` — persistent across renders, not state (no re-render on queue changes).

4. Debounce uses a `useRef<ReturnType<typeof setTimeout>>` to hold the timer handle so it can be cleared on re-trigger.

**jsdom / Jest gotcha:**

- jsdom does NOT define the `Response` constructor. Do NOT use `new Response(body, { status })` in fetch mocks.
- Instead return a plain object shaped `{ ok: boolean }` — that's all `putAssessment` checks.
- Example: `global.fetch = jest.fn(async () => ({ ok: true })) as typeof fetch;`

**Test pattern for state machine without mounting a hook:**

Use a `runSyncCycle` helper in tests that replicates the syncAssessment logic (call `putAssessment`, handle success/failure, call mocked `updateAssessment`) — no React component needed.

**SyncIndicator Hebrew labels:**
- synced  → `נשמר ✓`
- pending → `מסנכרן...`
- error   → `שמור מקומית`

**Why:** Communicates that data is safe locally even in the error state. The error label avoids alarming the user.
