---
name: localStorage service patterns
description: Patterns learned while implementing the offline persistence layer (issue #3)
type: project
---

## Key decisions

- Storage key: `prism:assessment:{id}` — prefix `prism:assessment:` lets `listAssessments` scan via `localStorage.key(i)` without polluting unrelated keys
- All public functions detect localStorage availability by doing a probe write in a try/catch. If unavailable, return `null` / `false` / `[]` immediately — never throw to callers.
- `saveAssessment` takes `Omit<Assessment, "id" | "createdAt" | "updatedAt">` so callers never supply those fields
- `updateAssessment` is a separate function (not exported in the issue spec but added as it's clearly needed) — merges partial data, preserves `id`/`createdAt`, bumps `updatedAt`
- `listAssessments` sorts by `updatedAt` descending; skips malformed JSON entries silently
- uuid v4 from the `uuid` package (already in `package.json`)

## Fallback test pattern

Replace `window.localStorage` with a throwing stub using `Object.defineProperty` in `beforeEach`, restore in `afterEach`. jsdom's localStorage is writable/configurable, so this works cleanly.

**Why:** Safari private mode and some embedded WebViews throw on any localStorage access. The fallback must be verified by tests, not just documented.

**How to apply:** Any future service that wraps a browser API should have a similar fallback suite.
