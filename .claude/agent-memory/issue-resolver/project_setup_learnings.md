---
name: project_setup_learnings
description: Lessons from resolving issues #1 and #2 — setup quirks, broken symlinks, worktree behavior
type: project
---

## Key findings from issues #1 and #2 (2026-03-18)

**Why:** Issue #1 (Next.js scaffold) and #2 (data model) files were pre-created on master as untracked
files, never committed to git. Both issues required committing these files on feature branches.

**Broken symlinks in node_modules/.bin:**
- When running in a git worktree, `node_modules/.bin` entries for `eslint` and `next` were
  plain files (copies), not symlinks. They referenced `../package.json` which didn't resolve
  correctly from `.bin/`.
- Fix: `rm node_modules/.bin/eslint && ln -s ../eslint/bin/eslint.js node_modules/.bin/eslint`
- Fix: `rm node_modules/.bin/next && ln -s ../next/dist/bin/next node_modules/.bin/next`

**jest.config.ts had a typo:** `testPathPattern` does not exist — should be `testMatch`.

**ts-node was missing:** Required for Jest to parse TypeScript config files. Add to devDependencies.

**`--passWithNoTests` flag needed:** jest exits with code 1 if no tests found; added to `npm test` script.

**Stacked PRs pattern:** Issue #2 depended on issue #1 (both infrastructure). Since #1 wasn't merged
to master yet, #2 branch was created from feature/issue-1-nextjs-setup. PR #25 targets feature/issue-1
branch. After #1 merges, #2 needs rebase on master before merging.

**Worktree behavior:** The agent runs in a worktree at `.claude/worktrees/agent-a60d45a6`. All
git operations (commit, branch, push) should target `/Users/itsme/Developer/prism-app` (main worktree),
not the agent worktree path.

**How to apply:** When starting future issues, check if node_modules/.bin has broken symlinks before
running npm scripts. Always run `npm run lint`, `npm run test`, and `npm run build` before creating PRs.
