# Prism — CLAUDE.md

## Project Overview

Prism is a web-based ASD (Autism Spectrum Disorder) assessment app for clinical psychologist Ynam. It replaces paper-based assessment forms with a digital tool that feels like a doctor's notepad.

**v1 scope:** Anamnesis only — a structured parent interview form (5 blocks). See `docs/Prism_PRD_v0.3.md` for full context.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | Node.js API routes (Next.js) |
| Database | PostgreSQL on Railway via Prisma ORM |
| Frontend hosting | Vercel |
| Auth | TBD — Clerk or Auth.js |

## Key Architecture Decisions

- **Offline-first:** Save to `localStorage`/IndexedDB immediately, sync to cloud debounced at 1s. Never block the user on network. See PRD §6.
- **Sync states:** `synced` | `pending` | `error` — always visible in the UI.
- **Single user (v1):** No multi-user, no roles. Built for Ynam only.
- **Web-first:** No native app. iPad Safari + desktop browser.

## Critical UX Constraints

- **Hebrew/RTL:** All UI is Hebrew, RTL layout. `dir="rtl"` on root `<html>`.
- **Font size ≥ 16pt** on all inputs — prevents iPad Safari auto-zoom on focus.
- **Touch targets ≥ 44px** on all interactive elements.
- **Textareas expand dynamically** — never fixed-height scroll boxes.
- **Date format:** DD/MM/YYYY everywhere.

## File Structure (once scaffolded)

```
/app              Next.js app router pages
/components       Reusable UI components
/lib              localStorage, sync engine, API client, Prisma client
/types            TypeScript types (assessment.ts is the foundation)
/hooks            useSync, and other custom hooks
```

## Development Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npm run test      # Jest unit tests
```

## Data Model

The `Assessment` type in `/types/assessment.ts` is the single source of truth. All fields are optional except `id`, `createdAt`, `updatedAt`, `syncStatus`, `status`, and `identification.patientName`. Do not add validation beyond what the type requires — this is a free-text interview tool.

## Issue Tracker

GitHub Issues are the source of truth for work. Run `zsh scripts/create-issues.sh` to populate them (once only). Recommended start order: #2 → #1 → #3 → #4 → #5 → #6 → #7 → #10.

## Babysitter

This project uses [babysitter](https://github.com/a5c-ai/babysitter) to orchestrate automated workflows.

**Issue resolution loop** — picks up open GitHub issues, runs the `issue-resolver` agent to implement each one, creates a PR, waits for approval, squash-merges, pulls master, and moves to the next issue.

To start the issue loop:
```bash
/babysitter:call
```

**Workflow (per issue):**
1. `git checkout master && git pull`
2. `git checkout -b feature/issue-{N}-{slug}`
3. Issue-resolver agent implements the feature with tests
4. `gh pr create` + breakpoint for your review
5. `gh pr merge --squash` after approval
6. `git checkout master && git pull`
7. Loop to next open issue

**Babysitter config:** Semi-autonomous. Always pauses before PR merge for your review.

Run and state files live in `.a5c/` (gitignored).
