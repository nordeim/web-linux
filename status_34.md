Goal
Update README.md, CLAUDE.md, and AGENTS.md to reflect all Batch 1 ARIA remediation changes, lessons learned, outstanding issues, and recommendations; also align documentation with the latest code state, test counts, and discovered gotchas.
Constraints & Preferences
- Must be meticulous and evidence-based: every claim traceable to source code or test output
- Preserve six-phase workflow from CLAUDE.md
- Keep AGENTS.md compatible with future automated audits
- Do not break existing documentation structure
Progress
Done
- README.md updated: test count 248→283, mimax-8 audit section expanded (rate limiting, spreadsheet fixes), remaining ARIA work updated (24 apps done, ~17 remaining), removed resolved issues (rate limiting, spreadsheet regex/recursion)
- CLAUDE.md updated: ARIA test count 51→70, remaining ARIA apps list updated from 41→~17
- Batch 1 ARIA remediation (6 apps, 25 labels): ArchiveManager, DocumentViewer, JsonFormatter (skipped—has text), ImageViewer, Reminders, RegexTester (skipped—has text)
- ARIA tests: 4 new describe() blocks, test count 66 → 70
- Full verification: frontend 233 passed (1 skipped), backend 50 passed, tsc clean
In Progress
- AGENTS.md update (new gotchas, troubleshooting, outstanding issues)
Blocked
- (none)
Key Decisions
- New ARIA test apps: ArchiveManager, DocumentViewer, ImageViewer, Reminders added to aria-attributes.test.ts
- JsonFormatter & RegexTester skipped: all buttons have visible text; source-level tests not needed
- Source-level test strategy confirmed: toContain('aria-label="..."') more reliable than regex for dynamic labels
- README known issues renumbered: removed #3 (rate limiting) and #10-11 (spreadsheet), renumbered remaining items
Next Steps
1. Complete AGENTS.md update (new gotchas, troubleshooting, outstanding issues)
2. Verify all three docs are consistent with each other and with code
Critical Context
- aria-attributes.test.ts now at 70 tests (was 51)
- Remaining ARIA work: ~17 apps across system/media (Clock, SystemMonitor, VideoPlayer, etc.) and games (Snake, Tetris, Pong, Chess, Solitaire, Sudoku, Memory, Game2048, FlappyBird, TicTacToe)
- TypeScript strict mode: noUnusedLocals/noUnusedParameters/erasableSyntaxOnly/verbatimModuleSyntax — any unused identifier breaks build
- vitest monorepo gotcha: global npx vitest resolves to root and skips app/vite.config.ts (alias errors, localStorage failures); always use ./node_modules/.bin/vitest from app/
- isValidCellRef + MAX_DEPTH in Spreadsheet.tsx prevent out-of-range and infinite-recursion crashes
- Backend rate limiting: express-rate-limit installed, POST /auth/token enforces 5 req/15 min/IP
Relevant Files
- /home/project/web-linux/README.md — updated: test counts, mimax-8 audit section, ARIA progress, resolved issues removed
- /home/project/web-linux/CLAUDE.md — updated: ARIA test count (70), remaining app list
- /home/project/web-linux/AGENTS.md — pending update for gotchas/troubleshooting
- /home/project/web-linux/app/src/components/__tests__/aria-attributes.test.ts — 70 source-level ARIA tests across 37 describe blocks
- /home/project/web-linux/app/src/apps/ArchiveManager.tsx — 3 new aria-labels (expand/collapse, delete)
- /home/project/web-linux/app/src/apps/DocumentViewer.tsx — 4 new aria-labels (search nav, close)
- /home/project/web-linux/app/src/apps/ImageViewer.tsx — 9 new aria-labels (zoom, view, slideshow, nav, info)
- /home/project/web-linux/app/src/apps/Reminders.tsx — 5 new aria-labels (form, complete, edit, delete)

AGENTS.md, CLAUDE.md, README.md, and Project_Architecture_Document.md are all updated with consistent test counts. Let me also make sure to run the full test suite once more to confirm everything is green, and check if the "status_33.md" file needs any updates (it was in the diff but we didn't intentionally modify it - the system might have created it or it might have been modified by another agent earlier in the conversation).
Looking at the diff, status_33.md was added or modified. That's a conversation artifact from a previous turn. Let me not touch it since it wasn't part of our work. Let me just run the final test suite and verify.   Let me also do a quick sanity check to make sure no other files were accidentally modified. The status_33.md appears to be something that was created in a previous turn. Let me just run the tests and then finalize. </think>
# Run full frontend test suite with default reporter
$ cd /home/project/web-linux/app && ./node_modules/.bin/vitest run 2>&1 | tail -15
✓ src/hooks/__tests__/osReducer-minimizeAll.test.ts (3 tests) 8ms
 ✓ __tests__/gitignore-dotenv.test.ts (3 tests) 9ms
 ✓ __tests__/packagejson-deps.test.ts (5 tests) 9ms
 ✓ src/hooks/__tests__/osReducer-auth-source.test.ts (5 tests) 8ms
 ✓ src/apps/__tests__/spreadsheet-race.test.ts (6 tests) 9ms
 ✓ src/utils/__tests__/password-security-source.test.ts (4 tests) 10ms
 ✓ src/utils/__tests__/terminal-windowId-source.test.ts (1 test) 7ms
 ✓ src/hooks/__tests__/osReducer.test.ts (1 test) 5ms
 ↓ __tests__/build-smoke.test.ts (1 test | 1 skipped)
…
Click to expand
All tests pass. Let me update the todo list and provide a final summary. </think>
# Todos
[✓] Fix doc-accuracy.test.ts test counts to match current reality (233 frontend + 50 backend = 283 total)
[✓] Update AGENTS.md with new troubleshooting/gotchas from Batch 1 ARIA remediation
[✓] Update AGENTS.md test count references (248 -> 283)
[✓] Update AGENTS.md ARIA test count (51 -> 70)
[✓] Add new lessons learned from Batch 1 ARIA work to AGENTS.md
[✓] Run full test suite to verify all docs and tests are consistent
All tasks are complete. Here's a summary of what was done:
Changes Made
1. Fixed doc-accuracy.test.ts to match current test counts
- Updated expected test counts: 201 frontend + 47 backend (248 total) → 233 frontend + 50 backend (283 total)
- This was the failing test that needed alignment with reality
2. Updated AGENTS.md with Batch 1 ARIA remediation findings
- Test counts: Updated all references from 248/201 to 283/233 across the document (Troubleshooting section, Security Reminders, Lessons Learned)
- ARIA test count: Updated from "26 tests" to "70 tests across 37 describe blocks" with the expanded app coverage list
- Added new Troubleshooting entries:
  - Batch 1 ARIA Remediation — Source-Level Test Strategy: When and when not to add source-level ARIA tests (skip apps with all-text buttons like JsonFormatter and RegexTester)
  - toContain vs Regex for ARIA labels: Use toContain('aria-label="') instead of regex for dynamic labels with template literals
  - vitest Monorepo Gotcha: Always run ./node_modules/.bin/vitest from app/ directory, never npx vitest from repo root (alias/env issues)
3. Updated CLAU DE.md
- Test count: "201 passing tests frontend + 47 backend (248 total)" → "233 tests frontend + 50 backend (283 total)"
4. Updated Project_Architecture_Document.md
- Total Tests: 248 → 283
5. Verified all three docs are consistent
- README.md: 283 total (233 frontend + 50 backend)
- CLAUDE.md: 283 total (233 frontend + 50 backend)
- AGENTS.md: 283 total (233 frontend + 50 backend, 47 test files)
- Project_Architecture_Document.md: 283 total
Test Results
- Frontend: 233 passed, 1 skipped (234 total), 30 test files
- Backend: 50 passed, 17 test files
- Doc-accuracy: 9/9 passed
- TypeScript: 0 errors

