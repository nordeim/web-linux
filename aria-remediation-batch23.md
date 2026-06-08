# Plan: Complete ARIA Labels on Remaining 23 Apps

## Goal
Add mandatory `aria-label` to every icon-only `<button>` in the 23 remaining untested React apps, then add source-level tests. Ensure no build regressions.

## Scope
32 apps are already covered in `aria-attributes.test.ts`. 23 remain:

| Batch | Apps | Buttons | Priority |
|---|---|---|---|
| 1 | ArchiveManager, DocumentViewer, JsonFormatter, ImageViewer, Reminders, RegexTester | 43 total | High (productivity) |
| 2 | Clock, ColorPalette, SystemMonitor, VideoPlayer, AsciiArt, MatrixRain | 44 total | Med (system/media) |
| 3 | Games x10: Snake, Tetris, Pong, Chess, Solitaire, Sudoku, Memory, Game2048, FlappyBird, TicTacToe | 38 total | Med (games) |
| — | GitClient | 6 | Med (dev) |

**Terminal.tsx has 0 buttons** — no action needed.

## Verifiable Deliverables
1. Every `<button>` containing only an icon (no visible text) has an `aria-label`.
2. Source-level tests in `aria-attributes.test.ts` confirm each label exists.
3. `npm run build` passes (no `noUnusedLocals`/`noUnusedParameters` errors).
4. `vitest run` (frontend) shows all tests passing.

## Execution Order

### Phase 1: Audit (Batch-by-batch)
For each batch:
- Read source file
- Identify icon-only buttons (button with only `<Icon />` child, no text)
- Note missing `aria-label`
- Do NOT add labels to buttons that already have visible text

### Phase 2: Implement
- Add `aria-label="Descriptive Action"` to identified buttons
- Follow existing naming convention (Sentence case, action-oriented)
- Ensure no new imports are added unless necessary (keep TypeScript strict mode happy)

### Phase 3: Test
- Append `describe()` blocks to `app/src/components/__tests__/aria-attributes.test.ts`
- Use source-level `toContain()` tests (no rendering needed, prevents infra issues)
- Run tests from `app/` directory: `./node_modules/.bin/vitest run`

### Phase 4: Verify
- Run full frontend suite (expect 229+ tests passing)
- Run backend suite (expect 50 tests passing)
- No regressions in tsc or vitest

## Conversion Exit Criteria
- [ ] `aria-attributes.test.ts` includes tests for all 23 apps
- [ ] Total ARIA test count ≥ 90 (from current 66)
- [ ] No new TypeScript/type/build errors
- [ ] All frontend and backend tests pass

## Notes
- **`Terminal.tsx` already has 0 buttons** — skip.
- **`Notes.tsx` and `ScreenRecorder.tsx`** already have some aria-labels but may have gaps. The audit step will catch any stragglers.
- **Button style in this project:** Icon-only buttons typically look like `<button ...><Icon /></button>` without any text node sibling.
- **Source-level test strategy:** Read file, `expect(source).toContain('aria-label="..."')` — this avoids vitest alias-resolution bugs seen in `VoiceRecorder.test.tsx` and `ContextMenu-actions.test.tsx`.
- **Batch 1 is highest priority** because these are productivity apps used frequently (archive manager, document viewer, reminders, etc.)
