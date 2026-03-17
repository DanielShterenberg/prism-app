# Prism — GitHub Issues Breakdown
### v1 MVP | March 2026

---

## 🏗️ Milestone 1 — Project Setup & Infrastructure

### Issue #1 — Project setup: Next.js + TypeScript + Tailwind
**Labels:** `setup`, `infra`
**Estimate:** S (2h)

- `npx create-next-app --typescript`
- Tailwind CSS configured with RTL support (`tailwindcss-rtl` plugin)
- Folder structure: `/app`, `/components`, `/lib`, `/types`, `/hooks`
- ESLint + Prettier
- RTL direction: `dir="rtl"` on root `<html>`, Hebrew as default locale
- Commit baseline to GitHub

---

### Issue #2 — Data model: TypeScript types
**Labels:** `data`, `infra`
**Estimate:** S (1h)

- Define `Assessment` type and all sub-types (see PRD §7)
- Define `SyncStatus: 'synced' | 'pending' | 'error'`
- Define `AssessmentStatus: 'in_progress' | 'completed'`
- Export from `/types/assessment.ts`

> This is the foundational dependency — all other issues should wait for this before starting.

---

### Issue #3 — Local storage service (offline layer)
**Labels:** `data`, `infra`, `offline`
**Estimate:** M (3h)

- `lib/localStorage.ts`: `saveAssessment()`, `getAssessment()`, `listAssessments()`, `deleteAssessment()`
- Storage key convention: `prism:assessment:{id}`
- Auto-generate `id` (uuid), `createdAt`, `updatedAt` on create
- Graceful fallback if localStorage unavailable (e.g. Safari private mode)
- Unit tests (Jest)

---

### Issue #4 — Backend: PostgreSQL schema + Railway setup
**Labels:** `backend`, `infra`
**Estimate:** M (3h)

- Provision PostgreSQL on Railway
- Schema:
  ```sql
  CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'in_progress'
  );
  ```
- Prisma ORM setup and initial migration
- Environment variables: `DATABASE_URL` in Railway + `.env.local`

---

### Issue #5 — Backend: REST API routes
**Labels:** `backend`, `api`
**Estimate:** M (3h)

Next.js API routes (or standalone Node on Railway):
- `GET /api/assessments` — list all for user
- `GET /api/assessments/:id` — get one
- `POST /api/assessments` — create
- `PUT /api/assessments/:id` — update (full replace)
- `DELETE /api/assessments/:id` — delete

All routes return `{ data, error }` envelope. Auth header required (stubbed in v1 if auth not yet implemented).

---

### Issue #6 — Cloud sync service (offline-first)
**Labels:** `data`, `sync`, `core`
**Estimate:** L (6h)

This is the core sync engine:
- `hooks/useSync.ts` — manages sync lifecycle
- On every local save: set `syncStatus = 'pending'`, queue a debounced (1 second) cloud PUT
- On success: set `syncStatus = 'synced'`, update `syncedAt`
- On failure: set `syncStatus = 'error'`, add to retry queue
- Retry on: window focus, reconnect event (`navigator.onLine`)
- Sync indicator UI: subtle badge — "Saved ✓" / "Syncing..." / "Offline — changes saved locally"
- Unit tests for sync state machine

---

## 🏠 Milestone 2 — Home Screen

### Issue #7 — Home screen: assessment list
**Labels:** `ui`, `screen`
**Estimate:** M (4h)

- Grid/list of assessment cards
- Each card: patient name, assessment date, status badge (In Progress / Completed), progress indicator (e.g. "3 of 5 blocks")
- Empty state: "No assessments yet — click + to start"
- FAB or top-right button: "New Assessment"
- Sort: most recently updated first
- Loads from local storage first, then reconciles with cloud in background

---

### Issue #8 — New assessment modal
**Labels:** `ui`, `screen`
**Estimate:** S (2h)

- Modal with 2 fields: patient name (required), assessment date (date picker, default today)
- "Start Assessment" button
- Creates Assessment object locally, syncs to cloud, navigates to anamnesis

---

## 📋 Milestone 3 — Anamnesis Form

### Issue #9 — Anamnesis shell: block navigation
**Labels:** `ui`, `component`
**Estimate:** M (3h)

- Header: patient name + assessment date
- Tab bar with 5 blocks: A Identification | B Family | C Development | D Milestones | E Frameworks
- Active block indicator
- Progress: completed blocks shown with a checkmark
- "Finish" button → navigate to summary

---

### Issue #10 — Block A: Patient identification
**Labels:** `ui`, `form`, `block`
**Estimate:** M (3h)

Fields: patient name, date of birth, educational framework, assessment date, assessment tools (multi-select chips), examiner, referral reason (textarea).

Requirements:
- Auto-save on every change (triggers sync hook from Issue #6)
- Textarea expands dynamically
- Font size 16pt minimum
- All labels and placeholders in Hebrew, RTL layout

---

### Issue #11 — Block B: Family background
**Labels:** `ui`, `form`, `block`
**Estimate:** S (2h)

Fields: father, mother, parent status, city, siblings, family diagnoses. All textarea or short text. Same requirements as Issue #10.

---

### Issue #12 — Block C: Developmental background
**Labels:** `ui`, `form`, `block`
**Estimate:** S (2h)

Fields: pregnancy, course of pregnancy, birth, medical procedures, breastfeeding, difficulties in first year.

---

### Issue #13 — Block D: Developmental milestones
**Labels:** `ui`, `form`, `block`
**Estimate:** M (3h)

Mix of short age fields (inline, narrow input) and textarea fields. Layout: age fields appear as a compact row with label + short input; textarea fields below. See PRD §8 for full field list.

---

### Issue #14 — Block E: Frameworks & treatments
**Labels:** `ui`, `form`, `block`
**Estimate:** S (2h)

Fields: educational frameworks, treatments, prior assessments, communication with treatment staff. All textareas.

---

## 📄 Milestone 4 — Summary & Completion

### Issue #15 — Summary screen
**Labels:** `ui`, `screen`
**Estimate:** M (3h)

- Read-only view of all filled data, grouped by block
- Skips empty fields (no blank labels shown)
- "Mark as Completed" button → updates status
- "Edit" button → back to anamnesis
- "Export / Share" button → disabled with tooltip "Coming in v2"

---

## 🎨 Milestone 5 — Design & Polish

### Issue #16 — Design system: colors, typography, components
**Labels:** `ui`, `design`
**Estimate:** M (4h)

- Tailwind config: primary Navy (`#1E3A5F` or similar), accent teal, neutral greys
- Typography: Inter (English) + system Hebrew fallback, scale: 12/14/16/20/24/32px
- Component library: Button, Input, Textarea, Badge, Card, Modal, Tabs
- Dark mode support via `prefers-color-scheme`
- Storybook or simple component preview page

---

### Issue #17 — iPad Safari optimization
**Labels:** `ui`, `ipad`, `polish`
**Estimate:** M (3h)

- Test on iPad 11" and 12.9" (Safari)
- Viewport meta: `width=device-width, initial-scale=1, maximum-scale=1`
- Prevent auto-zoom on input focus (font-size ≥ 16pt)
- Touch-friendly tap targets (min 44px)
- Keyboard avoidance: ensure active field is always visible above keyboard
- Landscape mode: verify layout holds

---

### Issue #18 — Responsive layout: desktop
**Labels:** `ui`, `web`, `polish`
**Estimate:** S (2h)

- Desktop: max content width ~900px, centered, generous padding
- Sidebar navigation on wide screens (assessment list left, content right)
- Keyboard navigation: Tab through fields, accessible labels

---

## 🔐 Milestone 6 — Auth & Deployment

### Issue #19 — Authentication (Clerk or Auth.js)
**Labels:** `auth`, `backend`
**Estimate:** M (4h)

- Email + password login (magic link optional)
- User ID attached to all assessment records
- Protected routes: redirect to login if unauthenticated
- v1: single user (Ynam) — no invite/signup flow needed yet

---

### Issue #20 — Production deployment
**Labels:** `infra`, `deployment`
**Estimate:** M (3h)

- Frontend on Vercel: connect GitHub repo, set env vars, enable preview deploys
- Backend/DB on Railway: production environment, connection pooling
- Custom domain (TBD — `prism.app` or similar)
- Basic uptime monitoring (Railway built-in or UptimeRobot)

---

## 🧪 Milestone 7 — QA & Beta

### Issue #21 — Privacy disclaimer + onboarding screen
**Labels:** `legal`, `ux`
**Estimate:** S (2h)

- First-visit modal: "Prism saves your data securely to the cloud. Data is encrypted in transit and at rest."
- localStorage flag: `prism:onboarding_complete`
- "Got it, continue" button

---

### Issue #22 — User testing with Ynam
**Labels:** `qa`, `user-testing`
**Estimate:** M (ongoing)

- Run through full flow with Ynam on iPad using a test assessment (not a real patient)
- Full flow: create → fill all 5 blocks → summary → mark complete
- Collect feedback:
  - Font sizes comfortable?
  - Block navigation intuitive?
  - Anything missing or confusing?
- Document feedback → new issues

---

## 🔮 Post-MVP (backlog — do not start until v1 ships)

### Issue #23 — Apple Pencil + Hebrew handwriting input
**Labels:** `post-mvp`, `handwriting`
**Estimate:** XL (3+ sprints)

Research summary: Apple Scribble does not support Hebrew (as of iPadOS 26). The only viable path is Google ML Kit Digital Ink Recognition (free, on-device, supports Hebrew via `he` BCP-47) paired with PencilKit stroke capture. Requires migrating to React Native (Expo) with custom native Swift modules and EAS Build. Expected integration effort: 2–3 sprints including native module, canvas UI, and accuracy testing with Ynam's handwriting.

See PRD §11 for full technical details before starting this work.

---

## 📊 Summary

| Milestone | Issues | Estimate |
|-----------|--------|----------|
| M1 — Setup & Infrastructure | #1–6 | ~18h |
| M2 — Home Screen | #7–8 | ~6h |
| M3 — Anamnesis Form | #9–14 | ~15h |
| M4 — Summary | #15 | ~3h |
| M5 — Design & Polish | #16–18 | ~9h |
| M6 — Auth & Deployment | #19–20 | ~7h |
| M7 — QA & Beta | #21–22 | ~4h+ |
| **Total** | **22 issues** | **~62h** |

---

## 🏷️ Labels

| Label | Description |
|-------|-------------|
| `setup` | Boilerplate and project initialization |
| `infra` | Infrastructure, hosting, deployment |
| `data` | Data model, storage |
| `offline` | Local storage and offline behavior |
| `sync` | Cloud sync logic |
| `backend` | API routes, database |
| `api` | REST endpoints |
| `ui` | Components and screens |
| `form` | Form fields and blocks |
| `block` | Specific anamnesis blocks |
| `screen` | Full page/screen |
| `design` | Visual design system |
| `ipad` | iPad Safari optimization |
| `web` | Desktop web |
| `auth` | Authentication |
| `deployment` | Hosting and CI/CD |
| `legal` | Privacy and compliance |
| `qa` | Testing |
| `user-testing` | Testing with Ynam |
| `post-mvp` | Deferred — do not start until v1 ships |
| `handwriting` | Apple Pencil / ML Kit work |

---

## 🔢 Recommended Start Order

**#2 → #1 → #3 → #4 → #5 → #6 → #7 → #10**

Start with the data model (#2), then project setup (#1), then local storage (#3) — these are the foundation. Then backend (#4, #5) and sync engine (#6). Once those are solid, home screen (#7) and the first form block (#10) give you something real to show Ynam.

---

*Generated March 2026 | Prism v1 MVP*
