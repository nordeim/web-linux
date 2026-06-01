# AI Agent Briefing: UbuntuOS Web

This document provides high-signal technical context for AI coding agents. It focuses on non-obvious architectural patterns, state management quirks, security rules, and hard-earned lessons from the comprehensive security audit and remediation completed on 2026-05-31.

## 🧠 Core Architecture

### Window Manager (Logic: `useOSStore.tsx`)
- **Z-Index Stacking**: Focus management is handled by a global `nextZIndex`. To focus a window, dispatch `FOCUS_WINDOW`, which increments this counter. **Never manually set z-index in CSS.**
  - **Bounds Check**: Z-index is capped at `2147483647` (max CSS z-index) to prevent overflow in long sessions.
- **Window States**: `normal`, `minimized`, `maximized`. Restoring from maximized uses `prevPosition` and `prevSize` stored in the window object.
- **Window State Transition Gotchas**:
  - `MINIMIZE_WINDOW`: After minimizing, the next active window is selected by z-index from the remaining visible windows. If all windows are minimized, `activeWindowId` becomes `null` (no crash).
  - `CLOSE_WINDOW`: After closing, the next active window is selected by z-index. If no windows remain, `activeWindowId` becomes `null`.
  - `RESTORE_WINDOW`: Restores `prevPosition` and `prevSize` (captured on maximize/minimize). If none exist, falls back to current values.
- **Cascading**: New windows are offset by 30px from the last window of the same app type using the `createWindow` helper.

### Safe Evaluator (`safeEval.ts`)
> **MANDATORY**: All math evaluation (spreadsheet formulas, terminal `calc`) must use `safeEval()` from `@/utils/safeEval`. This replaces `eval()` and `new Function()` with a hardened shunting-yard parser.
> - **Guideline**: Any new app doing math must import and use `safeEval(expr: string): number`
> - **What it does**: Validates input against `ALLOWED_CHARS` regex, tokenizes, converts to RPN via shunting-yard, evaluates RPN safely.
> - **Allowed**: digits, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, whitespace
> - **Bug fix of**: `Spreadsheet.tsx` and `Terminal.tsx` previously used `eval()` and `new Function()` — both removed.

### XSS Sanitization (`sanitizeHtml.ts`)
> **MANDATORY**: Any `dangerouslySetInnerHTML` must wrap content in `sanitizeHtml()` from `@/utils/sanitizeHtml`.
> - **Markdown**: Use `sanitizeMarkdownHtml()` which has a whitelist for common markdown tags (`p`, `h1`-`h6`, `ul`, `ol`, `li`, `strong`, `em`, `code`, `pre`, `blockquote`, `a`, `img`, `del`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `hr`).
> - **Code Editor**: Use `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})` for syntax highlighting.
> - **Regex Tester**: Use `sanitizeHtml(..., {ADD_TAGS: ['mark']})` for match highlighting.
> - **Bug fix of**: `Notes.tsx`, `MarkdownPreview.tsx`, `RegexTester.tsx`, and `CodeEditor.tsx` all previously rendered raw HTML without sanitization.

### localStorage Schema Validation (`storageValidation.ts`)
> **MANDATORY**: Any code reading from `localStorage` must validate with `zod` schemas from `@/utils/storageValidation`. Never trust `JSON.parse()` output.
> - **Desktop Icons**: Use `validateDesktopIcons(defaultIcons)` which runs `z.array(DesktopIconSchema).safeParse(parsed)`.
> - **VFS**: Use `validateFileSystem(defaultFS)` which runs `FileSystemStateSchema.safeParse(parsed)`.
> - **Versioned Keys**: The VFS uses `ubuntuos_filesystem_v2`. Legacy key `ubuntuos_filesystem` is supported for forward migration only.
> - **Bug fix of**: `useOSStore.tsx` and `useFileSystem.ts` previously used `JSON.parse(saved) as T` (type-only cast), which would crash on corrupted data.

### Virtual File System (Logic: `useFileSystem.ts`)
- **ID-Based**: Nodes are referenced by unique IDs, not paths. Use `findNodeByPath(path)` only when resolving a user-provided string.
- **Persistence**: The VFS is synced to `localStorage` under `ubuntuos_filesystem_v2`.
- **Associations**: `FILE_ASSOCIATIONS` in `useFileSystem.ts` maps extensions to `appId` and icons. Update this to register new file types.
- **Path Normalization**: `findNodeByPath('/home//user/')` is normalized to `/home/user` before traversal. Trailing slashes and double slashes are handled.

## 🛠️ Development Workflow

### Adding a New App
1.  **Component**: Create `src/apps/YourApp.tsx`.
2.  **Registry**: Add entry to `src/apps/registry.ts`. This defines the app category, default size, and icon.
3.  **Router**: Register the `appId` in `src/apps/AppRouter.tsx`.
4.  **Icons**: Use `Lucide React` names in the registry.

### Common Commands
Run from the `app/` directory:
- `npm run dev`: Start Vite dev server.
- `npm run build`: Type-check (`tsc`) and build.
- `npm run lint`: ESLint check.
- `npm run test`: Run Vitest test suite.

## ⚠️ Anti-Patterns to Avoid

- **`eval()` / `new Function()`**: These are **forbidden** for any math evaluation. Use `safeEval()` from `@/utils/safeEval` instead.
- **Raw `dangerouslySetInnerHTML`**: Always wrap user-generated HTML with `sanitizeHtml()` from `@/utils/sanitizeHtml`. Never inject raw strings.
- **Unvalidated localStorage**: Always validate schema with `zod` or `@/utils/storageValidation` before trusting `JSON.parse()` output.
- **Direct DOM Manipulation**: Avoid `document.getElementById` for window operations. Use the `OSAction` dispatches.
- **Path-Based VFS Calls**: Do not assume a file's path is its unique identifier. Always use the node `id`.
- **Custom Window Chrome**: Do not build custom title bars or resize handles in individual apps. `WindowFrame.tsx` provides the standardized shell.
- **Bypassing the Store**: App-to-app communication should go through the `useOS` hook or the File System, not local props.

## 🔗 Key Entry Points
- `src/hooks/useOSStore.tsx`: Global OS state and reducer.
- `src/hooks/useFileSystem.ts`: VFS logic and associations.
- `src/apps/AppRouter.tsx`: Central component mapping for windows.
- `src/utils/safeEval.ts`: Secure math evaluator.
- `src/utils/sanitizeHtml.ts`: XSS sanitization.
- `src/utils/storageValidation.ts`: localStorage schema validation.

## 🚨 Troubleshooting & Gotchas

### Z-Index Overflow
**Symptom**: Window focus becomes erratic after a very long session.  
**Root Cause**: `nextZIndex` exceeds CSS max.  
**Fix**: Already fixed with `Math.min(nextZIndex + 1, 2147483647)`. If you see this, confirm the bounds check is present in both `OPEN_WINDOW` and `FOCUS_WINDOW`.

### Window State Restoration
**Symptom**: After minimizing a window, the wrong window is focused.  
**Root Cause**: `MINIMIZE_WINDOW` reducer was using a fragile `.reduce()` with `null` as the initial value.  
**Fix**: Already fixed with explicit `visibleWindows.length > 0 ? visibleWindows.reduce(...).id : null`. Do not revert to the old pattern.

### localStorage Corruption
**Symptom**: App crashes on load, or desktop icons/files appear corrupted.  
**Root Cause**: `localStorage` data was modified by the user or corrupted.  
**Fix**: The app now validates all stored state with `zod` and falls back to defaults if validation fails. Check browser DevTools → Application → Local Storage to inspect the data.

### Math Evaluation Failures
**Symptom**: Spreadsheet formulas or terminal `calc` always returns `#VALUE!` or "invalid expression".  
**Root Cause**: `safeEval()` rejects any characters outside `0-9.+-*/^()` and whitespace.  
**Fix**: Check the formula for unsupported operators (e.g., `%`, `&`, `|`, `!`, function names like `sin()`). Only basic arithmetic and `^` (exponent) are supported.

## 🔒 Security Reminders

1. Any new app that evaluates math must use `safeEval()`.
2. Any new app that renders user HTML must use `sanitizeHtml()`.
3. Any new feature that persists to `localStorage` must validate with `zod`.
4. Never add `eval()`, `new Function()`, or `Function()` to any app unless it is the `safeEval` implementation itself.

## 📋 Outstanding Issues (As of 2026-05-31)

1. **Missing Error Boundaries**: `AppRouter` and `WindowManager` are not wrapped in React Error Boundaries. A crash in one app could bring down the shell.
2. **Chunk Size Warning**: Production build warns about chunk size >500 kB. Consider dynamic `import()` for game apps.
3. **Console Logs**: Several apps still contain debug `console.log` statements.
4. **VFS localStorage Limit**: ~5 MB cap. Consider migrating to IndexedDB for large file storage.
5. **Accessibility**: Some games and media apps lack full keyboard navigation and ARIA labels.

## 💡 Lessons Learned

- **`eval()` is never safe**, even with regex sanitization. Build a proper parser or use a restricted subset.
- **TypeScript types are not runtime guarantees**. `JSON.parse()` + `as T` is a security and reliability risk. Always validate persisted data.
- **Monolithic reducers are hard to maintain**. The 499-line `osReducer` works but is difficult to test and reason about. Consider splitting by domain.
- **Window state transitions are surprisingly complex**. The interaction of z-index, focus, minimize, maximize, and close requires careful handling of edge cases.
