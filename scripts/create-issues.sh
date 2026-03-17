#!/usr/bin/env zsh
# create-issues.sh — Creates all GitHub issues, labels, and milestones
# for Prism from docs/Prism_GitHub_Issues.md
#
# Prerequisites:
#   1. Install GitHub CLI: https://cli.github.com/
#   2. Authenticate: gh auth login
#   3. Run from repo root: zsh scripts/create-issues.sh
#
# The script is idempotent for labels/milestones (skips if they exist).
# Issues are always created — only run once!

set -eo pipefail

REPO="DanielShterenberg/prism-app"

echo "============================================="
echo "Prism — GitHub Issues Creator"
echo "============================================="
echo ""

# Verify gh is authenticated
if ! gh auth status &>/dev/null; then
  echo "ERROR: Not authenticated with GitHub CLI."
  echo "Run: gh auth login"
  exit 1
fi

echo "Authenticated with GitHub CLI."
echo "Target repo: $REPO"
echo ""

# --------------------------------------------------
# 1. Create Labels
# --------------------------------------------------
echo "--- Creating Labels ---"

typeset -A LABELS
LABELS=(
  setup      "0E8A16:Boilerplate and project initialization"
  infra      "1D76DB:Infrastructure, hosting, deployment"
  data       "5319E7:Data model, storage"
  offline    "F9D0C4:Local storage and offline behavior"
  sync       "E4E669:Cloud sync logic"
  backend    "D93F0B:API routes, database"
  api        "FBCA04:REST endpoints"
  core       "C5DEF5:Core system functionality"
  ui         "0075CA:Components and screens"
  form       "BFD4F2:Form fields and blocks"
  block      "D4C5F9:Specific anamnesis blocks"
  screen     "C2E0C6:Full page/screen"
  component  "E99695:UI component"
  design     "FEF2C0:Visual design system"
  ipad       "0052CC:iPad Safari optimization"
  web        "006B75:Desktop web"
  polish     "84B6EB:Polish and optimization"
  auth       "B60205:Authentication"
  deployment "E11D48:Hosting and CI/CD"
  legal      "FAD8C7:Privacy and compliance"
  ux         "F9A03F:UX work"
  qa         "0E8A16:Testing"
  "user-testing" "CCCCCC:Testing with Ynam"
  "post-mvp" "AAAAAA:Deferred — do not start until v1 ships"
  handwriting "8B5CF6:Apple Pencil / ML Kit work"
)

for label in ${(k)LABELS}; do
  IFS=':' read -r color description <<< "${LABELS[$label]}"
  if gh label create "$label" --repo "$REPO" --color "$color" --description "$description" 2>/dev/null; then
    echo "  Created label: $label"
  else
    echo "  Label already exists: $label (skipped)"
  fi
done

echo ""

# --------------------------------------------------
# 2. Create Milestones
# --------------------------------------------------
echo "--- Creating Milestones ---"

MILESTONES=(
  "M1: Setup & Infrastructure"
  "M2: Home Screen"
  "M3: Anamnesis Form"
  "M4: Summary & Completion"
  "M5: Design & Polish"
  "M6: Auth & Deployment"
  "M7: QA & Beta"
)

MILESTONE_DESCRIPTIONS=(
  "Project setup, data model, local storage, backend, cloud sync"
  "Assessment list and new assessment modal"
  "Block navigation shell and all 5 anamnesis form blocks"
  "Read-only summary screen and completion flow"
  "Design system, iPad Safari optimization, desktop layout"
  "Authentication and production deployment"
  "Privacy onboarding, user testing with Ynam"
)

typeset -A MILESTONE_IDS

for i in {1..${#MILESTONES[@]}}; do
  title="${MILESTONES[$i]}"
  desc="${MILESTONE_DESCRIPTIONS[$i]}"
  existing_id=$(gh api "repos/$REPO/milestones" --jq ".[] | select(.title == \"$title\") | .number" 2>/dev/null || true)
  if [ -n "$existing_id" ]; then
    echo "  Milestone already exists: $title (number: $existing_id)"
    MILESTONE_IDS["$title"]="$existing_id"
  else
    new_id=$(gh api "repos/$REPO/milestones" -f title="$title" -f description="$desc" --jq '.number' 2>/dev/null)
    echo "  Created milestone: $title (number: $new_id)"
    MILESTONE_IDS["$title"]="$new_id"
  fi
done

echo ""

# --------------------------------------------------
# 3. Create Issues
# --------------------------------------------------
echo "--- Creating Issues (23 total) ---"
echo ""

# Check if issues already exist
echo "Checking for existing issues..."
existing_count=$(gh issue list --repo "$REPO" --state all --limit 1000 --json title --jq 'length')
if [ "$existing_count" -ge 23 ]; then
  echo ""
  echo "WARNING: Found $existing_count existing issues in the repository."
  echo "This script will create 23 new issues. Do you want to continue? (y/N)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted. No issues created."
    exit 0
  fi
fi
echo ""

create_issue() {
  local num="$1"
  local title="$2"
  local labels="$3"
  local milestone_title="$4"
  local body="$5"

  local ms_num="${MILESTONE_IDS[$milestone_title]}"

  local label_arr=(${(s:,:)labels})
  local label_args=()
  for l in "${label_arr[@]}"; do
    label_args+=(--label "$l")
  done

  local url
  url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --milestone "$milestone_title" \
    "${label_args[@]}" \
    --body "$body" 2>&1)

  echo "  #$num: $title"
  echo "        -> $url"
}

# ========== M1: Setup & Infrastructure ==========

create_issue 1 \
  "Project setup: Next.js + TypeScript + Tailwind" \
  "setup,infra" \
  "M1: Setup & Infrastructure" \
  "$(cat <<'BODY'
## Description

Initialize the Next.js project with TypeScript, Tailwind CSS, RTL support, and the base folder structure.

## Acceptance Criteria

- [ ] `npx create-next-app --typescript`
- [ ] Tailwind CSS configured with RTL support (`tailwindcss-rtl` plugin)
- [ ] Folder structure: `/app`, `/components`, `/lib`, `/types`, `/hooks`
- [ ] ESLint + Prettier configured
- [ ] RTL direction: `dir="rtl"` on root `<html>`, Hebrew as default locale
- [ ] `npm run dev` runs a blank page with no errors
- [ ] Commit baseline to GitHub

## Dependencies

None
BODY
)"

create_issue 2 \
  "Data model: TypeScript types" \
  "data,infra" \
  "M1: Setup & Infrastructure" \
  "$(cat <<'BODY'
## Description

Define all TypeScript types for the Assessment data model as specified in PRD §7.

> **Note:** This is the foundational dependency — all other issues should wait for this before starting.

## Acceptance Criteria

- [ ] `types/assessment.ts` with the full `Assessment` interface and all sub-types (`identification`, `familyBackground`, `developmentalBackground`, `developmentalMilestones`, `frameworksAndTreatments`)
- [ ] `SyncStatus: 'synced' | 'pending' | 'error'`
- [ ] `AssessmentStatus: 'in_progress' | 'completed'`
- [ ] All types exported and usable across the project

## Dependencies

- #1
BODY
)"

create_issue 3 \
  "Local storage service (offline layer)" \
  "data,infra,offline" \
  "M1: Setup & Infrastructure" \
  "$(cat <<'BODY'
## Description

Build the local persistence layer that saves assessments to `localStorage` immediately on every change, before any cloud sync occurs.

## Acceptance Criteria

- [ ] `lib/localStorage.ts` with: `saveAssessment()`, `getAssessment()`, `listAssessments()`, `deleteAssessment()`
- [ ] Storage key convention: `prism:assessment:{id}`
- [ ] Auto-generate `id` (uuid), `createdAt`, `updatedAt` on create
- [ ] Graceful fallback if `localStorage` is unavailable (e.g. Safari private mode)
- [ ] Unit tests (Jest)

## Dependencies

- #2
BODY
)"

create_issue 4 \
  "Backend: PostgreSQL schema + Railway setup" \
  "backend,infra" \
  "M1: Setup & Infrastructure" \
  "$(cat <<'BODY'
## Description

Provision the PostgreSQL database on Railway and set up Prisma ORM with the initial schema migration.

## Acceptance Criteria

- [ ] PostgreSQL provisioned on Railway
- [ ] Schema:
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
- [ ] Prisma ORM set up with initial migration applied
- [ ] Environment variables: `DATABASE_URL` configured in Railway + `.env.local`
- [ ] `.env.example` template committed

## Dependencies

- #1
BODY
)"

create_issue 5 \
  "Backend: REST API routes" \
  "backend,api" \
  "M1: Setup & Infrastructure" \
  "$(cat <<'BODY'
## Description

Implement the REST API routes for assessment CRUD operations via Next.js API routes.

## Acceptance Criteria

- [ ] `GET /api/assessments` — list all assessments for the user
- [ ] `GET /api/assessments/:id` — get a single assessment
- [ ] `POST /api/assessments` — create a new assessment
- [ ] `PUT /api/assessments/:id` — update (full replace)
- [ ] `DELETE /api/assessments/:id` — delete
- [ ] All routes return `{ data, error }` envelope
- [ ] Auth header required (can be stubbed in v1 if auth not yet implemented)

## Dependencies

- #4
BODY
)"

create_issue 6 \
  "Cloud sync service (offline-first)" \
  "data,sync,core" \
  "M1: Setup & Infrastructure" \
  "$(cat <<'BODY'
## Description

Build the core sync engine that keeps local storage and the cloud API in sync. This is the heart of the offline-first architecture described in PRD §6.

## Acceptance Criteria

- [ ] `hooks/useSync.ts` — manages the full sync lifecycle
- [ ] On every local save: set `syncStatus = 'pending'`, queue a debounced (1 second) cloud `PUT`
- [ ] On success: set `syncStatus = 'synced'`, update `syncedAt`
- [ ] On failure: set `syncStatus = 'error'`, add to retry queue
- [ ] Retry triggers: `window focus`, `navigator.onLine` reconnect event
- [ ] Sync indicator UI: subtle badge — "Saved ✓" / "Syncing..." / "Offline — changes saved locally"
- [ ] Unit tests for sync state machine

## Dependencies

- #3, #5
BODY
)"

# ========== M2: Home Screen ==========

create_issue 7 \
  "Home screen: assessment list" \
  "ui,screen" \
  "M2: Home Screen" \
  "$(cat <<'BODY'
## Description

Build the home screen showing all assessments as cards, with status and progress indicators.

## Acceptance Criteria

- [ ] Grid/list of assessment cards
- [ ] Each card shows: patient name, assessment date, status badge (In Progress / Completed), progress indicator (e.g. "3 of 5 blocks")
- [ ] Empty state: "No assessments yet — click + to start"
- [ ] FAB or top-right button: "New Assessment"
- [ ] Sort: most recently updated first
- [ ] Loads from local storage first, then reconciles with cloud in the background
- [ ] RTL layout, Hebrew labels

## Dependencies

- #3, #6
BODY
)"

create_issue 8 \
  "New assessment modal" \
  "ui,screen" \
  "M2: Home Screen" \
  "$(cat <<'BODY'
## Description

A simple modal to create a new assessment with the minimum required info before entering the form.

## Acceptance Criteria

- [ ] Modal with 2 fields: patient name (required), assessment date (date picker, default today)
- [ ] Date format: DD/MM/YYYY
- [ ] "Start Assessment" button
- [ ] Creates `Assessment` object locally, syncs to cloud, navigates to anamnesis
- [ ] RTL layout, Hebrew labels

## Dependencies

- #3, #6, #7
BODY
)"

# ========== M3: Anamnesis Form ==========

create_issue 9 \
  "Anamnesis shell: block navigation" \
  "ui,component" \
  "M3: Anamnesis Form" \
  "$(cat <<'BODY'
## Description

The outer shell of the anamnesis screen: header, block tab bar, progress tracking, and finish button.

## Acceptance Criteria

- [ ] Header: patient name + assessment date
- [ ] Tab bar with 5 blocks: A זיהוי | B משפחה | C התפתחות | D אבני דרך | E מסגרות
- [ ] Active block indicator
- [ ] Completed blocks shown with a checkmark in the tab bar
- [ ] "סיום" (Finish) button → navigates to summary
- [ ] RTL layout

## Dependencies

- #2, #8
BODY
)"

create_issue 10 \
  "Block A: Patient identification" \
  "ui,form,block" \
  "M3: Anamnesis Form" \
  "$(cat <<'BODY'
## Description

Implement Block A — Patient Identification, the first section of the anamnesis form.

## Acceptance Criteria

- [ ] Fields: patient name, date of birth, educational framework, assessment date, assessment tools (multi-select chips), examiner, referral reason (textarea)
- [ ] Auto-save on every change (triggers sync hook from #6)
- [ ] Textarea expands dynamically as content grows
- [ ] Minimum font size: 16pt (prevents iPad Safari auto-zoom on focus)
- [ ] All labels and placeholders in Hebrew, RTL layout

## Dependencies

- #6, #9
BODY
)"

create_issue 11 \
  "Block B: Family background" \
  "ui,form,block" \
  "M3: Anamnesis Form" \
  "$(cat <<'BODY'
## Description

Implement Block B — Family Background.

## Acceptance Criteria

- [ ] Fields: father, mother, parent status, city, siblings, family diagnoses
- [ ] All fields are textarea or short text
- [ ] Same auto-save, font size, and RTL requirements as Block A (#10)

## Dependencies

- #9, #10
BODY
)"

create_issue 12 \
  "Block C: Developmental background" \
  "ui,form,block" \
  "M3: Anamnesis Form" \
  "$(cat <<'BODY'
## Description

Implement Block C — Developmental Background.

## Acceptance Criteria

- [ ] Fields: pregnancy, course of pregnancy, birth, medical procedures, breastfeeding, difficulties in first year
- [ ] Same auto-save, font size, and RTL requirements as Block A (#10)

## Dependencies

- #9, #10
BODY
)"

create_issue 13 \
  "Block D: Developmental milestones" \
  "ui,form,block" \
  "M3: Anamnesis Form" \
  "$(cat <<'BODY'
## Description

Implement Block D — Developmental Milestones. This block has a mixed layout: short age fields and longer textarea fields.

## Acceptance Criteria

- [ ] Short age fields (compact inline input): first words, word pairs, sentences, independent walking, bladder/bowel control
- [ ] Textarea fields: language regression, motor clumsiness, falls tendency, climbing, bike riding, eating, sleep, sensory regulation, emotional regulation
- [ ] Age fields rendered as a compact row (label + narrow input)
- [ ] Same auto-save, font size, and RTL requirements as Block A (#10)
- [ ] See PRD §8 for full field list

## Dependencies

- #9, #10
BODY
)"

create_issue 14 \
  "Block E: Frameworks & treatments" \
  "ui,form,block" \
  "M3: Anamnesis Form" \
  "$(cat <<'BODY'
## Description

Implement Block E — Frameworks & Treatments, the final anamnesis block.

## Acceptance Criteria

- [ ] Fields: educational frameworks, treatments, prior assessments, communication with treatment staff
- [ ] All fields are textareas
- [ ] Same auto-save, font size, and RTL requirements as Block A (#10)

## Dependencies

- #9, #10
BODY
)"

# ========== M4: Summary & Completion ==========

create_issue 15 \
  "Summary screen" \
  "ui,screen" \
  "M4: Summary & Completion" \
  "$(cat <<'BODY'
## Description

A read-only summary of the completed assessment, with options to mark as complete, edit, or export (disabled in v1).

## Acceptance Criteria

- [ ] Read-only view of all filled data, grouped by block (A–E)
- [ ] Empty fields are skipped — no blank labels shown
- [ ] "Mark as Completed" button → sets `status = 'completed'`, updates sync
- [ ] "Edit" button → navigates back to anamnesis
- [ ] "Export / Share" button → disabled with tooltip "Coming in v2"
- [ ] RTL layout

## Dependencies

- #9, #10, #11, #12, #13, #14
BODY
)"

# ========== M5: Design & Polish ==========

create_issue 16 \
  "Design system: colors, typography, components" \
  "ui,design" \
  "M5: Design & Polish" \
  "$(cat <<'BODY'
## Description

Establish the Prism design system as specified in PRD §2. Consistent visual language across all screens.

## Acceptance Criteria

- [ ] Tailwind config: primary Navy (`#1E3A5F` or similar), accent teal, neutral greys
- [ ] Typography: Inter (English) + system Hebrew fallback; scale: 12/14/16/20/24/32px
- [ ] Component library: Button, Input, Textarea, Badge, Card, Modal, Tabs
- [ ] Dark mode support via `prefers-color-scheme`
- [ ] Storybook or simple component preview page for visual reference

## Dependencies

- #1
BODY
)"

create_issue 17 \
  "iPad Safari optimization" \
  "ui,ipad,polish" \
  "M5: Design & Polish" \
  "$(cat <<'BODY'
## Description

Ensure the app feels native and comfortable on iPad Safari — the primary in-session device for Ynam.

## Acceptance Criteria

- [ ] Tested on iPad 11" and 12.9" (Safari)
- [ ] Viewport meta: `width=device-width, initial-scale=1, maximum-scale=1`
- [ ] No auto-zoom on input focus (all inputs have font-size ≥ 16pt)
- [ ] Touch targets minimum 44px on all interactive elements
- [ ] Keyboard avoidance: active field always visible above the on-screen keyboard
- [ ] Landscape mode: layout holds without breakage

## Dependencies

- #9, #10, #11, #12, #13, #14
BODY
)"

create_issue 18 \
  "Responsive layout: desktop" \
  "ui,web,polish" \
  "M5: Design & Polish" \
  "$(cat <<'BODY'
## Description

Optimize the layout for desktop browsers (Mac/PC) — Ynam's post-session environment.

## Acceptance Criteria

- [ ] Max content width ~900px, centered, generous padding
- [ ] Sidebar navigation on wide screens: assessment list on the left, content on the right
- [ ] Keyboard navigation: Tab through all fields in logical order
- [ ] Accessible labels (for screen readers)

## Dependencies

- #7, #9
BODY
)"

# ========== M6: Auth & Deployment ==========

create_issue 19 \
  "Authentication (Clerk or Auth.js)" \
  "auth,backend" \
  "M6: Auth & Deployment" \
  "$(cat <<'BODY'
## Description

Implement user authentication. v1 is single-user (Ynam) — no invite or signup flow needed yet.

## Acceptance Criteria

- [ ] Email + password login (magic link optional)
- [ ] User ID attached to all assessment records
- [ ] Protected routes: redirect to login page if unauthenticated
- [ ] Auth state persisted across sessions
- [ ] v1: no public signup — account created manually for Ynam

## Dependencies

- #5
BODY
)"

create_issue 20 \
  "Production deployment" \
  "infra,deployment" \
  "M6: Auth & Deployment" \
  "$(cat <<'BODY'
## Description

Deploy the full app to production: frontend on Vercel, backend + database on Railway.

## Acceptance Criteria

- [ ] Frontend on Vercel: GitHub repo connected, env vars set, preview deploys on PRs enabled
- [ ] Backend/DB on Railway: production environment, connection pooling configured
- [ ] Custom domain configured (TBD)
- [ ] Basic uptime monitoring (Railway built-in or UptimeRobot)
- [ ] End-to-end smoke test: create assessment, fill a block, verify cloud sync

## Dependencies

- #19
BODY
)"

# ========== M7: QA & Beta ==========

create_issue 21 \
  "Privacy disclaimer + onboarding screen" \
  "legal,ux" \
  "M7: QA & Beta" \
  "$(cat <<'BODY'
## Description

First-visit onboarding modal informing Ynam that his data is saved securely to the cloud.

## Acceptance Criteria

- [ ] Modal shown on first visit: "Prism שומר את הנתונים שלך בצורה מאובטחת לענן. הנתונים מוצפנים בזמן העברה ובמנוחה."
- [ ] `localStorage` flag: `prism:onboarding_complete` — modal does not appear again once dismissed
- [ ] "הבנתי, המשך" (Got it, continue) button
- [ ] RTL layout

## Dependencies

- #7
BODY
)"

create_issue 22 \
  "User testing with Ynam" \
  "qa,user-testing" \
  "M7: QA & Beta" \
  "$(cat <<'BODY'
## Description

Run a full end-to-end test session with Ynam on his iPad using a test assessment (not a real patient).

## Acceptance Criteria

- [ ] Full flow tested on iPad: create → fill all 5 blocks → summary → mark complete
- [ ] Test on both iPad 11" and Mac browser
- [ ] Collect feedback:
  - Font sizes comfortable?
  - Block navigation intuitive?
  - Auto-save reliable?
  - Anything missing or confusing?
- [ ] Feedback documented as new issues

## Dependencies

- #15, #17, #20
BODY
)"

# ========== Post-MVP (do not start until v1 ships) ==========

create_issue 23 \
  "Apple Pencil + Hebrew handwriting input" \
  "post-mvp,handwriting" \
  "M7: QA & Beta" \
  "$(cat <<'BODY'
## Description

> ⚠️ **Post-MVP — do not start until v1 ships.**

Research and implement Hebrew handwriting input via Apple Pencil for iPad in-session use.

## Background

Apple Scribble does not support Hebrew as of iPadOS 26. The only viable production-quality path is Google ML Kit Digital Ink Recognition (free, on-device, supports Hebrew via `he` BCP-47) paired with PencilKit stroke capture. This requires migrating key screens to React Native (Expo) with custom native Swift modules and EAS Build.

See PRD §11 for full technical details.

## Estimated Effort

XL — 2–3 sprints including native module, canvas UI, and accuracy testing with Ynam's handwriting.

## Pre-work Required

- [ ] Evaluate whether to extend the web app (limited — Web Ink API not mature on iPadOS) or migrate to React Native
- [ ] If React Native: `react-native-pencil-kit` for stroke capture + custom Expo native module wrapping ML Kit Digital Ink iOS SDK
- [ ] Test recognition accuracy with Ynam's own handwriting before committing
- [ ] EAS Build pipeline setup

## Dependencies

- v1 shipped and stable
BODY
)"

echo ""
echo "============================================="
echo "Done! Created 23 issues with labels and milestones."
echo "============================================="
