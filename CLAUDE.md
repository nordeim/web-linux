# UbuntuOS Web

Web-based Linux desktop environment (Ubuntu-style) built with React 19, TypeScript, and Tailwind CSS. Features 56 interactive applications and a virtual file system with localStorage persistence.

## Foundational Principles

### Meticulous Approach
Follow this six-phase workflow for all implementation tasks:
1. **ANALYZE** - Deep requirement mining.
2. **PLAN** - Structured roadmap with validation.
3. **VALIDATE** - Explicit user confirmation.
4. **IMPLEMENT** - Modular, tested builds.
5. **VERIFY** - Rigorous QA (edge cases, accessibility).
6. **DELIVER** - Complete handoff.

## Implementation Standards

### React & TypeScript
- **React 19**: Use functional components and hooks.
- **Strict TypeScript**: No `any`, use explicit interfaces for props and state.
- **State Management**: Use `useOS` hook (React Context + useReducer) for system-wide state.
- **File System**: Use `useFileSystem` hook for all file operations (VFS).
- **Build Hygiene**: `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. Any unused import, variable, or parameter will break the build. Remove dead code immediately; do not leave it commented out.

### UI & Styling
- **Tailwind CSS 3.4**: Use utility classes, following the design tokens in `index.css`.
- **Shadcn UI**: Base components are in `src/components/ui`. Use them instead of custom ones.
- **Lucide React**: Primary icon library. Use named imports (`import { IconName } from 'lucide-react'`) only. Do not use `import * as Icons from 'lucide-react'` (imports the entire ~587 KB library).
- **Responsive Design**: Ensure apps handle window resizing correctly.

### Security
- **`eval()` / `new Function()``: **FORBIDDEN**. Any math evaluation of free-form expression strings must use `safeEval()` from `@/utils/safeEval`. This includes spreadsheet formulas, terminal `calc` commands, and any future app that parses user-supplied arithmetic strings. Fixed calculator-style apps (e.g., Calculator with per-button input) are not required to use `safeEval()` because they dispatch to a fixed set of operator handlers and never evaluate raw user strings.
- **`dangerouslySetInnerHTML`: **AVOID WHENEVER POSSIBLE**. Prefer React components over `dangerouslySetInnerHTML` for highlighting, match rendering, or any dynamic content. If unavoidable, always wrap user-generated HTML with `sanitizeHtml()` from `@/utils/sanitizeHtml`.
  - **Regex highlighting**: Use `<mark>` React components instead of concatenated HTML strings (as demonstrated in the RegexTester refactor).
  - Markdown: Use `sanitizeMarkdownHtml()` which has a whitelist for common markdown tags.
  - Code highlighting: Use `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`.
- **ReDoS (Catastrophic Backtracking)**: Any app accepting user-supplied regex must limit `exec()` iterations to prevent browser tab freezing. Use `MAX_EXEC_ITERATIONS = 1000` and bail out early.
- **Unbounded Array Creation**: Functions creating arrays from user input (e.g., factorial) must cap input size before allocation. Calculator caps factorial at 170 to prevent memory exhaustion.
- **Error Boundaries**: Use `GlobalErrorBoundary` to wrap application content. The shell (`AppShell`) and each window (`AppRouter`) should both be wrapped to prevent one error from crashing the entire OS. See `GlobalErrorBoundary.tsx` for implementation.

### Persistence
- **localStorage Schema Validation**: All `localStorage` reads must go through `validateDesktopIcons()` or `validateFileSystem()` from `@/utils/storageValidation`. For ad-hoc app-specific reads, use `safeJsonParse(raw, schema, fallback)` from `@/utils/safeJsonParse`. Never trust `JSON.parse()` output without runtime validation.
- **SafeJSONParse for Apps**: Apps reading from localStorage must define zod schemas and use `safeJsonParse()`. See `Todo.tsx` and `VoiceRecorder.tsx` for the reference implementation pattern (define schema, import `safeJsonParse`, replace `JSON.parse` with validated call).
- **Versioned Keys**: The VFS uses `ubuntuos_filesystem_v2`. Legacy keys are supported for migration but new code should only write to the versioned key.

## Project Structure
- `app/src/apps/`: Individual application components.
- `app/src/components/`: Core desktop environment components (Dock, Desktop, etc.).
- `app/src/hooks/`: Core state and FS logic.
- `app/src/utils/`: Utility functions (safeEval, sanitizeHtml, storageValidation, colorValidation).
- `app/src/types/`: Centralized type definitions.

## Development Workflow

### Build & Test Commands
(Run from the `app/` directory)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run preview` | Preview production build |
| `tsc -b` | Manual type checking |

### Adding a New App
1. Create the component in `app/src/apps/YourAppName.tsx`.
2. Register the app in `app/src/apps/registry.ts` with metadata.
3. Add the component to `app/src/apps/AppRouter.tsx`.
4. (Optional) Add a desktop icon in `app/src/hooks/useOSStore.tsx` in `defaultDesktopIcons`.
5. **IMPORTANT**: Ensure the app ID in `registry.ts` matches the case statement in `AppRouter.tsx`. The registry completeness test (`src/apps/__tests__/registry-completeness.test.ts`) will automatically verify this.

### File Operations
- Use `fs.readFile(id)` and `fs.writeFile(id, content)`.
- Files are identified by unique IDs, not just paths.
- File associations are defined in `app/src/hooks/useFileSystem.ts`.

## Performance

### Tailwind CSS Content Scanning
- **Issue**: Tailwind CSS content scanner can misinterpret regex patterns in source files as CSS class selectors, causing build warnings.
- **Example**: The regex `[-:\|\s]` in `MarkdownPreview.tsx` was interpreted as a CSS class selector.
- **Solution**: Exclude affected files from Tailwind scanning in `tailwind.config.mjs`:
  ```javascript
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '!./src/apps/MarkdownPreview.tsx']
  ```
- **Verification**: Run `npm run build` and check for `css-syntax-error` warnings.

### Code Splitting
- **React.lazy() + Suspense** reduced initial bundle from ~1 MB to ~360 KB by splitting 56 apps into individual chunks.
- **Shared DynamicIcon** eliminates ~8× code duplication across Dock, WindowFrame, Desktop, AppLauncher, and other components.
- **Lucide monolithic import** (`import * as Icons from 'lucide-react'`) still imports the entire library (~587 KB). Use named imports when possible.
- **`TextEncoder` beats `Blob` for byte counting**. `new TextEncoder().encode(content).length` gives identical UTF-8 byte counts without allocating a `Blob` object. Applied to `createFile` and `writeFile` in `useFileSystem.ts`.

### Build Hygiene
- **"noUnusedLocals": true** and **"noUnusedParameters": true** are enforced in `tsconfig.app.json`. A single unused import or variable will break the production build (`npm run build`).
- **Remediation (2026-06-02)**: 43 `TS6133` errors were fixed across 16 files. Root causes: dead imports (Lucide icons, React hooks), unused state variables, and unread function parameters.
- **Prevention**: Clean up imports immediately when removing features. Use `npx tsc -b --noEmit` to catch errors before committing.

## Lessons Learned

### Security
- **`eval()` and `new Function()` are never safe**, even with regex sanitization. A hardened parser is the only acceptable solution for math evaluation.
- **`dangerouslySetInnerHTML` without sanitization is a persistent XSS vector**, especially when combined with `localStorage` persistence (stored XSS).
- **Prefer React components over `dangerouslySetInnerHTML`**. RegexTester was refactored to use `<mark>` React components instead of concatenated HTML strings, eliminating XSS risk entirely.
- **Runtime schema validation is non-optional** for any persisted state. TypeScript types are erased at runtime; `zod` is the correct defense. The new `safeJsonParse(raw, schema, fallback)` utility in `src/utils/safeJsonParse.ts` provides a reusable pattern for ad-hoc localStorage reads.
- **ReDoS (catastrophic backtracking) from user regex is real**. A pattern like `(a+)+$` against a long string can freeze the browser tab entirely. Always limit `exec()` iterations (e.g., 1000) and bail out early. Never trust user-supplied regex without guards.
- **Third-party audit findings must be independently validated before acting**: The kilo-1 audit had a ~33% error rate on CRITICAL/HIGH findings. One finding claimed `Calendar.tsx` had unused imports that broke the build (imports were actually used — build passed). Another claimed 17 apps used raw `JSON.parse` (all had been fixed). Always verify audit claims against the actual source before prioritizing fixes.
- **Unbounded array creation from user input crashes browsers**. The Calculator factorial function previously created an array of size `Math.floor(v)` without a cap, allowing input like `1e8` to crash the tab. Always cap input-dependent allocations (factorial capped at 170, where JavaScript `Number` overflows to `Infinity`).
- **Development-only utilities must have production guards**. `authToken.ts` previously lacked a guard against production use. Any development-only helper (JWT generators, mock data injectors, debug toggles) should throw immediately when `import.meta.env.PROD` is true, preventing accidental misuse.
- **Demo apps still need security hygiene**. The PasswordManager's hardcoded `MASTER_PIN = '1234'` was a critical vulnerability. Even for demo features, secrets must be user-configurable, persisted with schema validation, and accompanied by a visible security warning.
- **Security infrastructure must be wired into the main code path**. The Phase 3 security files (`types.ts`, `logger.ts`, `policy.ts`) were created but not imported or used by `websocket.ts`. Command filtering and audit logging were effectively disabled despite files existing. Always verify that security modules are actually integrated, not just present in the codebase.
- **Never call `disconnect()` during connection setup**. `websocket.ts` called `this.store.disconnect(sessionId)` at the end of the connection setup method, immediately marking new sessions as disconnected and triggering premature cleanup. Move lifecycle methods (connect, disconnect, cleanup) to the correct event handlers (`ws.on('close')`, `ws.on('error')`).
- **Client heartbeat prevents premature session timeout**. The server expected periodic heartbeats but the client never sent them. Add a heartbeat interval (e.g., every 30 seconds) and clear it on disconnect/unmount to keep sessions alive.

### State Management
- **Monolithic reducers are hard to maintain**. The `osReducer` is approximately 375 lines and violates separation of concerns. Consider splitting into domain-specific reducers or switching to a state management library with selectors.
- **Z-index as a number is fragile**. The `2147483647` cap is correct, but a better solution would be to recalculate z-indices periodically to avoid the cap entirely.
- **Window state transitions need explicit guards**. The `MINIMIZE_WINDOW` and `CLOSE_WINDOW` actions both need careful handling of `activeWindowId` to avoid `null` dereferences.

### Testing
- **TDD is effective for security-critical code**. The `safeEval` tests (24 cases) caught multiple edge cases during development.
- **Source-level validation as test workaround**: Component-level tests using `@/` aliases fail in vitest due to module resolution issues. Source-level tests (reading file source strings) are used as a workaround for ARIA attribute validation (26 tests in `aria-attributes.test.ts` plus tests in `pinStorage.test.ts`, `vfsHelpers.test.ts`, and `gameHighscore.test.ts`).
- **Component rendering tests work**: `NotImplemented.test.tsx` and `VoiceRecorder.test.tsx` successfully use `render()` from `@testing-library/react` with the `@/` alias, demonstrating that vitest alias resolution works for some component tests.
- **Game highscore validation tests**: 12 tests in `gameHighscore.test.ts` validate the zod schema pattern for game highscores, ensuring corrupted localStorage data falls back gracefully.

### Refactoring & Maintenance
- **`walkAndDelete` reduces VFS duplication**. Extracting a single `walkAndDelete` helper eliminated ~30 lines of duplicated inline `recurseDelete` closures in `deleteNode` and `emptyTrash`. Preserving immutability (shallow-copied `nodes` object) while returning deleted IDs allows callers to clean up `trashMeta` independently. **Likewise for `recurseMoveNode`**: The same inline recursion was duplicated in `moveToTrash`. Extracting it to `recurseMoveNode(nodes, nodeId, newParentId)` in `src/utils/vfsHelpers.ts` eliminated another ~10 lines and is now independently testable.
- **`TextEncoder` is lighter than `Blob` for byte counting**. `new TextEncoder().encode(content).length` produces the same UTF-8 byte count as `new Blob([content]).size` without allocating a full `Blob` object. This micro-optimization matters for frequently called operations like `writeFile`.
- **Legacy localStorage keys must be cleaned after migration**. After migrating data from `ubuntuos_filesystem` → `ubuntuos_filesystem_v2`, the old key was left in place, causing storage bloat. Always delete the legacy key after confirming a successful migration.
- **Mid-file imports break conventions and readability**. `useOSStore.tsx` had an `import` between helper functions, which is confusing and violates TypeScript/React style. Always keep all `import` statements at the top of the file.
- **Dead props create silent contract violations**. `Terminal.tsx` declared `windowId` in its interface but never destructured or used it. Always verify that declared props are actually consumed in the component body; otherwise, the prop contract is misleading.
- **Source-level tests catch ARIA regressions**. When vitest infrastructure blocks component rendering, reading source files and asserting on attribute presence (e.g., `aria-label`, `role`, `tabIndex`) catches regressions without requiring full rendering. See `aria-attributes.test.ts` for the pattern.

## Recommendations

1. **Migrate VFS from localStorage to IndexedDB** for larger file storage (>5 MB).
2. **Validate CSS color values before injection**: The `chart.tsx` component now uses `isValidColor()` from `@/utils/colorValidation` to validate color values before CSS injection. Always use this utility when injecting dynamic color values.
3. **Add `vitest` coverage collection** to track test coverage across all modules.
4. **Implement CI/CD pipeline** with automated `build`, `lint`, and `test` gates.
5. **Split `osReducer` into domain-specific reducers** (window management, notifications, desktop icons, etc.).
6. **Add ARIA labels to remaining 41 apps**: Browser, Notes, Calendar, Email, and other apps with icon-only buttons need `aria-label` attributes. Follow the pattern in `FileManager.tsx` and `Settings.tsx`.
7. **Enforce import hygiene during code review**: The `noUnusedLocals`/`noUnusedParameters` TypeScript checks catch dead code at build time, but IDE auto-imports can silently add unused imports. Add a pre-commit hook or lint rule to block commits with unused identifiers.
8. **Replace all remaining `dangerouslySetInnerHTML` usage**: After RegexTester was refactored to use React components, audit all remaining `dangerouslySetInnerHTML` usage and replace with React component rendering where possible.
9. **Add ReDoS guards to all regex-accepting apps**: TextEditor find bar (now fixed with `countMatchesSafely()`), RegexTester (already has `MAX_EXEC_ITERATIONS = 1000`). Notes search and Email filters use `String.includes()` and are not vulnerable. Audit any app with `new RegExp(userInput)` for missing guards.
10. **ScreenRecorder**: Now uses real `getDisplayMedia` + `MediaRecorder` API for actual screen capture with `.webm` output.
11. **Validate chart color values before CSS injection**: The `chart.tsx` component generates CSS variables from `ChartConfig` color values. While currently from hardcoded config, add hex/rgb/hsl validation if colors ever come from user input.
12. **Add ESLint rule to block wildcard lucide imports**: Prevent `import * as Icons from 'lucide-react'` everywhere except `DynamicIcon.tsx`. This enforces the named import convention at lint time.
13. **Add test coverage for MINIMIZE_ALL**: Verify that `prevPosition` and `prevSize` are correctly saved and restored after "Minimize All" action.
14. **Audit all z-index increment sites**: After finding `END_ALT_TAB` was missing the z-index cap (patched in `OPEN_WINDOW` and `FOCUS_WINDOW` but not here), audit every reducer case that increments z-index to ensure `Math.min(nextZIndex + 1, 2147483647)` is applied consistently.
15. **Remove unused dependencies immediately**: Dependencies should only be added when actively needed. Regularly audit `package.json` for unused packages and remove them to reduce bundle size and attack surface.
16. **Propagate windowId through component hierarchy**: When a component needs per-window identity (for cleanup, focus, or container mapping), always pass `windowId` explicitly rather than relying on global state or re-registering inside children.
17. **Container lifecycle as first-class concern**: Any feature that spawns external resources (Docker containers, PTY processes, file handles) must have explicit, tested teardown paths. Resources orphaned by disconnects, crashes, or unmounts become production incidents.
18. **Docker container lifecycle must be explicit**: Every `spawn` needs a matching `stop` + `remove`. Always pair resource creation with teardown, even in WebSocket disconnect handlers, to prevent orphaned containers.
19. **Backend URLs must be configurable**: Hardcoding `ws://localhost:3001` in frontend code will break in any non-localhost deployment. Centralise in a dedicated module with `import.meta.env` fallbacks.
20. **Never rely on tiny dimensions for reflow**: Using `height: '0.001em'` to "force reflow" just breaks rendering. Use `height: '100%'` or flex-grow instead.
21. **Reconnect delays need exponential backoff**: A fixed reconnect delay hammers a struggling server. Doubling the delay (capped) is the correct pattern for WebSocket reconnection resilience.

- **VFS traversal helpers (`walkAndDelete`, `recurseMoveNode`) should live in `src/utils/vfsHelpers.ts`**. Keeping them as reusable, independently testable functions prevents code duplication and makes the VFS logic easier to reason about.
- **`manualChunks` for `lucide-react` undermines per-app bundle splitting**. Forcing a monolithic `lucide` chunk made every page load pay the full ~587 KB cost, which is the exact opposite of the named-import optimization. Removing the `manualChunks` block lets Vite's default strategy do its job.
- **Debounce localStorage writes triggered by rapid UI events**. Writing `desktopIcons` to `localStorage` on every state change caused unnecessary disk flushes during drag operations. A 300 ms debounce with proper cleanup eliminates this overhead without losing the final position.

### Real Terminal Feature (Implemented 2026-06-05)

A real bash terminal has been integrated into UbuntuOS Web via `node-pty` + Docker.

**Backend implementation:**
- **JWT auth**: Backend `/auth/token` endpoint issues signed JWTs via `jose`; frontend `useAuthToken` fetches from backend in production, falls back to dev-only generator locally.
- **WebSocket server**: `src/websocket.ts` handles connections, spawns Docker containers, and bridges PTY I/O bidirectionally.
- **Docker hardening**: `--read-only`, `--cap-drop=ALL`, `--network=none`, `-u 1000:1000`, CPU/memory/PID limits.
- **Container lifecycle**: `stopAndRemoveContainer()` ensures containers are torn down when sessions end or expire, preventing orphaned containers.
- **Reconnection**: Sessions are keyed by `sessionId`. If a WebSocket reconnects with an existing `sessionId`, the existing container/PTY is reused, preserving bash state across refreshes.
- **Session persistence**: In-memory `SessionStore` with disconnect grace period (5 min), heartbeat, cleanup cron, and `ttlMs` (total session TTL).
- **Tests**: 33 backend tests (9 test files) covering auth, config, docker, sessionStore, message protocol, logger, and policy.

**Frontend implementation:**
- **RealTerminal.tsx**: xterm.js v5 with `@xterm/addon-fit` and `@xterm/addon-web-links`, `ResizeObserver` for auto-fit, WebSocket client with exponential backoff (1–30 s), `sessionId` persisted in localStorage with zod validation (`safeJsonParse`).
- **Backend URL centralisation**: `src/utils/backendUrl.ts` resolves `BACKEND_BASE` and `BACKEND_WS` from `import.meta.env` with dev defaults, eliminating hardcoded URLs.
- **Focus handling**: Watches `useOS().windows` for `isFocused` and calls `terminal.focus()` when the window is active.
- **Cleanup**: On unmount, sends `close` message via WebSocket, clears reconnect timers, and disposes the terminal.
- **AppRouter**: `real-terminal` case lazy-loads `RealTerminal` and passes `windowId`.

**Production deployment:**
- **Nginx config**: `backend/nginx.conf` provides WebSocket proxying with `Upgrade`/`Connection` headers, plus HTTP auth and frontend routing.

**Validation:**
- TypeScript: 0 errors (`tsc -b --noEmit`)
- Vitest: 150 passing tests frontend + 45 backend tests (203 total). Component tests using `@/` aliases work when run from the `app/` directory.
- Vite build: successful, `RealTerminal` chunk generated (296 KB gzipped for xterm.js)

**Files:**
- [Validated_Implementation_Plan_Real_Terminal.md](Validated_Implementation_Plan_Real_Terminal.md) — the corrected plan
- [Code_Review_Audit_xterm_VALIDATED.md](Code_Review_Audit_xterm_VALIDATED.md) — independent validation report
