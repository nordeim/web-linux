# Meticulous Review, Validation & Audit Plan for UbuntuOS Web

---

## Phase 1: Deep Comprehension — Document Analysis

### 1.1 Analyze AGENTS.md

**Objective:** Extract the authoritative architectural briefing, non-obvious patterns, and hard-won lessons.

**Key extraction points to catalogue:**

| Area | What to Extract |
|---|---|
| **Window Manager** | Z-index stacking mechanism (`nextZIndex`, cap at `2147483647`), state transitions (`normal`/`minimized`/`maximized`), `prevPosition`/`prevSize` capture logic, cascading offset (30px), focus selection after minimize/close |
| **Safe Evaluator** | Shunting-yard algorithm scope, `ALLOWED_CHARS` regex boundary (`0-9.+-*/^()` and whitespace), mandatory usage rule, which apps were remediated (`Spreadsheet.tsx`, `Terminal.tsx`) |
| **XSS Sanitization** | Three distinct sanitizer configurations (markdown whitelist, code editor tags, regex tester mark tag), which apps were remediated (`Notes.tsx`, `MarkdownPreview.tsx`, `RegexTester.tsx`, `CodeEditor.tsx`) |
| **localStorage Validation** | Zod schema enforcement, `validateDesktopIcons(defaultIcons)` and `validateFileSystem(defaultFS)` APIs, versioned key `ubuntuos_filesystem_v2`, legacy key migration |
| **VFS** | ID-based node referencing (not paths), `findNodeByPath` normalization rules, `FILE_ASSOCIATIONS` registry, persistence key |
| **Anti-Patterns** | Enumerate all forbidden patterns: `eval()`, raw `dangerouslySetInnerHTML`, unvalidated localStorage, direct DOM manipulation for window ops, path-based VFS calls, custom window chrome, bypassing the store |
| **Troubleshooting** | Z-index overflow symptom/root cause/fix, window state restoration fix, localStorage corruption handling, math evaluation failure causes |
| **Outstanding Issues** | Missing error boundaries, chunk size warning, debug console.logs, VFS localStorage ~5MB cap, accessibility gaps |

### 1.2 Analyze CLAUDE.md

**Objective:** Extract implementation standards, development conventions, and recommendations.

**Key extraction points:**

| Area | What to Extract |
|---|---|
| **Six-Phase Workflow** | ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER |
| **React & TypeScript Rules** | React 19 functional components, strict TypeScript (no `any`), `useOS` hook for system state, `useFileSystem` for file ops |
| **UI & Styling** | Tailwind CSS 3.4 with design tokens in `index.css`, Shadcn UI base components in `src/components/ui`, Lucide React icons, responsive design requirement |
| **Security Rules** | Three mandatory rules (safeEval, sanitizeHtml, zod validation) — cross-reference with AGENTS.md for consistency |
| **Persistence Rules** | Versioned key `ubuntuos_filesystem_v2`, validation functions |
| **Project Structure** | `src/apps/`, `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` |
| **Build Commands** | `npm run dev/build/lint/test/preview`, `tsc -b` |
| **Adding a New App** | 4-step process: component → registry → AppRouter → optional desktop icon |
| **Lessons Learned** | Security (eval never safe, XSS persistent vector, zod non-optional), State (monolithic reducers, z-index fragility, window state guards), Testing (TDD effective, component tests missing) |
| **Recommendations** | Error boundaries, IndexedDB migration, coverage collection, CI/CD, reducer splitting |

### 1.3 Analyze README.md

**Objective:** Extract public-facing project description, feature matrix, and known issues.

**Key extraction points:**

| Area | What to Extract |
|---|---|
| **Overview** | SPA running entirely in browser, custom z-index stacking, VFS with local persistence |
| **Feature Matrix** | 6 categories × specific app counts: System (7), Productivity (10), Internet (7), Media (7), Games (11), DevTools (8), Creative (4) — total = 54 |
| **Security Improvements** | 5 remediation items: eval elimination, XSS fixes, zod validation, z-index overflow fix, fragile reduce logic fix |
| **Tech Stack Table** | Exact versions: React 19.2.0, TypeScript 5.9.3, Vite 7.2, Tailwind 3.4.19, Lucide 0.562.0, DOMPurify 3.4.7, Zod 4.3.5 |
| **Core Systems** | Window Manager (`WindowFrame.tsx`), OS Store (Context + useReducer), VFS (hierarchical nodes, localStorage, zod) |
| **Known Issues** | 5 items: chunk size, missing error boundaries, console.logs, accessibility, localStorage 5MB limit |
| **Documentation Index** | AGENTS.md, CLAUDE.md, GEMINI.md, REMEDIATION.md, plan.md |

### 1.4 Analyze GEMINI.md

**Objective:** Extract architectural details, conventions, and any unique information not in other docs.

**Key extraction points:**

| Area | What to Extract |
|---|---|
| **Tech Stack (detailed)** | Radix UI primitives & Shadcn UI, DOMPurify for XSS (noted differently from AGENTS.md which mentions custom `sanitizeHtml.ts` — potential discrepancy to investigate) |
| **Coding Style** | Strict typing enforced, `unknown` for unpredictable data (not `any`), functional components with `memo` for performance-critical UI, PascalCase components/types, camelCase utilities/hooks |
| **Theming** | CSS variables via `src/index.css`, Light/Dark mode support, `var(--accent-primary)` pattern |
| **New Apps Checklist** | 6-step process (more detailed than CLAUDE.md's 4-step), includes safeEval/sanitizeHtml/zod reminders |
| **UI Primitives** | Check `src/components/ui/` before creating custom components |

### 1.5 Cross-Document Reconciliation

**Objective:** Identify consistencies and discrepancies across all four documents.

**Reconciliation matrix:**

| Topic | AGENTS.md | CLAUDE.md | README.md | GEMINI.md | Status |
|---|---|---|---|---|---|
| XSS sanitization library | Custom `sanitizeHtml.ts` | Custom `sanitizeHtml.ts` | DOMPurify 3.4.7 | DOMPurify | **Discrepancy**: Is the custom sanitizer a wrapper around DOMPurify, or separate? |
| React version | Not specified | React 19 | React 19.2.0 | React 19 | Minor: README has exact version |
| VFS persistence key | `ubuntuos_filesystem_v2` | `ubuntuos_filesystem_v2` | Not specified | Not specified | Consistent |
| Error boundaries | Missing (outstanding) | Missing (recommendation) | Missing (known issue) | Not mentioned | Consistent on absence |
| App count | Not specified | Not specified | 54 | 54 | Consistent |
| Build tool | Not specified | Not specified | Vite 7.2 | Vite 7.2 | Consistent |
| Adding new app steps | 4 steps | 4 steps | Not specified | 6 steps | GEMINI.md more detailed |
| osReducer line count | 499 lines | 499 lines | Not specified | Not specified | Consistent |

---

## Phase 2: Validation Against Codebase

### 2.1 Validate Architectural Claims

**For each architectural claim in the docs, verify against actual source code:**

| Claim | Validation Target | What to Check |
|---|---|---|
| Window Manager uses `nextZIndex` with cap at 2147483647 | `src/hooks/useOSStore.tsx` | Locate `OPEN_WINDOW` and `FOCUS_WINDOW` reducer cases; verify `Math.min(nextZIndex + 1, 2147483647)` |
| `MINIMIZE_WINDOW` selects next active by z-index | `src/hooks/useOSStore.tsx` | Locate `MINIMIZE_WINDOW` case; verify `visibleWindows.length > 0 ? visibleWindows.reduce(...).id : null` pattern |
| `CLOSE_WINDOW` also selects next active | `src/hooks/useOSStore.tsx` | Locate `CLOSE_WINDOW` case; verify same pattern |
| `RESTORE_WINDOW` uses `prevPosition`/`prevSize` | `src/hooks/useOSStore.tsx` | Locate `RESTORE_WINDOW` case; verify fallback to current values |
| Cascading: 30px offset | `src/hooks/useOSStore.tsx` or `createWindow` helper | Verify the 30px offset logic |
| `safeEval()` uses shunting-yard | `src/utils/safeEval.ts` | Verify algorithm implementation, `ALLOWED_CHARS` regex, allowed character set |
| `sanitizeHtml()` wraps DOMPurify | `src/utils/sanitizeHtml.ts` | Verify wrapper structure, markdown/code-editor/regex-tester configurations |
| `storageValidation.ts` uses zod | `src/utils/storageValidation.ts` | Verify `DesktopIconSchema`, `FileSystemStateSchema`, `safeParse` usage |
| VFS is ID-based | `src/hooks/useFileSystem.ts` | Verify node structure uses IDs, `findNodeByPath` normalization |
| `FILE_ASSOCIATIONS` registry exists | `src/hooks/useFileSystem.ts` | Verify extension-to-appId mapping |
| VFS key is `ubuntuos_filesystem_v2` | `src/hooks/useFileSystem.ts` or `useOSStore.tsx` | Verify localStorage key string |

### 2.2 Validate Component Structure

| Claim | Validation Target | What to Check |
|---|---|---|
| App entry renders boot → login → desktop | `src/App.tsx` (provided) | Verify `showBoot`, `showLogin`, `showDesktop` conditional rendering | **Verified in provided code** |
| `OSProvider` wraps everything | `src/App.tsx` (provided) | Verify `<OSProvider><AppShell /></OSProvider>` | **Verified in provided code** |
| Desktop renders icons with drag support | `src/components/Desktop.tsx` (provided) | Verify grid snapping (GRID_X=80, GRID_Y=90), drag state, context menu | **Verified in provided code** |
| Login screen has unlock + guest | `src/components/LoginScreen.tsx` (provided) | Verify `LOGIN` dispatch with `isGuest` flag | **Verified in provided code** |
| NotificationSystem shows max 5 toasts | `src/components/NotificationSystem.tsx` (provided) | Verify `.slice(0, 5)` | **Verified in provided code** |
| ContextMenu has edge detection | `src/components/ContextMenu.tsx` (provided) | Verify bounds checking against `window.innerWidth/Height` | **Verified in provided code** |
| `WindowFrame.tsx` is standardized shell | Docs claim this | Verify it exists and handles title bar, resize handles |
| `AppRouter.tsx` maps appId to components | Docs claim this | Verify central routing component |
| `registry.ts` defines app metadata | Docs claim this | Verify category, default size, icon fields |
| Shadcn UI components in `src/components/ui/` | Docs claim this | Verify provided UI components (button, card, select, etc.) | **Partially verified**: 13+ UI components provided |

### 2.3 Validate Provided Config Files

| File | What to Validate |
|---|---|
| `package.json` | Verify React 19.2.0, TypeScript ~5.9.3, Vite ^7.2.4, Tailwind ^3.4.19, Zod ^4.3.5, Lucide ^0.562.0 match doc claims. Note: DOMPurify is NOT in dependencies — **potential discrepancy** with README's claim of DOMPurify 3.4.7 |
| `vite.config.ts` | Verify port 3000, `@` alias to `./src`, sourcemap enabled, manual chunks for react and lucide |
| `tsconfig.json` / `tsconfig.app.json` | Verify strict mode, `@/*` path alias, bundler module resolution |
| `tailwind.config.js` | Verify dark mode via `class`, CSS variable design tokens (hsl pattern), `tailwindcss-animate` plugin |
| `components.json` | Verify `new-york` style, `rsc: false`, lucide icon library |
| `eslint.config.js` | Verify TypeScript + React hooks + React refresh plugins |

### 2.4 Gap Identification in Provided Code

**Check for issues already visible in provided source files:**

| File | Potential Issue |
|---|---|
| `NotImplemented.tsx` | References `Icons.HelpCircle` and `Icons.Hammer` but imports `* as Icons` from `lucide-react` only in the error branch — the main branch uses `DynamicIcon`. Need to verify the import. |
| `NotImplemented.tsx` | Uses `Icons.HelpCircle` without importing `* as Icons` at the top of the file — **likely a bug** (only imports `getAppById` and `DynamicIcon`) |
| `Home.tsx` | Appears to be a default Vite template, not an UbuntuOS component — **may be dead code** |
| `ContextMenu.tsx` | `handleMenuAction` function takes `_state: unknown` — inconsistent typing with the rest of the codebase |
| `ContextMenu.tsx` | Several action cases are placeholders (`NEW_FOLDER`, `NEW_DOCUMENT`, `CHANGE_BG`, etc.) — **incomplete implementation** |
| `App.tsx` | Alt+Tab emoji rendering uses hardcoded emoji strings instead of Lucide icons — **inconsistent with design system** |
| `NotificationSystem.tsx` | Timer cleanup: if component unmounts while progress bar is running, the interval may leak (depends on React's cleanup behavior) |
| `sonner.tsx` | Uses `next-themes` (`useTheme`) but the main app uses a custom theme system via `useOS` — **potential theme inconsistency** |
| `LoginScreen.tsx` | Password field accepts any input but dispatches `LOGIN` regardless — **no actual authentication** (by design, but worth noting) |
| `vite.config.ts` | Uses `plugin-inspect-react-code` — not documented in any of the four MD files |

---

## Phase 3: Critical Code Review & Audit

### 3.1 Security Audit

| Category | Audit Focus | Method |
|---|---|---|
| **eval/Function usage** | Search all `src/` files for `eval(`, `new Function(`, `Function(` patterns | Grep/search across all provided and referenced files |
| **dangerouslySetInnerHTML** | Search for all instances; verify each is wrapped in `sanitizeHtml()` | Grep for `dangerouslySetInnerHTML` in all source files |
| **localStorage trust** | Search for `JSON.parse` calls; verify each has zod validation | Grep for `JSON.parse` and `localStorage.getItem` |
| **XSS attack surface** | Review user input points: Terminal commands, Notes content, Markdown preview, Code editor, Browser URL/content, Regex tester, Chat messages | Trace data flow from input → render for each app |
| **Stored XSS via VFS** | Verify that file content persisted to localStorage is sanitized before rendering | Check read → render pipeline |
| **Prototype pollution** | Check if VFS node creation allows `__proto__` or `constructor` keys | Review node creation logic |
| **localStorage injection** | Verify zod schemas reject unexpected fields/types | Review schema definitions |
| **CSP concerns** | Check if the app sets Content-Security-Policy headers | Review `index.html` and any server config |

### 3.2 Bug & Reliability Audit

| Category | Audit Focus | Method |
|---|---|---|
| **Missing Error Boundaries** | Confirm `AppRouter` and `WindowManager` lack React Error Boundaries | Review component hierarchy in `App.tsx` |
| **State mutation** | Check if reducer cases mutate state directly instead of returning new objects | Review all cases in `osReducer` |
| **Memory leaks** | Check for: uncleared intervals/timeouts, event listeners not cleaned up, refs holding stale closures | Review `useEffect` cleanup in all components |
| **Race conditions** | Check boot sequence timing, login flow, window state transitions for potential race conditions | Trace state transitions |
| **Null/undefined access** | Check `activeWindowId` usage — docs warn it can be `null` | Search for `activeWindowId` dereferences without null checks |
| **Z-index cap hit** | Verify bounds check is in both `OPEN_WINDOW` and `FOCUS_WINDOW` | Review reducer |
| **Type safety** | Search for `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error` | Grep across all source files |
| **Console.log statements** | Docs acknowledge debug logs remain | Search for `console.log` in production code |
| **Dead code** | `Home.tsx` appears unused; check for other unused components/files | Cross-reference imports |

### 3.3 Architecture & Design Audit

| Category | Audit Focus | Method |
|---|---|---|
| **Monolithic reducer** | The 499-line `osReducer` — assess domain mixing, testability | Review reducer structure and count lines per domain |
| **Component coupling** | Check if apps directly import from other apps or bypass the store | Review cross-app imports |
| **Performance** | Check for missing `memo`, unnecessary re-renders, large component trees | Review `memo` usage, context consumption patterns |
| **Bundle size** | Docs warn >500kB chunk; verify if dynamic imports are used for games | Review `vite.config.ts` manual chunks (only react and lucide split out) |
| **Accessibility** | Docs acknowledge gaps in games/media apps | Review ARIA attributes, keyboard navigation in provided components |
| **Responsive design** | Verify apps handle window resizing | Review window resize handling in `WindowFrame.tsx` and app components |
| **Theme system** | Verify CSS variable consistency between the custom theme system and any third-party theme consumers (sonner uses `next-themes`) | Cross-reference theme implementations |

### 3.4 Testing Audit

| Category | Audit Focus | Method |
|---|---|---|
| **Test coverage** | Only `safeEval` has tests (24 cases); no component tests exist | Review test files |
| **Missing test targets** | `WindowFrame`, `Desktop`, `Dock` are high-value untested components | Identify from docs |
| **Vitest config** | Verify test runner is properly configured | Check `vite.config.ts` and any vitest config |

### 3.5 Documentation Accuracy Audit

| Category | Audit Focus | Method |
|---|---|---|
| **Dependency versions** | DOMPurify claimed in README but absent from `package.json` | Cross-reference `package.json` with README claims |
| **Undocumented dependencies** | `plugin-inspect-react-code`, `next-themes`, `sonner`, `cmdk`, `recharts`, `react-router`, `react-resizable-panels`, `vaul`, `embla-carousel-react` present in `package.json` but not documented | Cross-reference |
| **Feature completeness** | 54 apps claimed; verify all are registered in `registry.ts` and routed in `AppRouter.tsx` | Count registrations |
| **Remediation claims** | README lists 5 specific fixes; verify each fix is present in code | Trace each fix |

---

## Execution Order

```
Phase 1 (Document Analysis)
  ├── 1.1 AGENTS.md extraction
  ├── 1.2 CLAUDE.md extraction
  ├── 1.3 README.md extraction
  ├── 1.4 GEMINI.md extraction
  └── 1.5 Cross-document reconciliation
         │
Phase 2 (Validation) ◄──────────────────┘
  ├── 2.1 Architectural claims → verify in source
  ├── 2.2 Component structure → verify in source
  ├── 2.3 Config file validation
  └── 2.4 Gap identification in provided code
         │
Phase 3 (Audit) ◄────────────────────────┘
  ├── 3.1 Security audit (8 items)
  ├── 3.2 Bug & reliability audit (9 items)
  ├── 3.3 Architecture & design audit (7 items)
  ├── 3.4 Testing audit (3 items)
  └── 3.5 Documentation accuracy audit (4 items)
         │
Final Deliverable ◄──────────────────────┘
  ├── Consolidated findings report
  ├── Severity-ranked issue list (Critical → Low)
  ├── Discrepancy matrix (docs vs. code)
  └── Improvement recommendations
```

---

## Preliminary Findings from Provided Code (Phase 2.4 Already Actionable)

These issues were identified during the planning phase from the code already provided:

1. **`NotImplemented.tsx` — Missing import**: References `Icons.HelpCircle` and `Icons.Hammer` but only imports `getAppById` and `DynamicIcon`. The `Icons` namespace is not imported. This would cause a runtime error when rendering.

2. **`package.json` — DOMPurify absent**: README.md and GEMINI.md claim DOMPurify 3.4.7 is used for XSS sanitization, but it does not appear in `dependencies` or `devDependencies`. Either the docs are inaccurate, or DOMPurify was removed in favor of the custom `sanitizeHtml.ts` wrapper (which may use a different approach).

3. **`sonner.tsx` — Theme system mismatch**: Uses `next-themes`'s `useTheme()` hook, but the main application manages theme via `useOS()` store with `state.theme.mode`. These are two independent theme systems that would not stay in sync.

4. **`ContextMenu.tsx` — Placeholder actions**: `handleMenuAction` has switch cases for `NEW_FOLDER`, `NEW_DOCUMENT`, `CHANGE_BG`, `ARRANGE_ICONS`, `SHOW_SETTINGS`, `PIN_DOCK`, `UNPIN_DOCK`, `QUIT_APP` that are all empty placeholders with a comment "will be handled by the component that opens the menu." These actions are surfaced in context menus but do nothing.

5. **`vite.config.ts` — Undocumented plugin**: Uses `plugin-inspect-react-code` (`inspectAttr()`) which is not mentioned in any of the four documentation files.

6. **`Home.tsx` — Dead code**: Contains only the default Vite + React counter template and does not appear to be part of the UbuntuOS application.

---

# UbuntuOS Web — Full Execution of Review, Validation & Audit

---

## Phase 1: Deep Document Analysis

### 1.1 AGENTS.md Extraction

**Purpose:** High-signal technical briefing for AI coding agents, focused on non-obvious patterns, security rules, and lessons from the security audit completed 2026-05-31.

**Window Manager (`useOSStore.tsx`):**
- Focus is managed via a global `nextZIndex` counter. Dispatching `FOCUS_WINDOW` increments it. Manual CSS z-index is forbidden.
- Z-index is capped at `2147483647` (CSS max) to prevent overflow in long sessions.
- Three window states: `normal`, `minimized`, `maximized`. Restoration uses `prevPosition` and `prevSize` stored on the window object.
- State transition gotchas:
  - `MINIMIZE_WINDOW`: Next active window selected by z-index from remaining visible windows. If all minimized, `activeWindowId` becomes `null`.
  - `CLOSE_WINDOW`: Same z-index-based next-active selection. If no windows remain, `activeWindowId` becomes `null`.
  - `RESTORE_WINDOW`: Uses `prevPosition`/`prevSize`; falls back to current values if none exist.
- Cascading: New windows offset by 30px from the last window of the same app type via the `createWindow` helper.

**Safe Evaluator (`safeEval.ts`):**
- MANDATORY for all math evaluation (spreadsheet formulas, terminal `calc`).
- Replaces `eval()` and `new Function()` with a hardened shunting-yard parser.
- Allowed characters: digits, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, whitespace.
- Validates input against `ALLOWED_CHARS` regex, tokenizes, converts to RPN via shunting-yard, evaluates RPN safely.
- Bug fix history: `Spreadsheet.tsx` and `Terminal.tsx` previously used `eval()` and `new Function()`.

**XSS Sanitization (`sanitizeHtml.ts`):**
- MANDATORY for any `dangerouslySetInnerHTML`.
- `sanitizeMarkdownHtml()`: Whitelist for common markdown tags (`p`, `h1`-`h6`, `ul`, `ol`, `li`, `strong`, `em`, `code`, `pre`, `blockquote`, `a`, `img`, `del`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `hr`).
- Code Editor: `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`.
- Regex Tester: `sanitizeHtml(..., {ADD_TAGS: ['mark']})`.
- Bug fix history: `Notes.tsx`, `MarkdownPreview.tsx`, `RegexTester.tsx`, `CodeEditor.tsx` previously rendered raw HTML.

**localStorage Schema Validation (`storageValidation.ts`):**
- MANDATORY: Any code reading from localStorage must validate with zod schemas.
- Desktop Icons: `validateDesktopIcons(defaultIcons)` runs `z.array(DesktopIconSchema).safeParse(parsed)`.
- VFS: `validateFileSystem(defaultFS)` runs `FileSystemStateSchema.safeParse(parsed)`.
- Versioned key: `ubuntuos_filesystem_v2`. Legacy key `ubuntuos_filesystem` for forward migration only.
- Bug fix history: `useOSStore.tsx` and `useFileSystem.ts` previously used `JSON.parse(saved) as T`.

**Virtual File System (`useFileSystem.ts`):**
- ID-based: Nodes referenced by unique IDs, not paths. `findNodeByPath(path)` only for user-provided strings.
- Persisted to localStorage under `ubuntuos_filesystem_v2`.
- `FILE_ASSOCIATIONS` maps extensions to `appId` and icons.
- Path normalization: `findNodeByPath('/home//user/')` normalizes to `/home/user`; trailing slashes and double slashes handled.

**Development Workflow — Adding a New App (4 steps):**
1. Create `src/apps/YourApp.tsx`
2. Add entry to `src/apps/registry.ts` (category, default size, icon)
3. Register `appId` in `src/apps/AppRouter.tsx`
4. Use Lucide React names in the registry

**Common Commands** (from `app/` directory):
- `npm run dev`, `npm run build`, `npm run lint`, `npm run test`

**Anti-Patterns (6 forbidden patterns):**
1. `eval()` / `new Function()` — use `safeEval()`
2. Raw `dangerouslySetInnerHTML` — use `sanitizeHtml()`
3. Unvalidated localStorage — use zod
4. Direct DOM manipulation for window ops — use `OSAction` dispatches
5. Path-based VFS calls — use node `id`
6. Custom window chrome — use `WindowFrame.tsx`
7. Bypassing the store for app-to-app communication — use `useOS` hook or File System

**Troubleshooting (4 scenarios):**

| Symptom | Root Cause | Fix Status |
|---|---|---|
| Window focus erratic after long session | `nextZIndex` exceeds CSS max | Fixed: `Math.min(nextZIndex + 1, 2147483647)` in both `OPEN_WINDOW` and `FOCUS_WINDOW` |
| Wrong window focused after minimize | `MINIMIZE_WINDOW` used fragile `.reduce()` with `null` initial | Fixed: explicit `visibleWindows.length > 0 ? visibleWindows.reduce(...).id : null` |
| App crashes on load, corrupted icons/files | localStorage data corrupted | Fixed: zod validation with fallback to defaults |
| Spreadsheet/terminal calc returns `#VALUE!` | `safeEval()` rejects unsupported chars | Check for `%`, `&`, `|`, `!`, function names; only basic arithmetic + `^` supported |

**Outstanding Issues (as of 2026-05-31):**
1. Missing React Error Boundaries on `AppRouter` and `WindowManager`
2. Production build chunk size >500 kB
3. Debug `console.log` statements remain in several apps
4. VFS localStorage ~5 MB cap; consider IndexedDB
5. Accessibility gaps in games and media apps

**Lessons Learned (4 items):**
1. `eval()` is never safe, even with regex sanitization
2. TypeScript types are not runtime guarantees; `JSON.parse()` + `as T` is a risk
3. Monolithic reducers are hard to maintain (499-line `osReducer`)
4. Window state transitions are surprisingly complex

---

### 1.2 CLAUDE.md Extraction

**Purpose:** Coding standards and implementation guidelines for Claude AI.

**Foundational Principles — Six-Phase Workflow:**
1. ANALYZE — Deep requirement mining
2. PLAN — Structured roadmap with validation
3. VALIDATE — Explicit user confirmation
4. IMPLEMENT — Modular, tested builds
5. VERIFY — Rigorous QA (edge cases, accessibility)
6. DELIVER — Complete handoff

**Implementation Standards:**

*React & TypeScript:*
- React 19: Functional components and hooks
- Strict TypeScript: No `any`, explicit interfaces
- State Management: `useOS` hook (React Context + useReducer)
- File System: `useFileSystem` hook

*UI & Styling:*
- Tailwind CSS 3.4 with design tokens in `index.css`
- Shadcn UI base components in `src/components/ui`
- Lucide React for icons
- Responsive design for window resizing

*Security (three MANDATORY rules):*
1. `safeEval()` from `@/utils/safeEval` for all math — forbids `eval()` and `new Function()`
2. `sanitizeHtml()` from `@/utils/sanitizeHtml` for all `dangerouslySetInnerHTML` — markdown uses `sanitizeMarkdownHtml()`, code highlighting uses `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`, regex uses `sanitizeHtml(..., {ADD_TAGS: ['mark']})`
3. `validateDesktopIcons()` or `validateFileSystem()` from `@/utils/storageValidation` for all localStorage reads — never trust `JSON.parse()`

*Persistence:*
- VFS uses `ubuntuos_filesystem_v2`
- Legacy keys supported for migration, new code writes only to versioned key

**Project Structure:**
- `app/src/apps/` — Individual application components
- `app/src/components/` — Core desktop environment (Dock, Desktop, etc.)
- `app/src/hooks/` — Core state and FS logic
- `app/src/utils/` — Utility functions
- `app/src/types/` — Centralized type definitions

**Adding a New App (4 steps):**
1. Create component in `app/src/apps/YourAppName.tsx`
2. Register in `app/src/apps/registry.ts`
3. Add component to `app/src/apps/AppRouter.tsx`
4. (Optional) Add desktop icon in `app/src/hooks/useOSStore.tsx` in `defaultDesktopIcons`

**Lessons Learned:**

*Security (3 items):*
- `eval()` and `new Function()` are never safe
- `dangerouslySetInnerHTML` without sanitization is a persistent XSS vector, especially with localStorage (stored XSS)
- Runtime schema validation is non-optional; zod is the correct defense

*State Management (3 items):*
- Monolithic reducers violate separation of concerns; 499-line `osReducer` is difficult to test
- Z-index as a number is fragile; 2147483647 cap is correct but periodic recalculation would be better
- Window state transitions need explicit guards for `activeWindowId` null dereferences

*Testing (2 items):*
- TDD effective for security-critical code (24 test cases for `safeEval`)
- Component-level tests missing for `WindowFrame`, `Desktop`, `Dock`

**Recommendations (5 items):**
1. Add React Error Boundaries around `AppRouter` and `WindowManager`
2. Migrate VFS from localStorage to IndexedDB
3. Add vitest coverage collection
4. Implement CI/CD pipeline
5. Split `osReducer` into domain-specific reducers

---

### 1.3 README.md Extraction

**Purpose:** Public-facing project description and documentation hub.

**Project Description:**
- High-fidelity, interactive Ubuntu Linux desktop replica running entirely in the browser
- SPA demonstrating modern React architecture
- Multi-windowed UI with custom z-index stacking and virtualized file system with localStorage persistence

**Feature Matrix (6 categories, 54 total apps):**

| Category | App Count | Examples |
|---|---|---|
| System | 7 | Terminal (bash commands), File Manager, System Monitor, Settings |
| Productivity | 10 | Calendar, Spreadsheet, Todo List, Password Manager, Whiteboard |
| Internet | 7 | Tabbed Browser, Email Client, Chat, RSS Reader, Network Tools |
| Media | 7 | Video/Music Players, Photo Editor, Screen/Voice Recorders |
| Games | 11 | Chess (AI), Tetris, Minesweeper, Solitaire, 2048, Sudoku |
| DevTools | 8 | Code Editor, Git Client, JSON Formatter, Regex Tester, API Tester |
| Creative | 4 | Drawing, Image Gallery, Color Picker, ASCII Art |

**Security & Reliability Improvements (5 items):**
1. Eliminated arbitrary code execution — replaced `eval()` (Spreadsheet) and `new Function()` (Terminal) with hardened shunting-yard parser
2. Fixed XSS vulnerabilities — all `dangerouslySetInnerHTML` wrapped in DOMPurify-based sanitization
3. Added localStorage schema validation — zod at runtime
4. Fixed z-index overflow — bounds checking
5. Resolved fragile reduce logic — window state restoration

**Tech Stack (with versions):**

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Build | Vite | 7.2 |
| Styling | Tailwind CSS | 3.4.19 |
| Components | Radix UI / Shadcn | Latest |
| Icons | Lucide React | 0.562.0 |
| Storage | LocalStorage | N/A |
| Security | DOMPurify | 3.4.7 |
| Validation | Zod | 4.3.5 |

**Core Systems:**
1. Window Manager in `src/components/WindowFrame.tsx` — dragging, resizing, focus, state transitions
2. OS Store — centralized state via React Context + useReducer
3. VFS — hierarchical nodes (files/folders), localStorage persistence, zod validation

**Quick Start:**
- Prerequisites: Node.js >= 20, npm or yarn
- Commands from `app/`: `npm install`, `npm run dev`
- Verify at `http://localhost:3000`

**Known Issues (5 items):**
1. Chunk size >500 kB warning
2. Missing Error Boundaries on `AppRouter` and `WindowManager`
3. Debug `console.log` statements remain
4. Accessibility gaps in games and media apps
5. VFS localStorage ~5 MB limit

**Documentation Index:**

| Document | Purpose |
|---|---|
| AGENTS.md | Architectural briefing for AI agents |
| CLAUDE.md | Coding standards for Claude |
| GEMINI.md | Project context for Gemini |
| REMEDIATION.md | Full security audit report |
| plan.md | Original roadmap and feature checklist |

---

### 1.4 GEMINI.md Extraction

**Purpose:** Primary instructional context for Gemini AI interactions.

**Project Overview:**
- High-fidelity interactive Ubuntu Linux desktop replica
- SPA running entirely in the browser
- Comprehensive security audit and remediation completed 2026-05-31

**Main Technologies:**
- React 19 (functional components, hooks)
- TypeScript 5.9 (strict mode)
- Vite 7.2
- Tailwind CSS 3.4 (utility-first with CSS variable design tokens)
- Radix UI primitives & Shadcn UI
- Lucide React
- Centralized React Context (`useOSStore.tsx`)
- localStorage-backed VFS with zod schema validation
- DOMPurify for XSS sanitization

**Core Architecture (4 systems):**
1. Shell (`App.tsx`): Boot sequence, login screen, desktop (Dock, TopPanel, Desktop)
2. Window Manager: Lifecycle (open/close/minimize/maximize), focus (z-index stacking), positioning (cascading)
3. VFS (`useFileSystem.ts`): Hierarchical node structure, localStorage persistence, zod validation
4. App Ecosystem: 54 apps in `src/apps/`, managed by `AppRouter.tsx` and `registry.ts`

**Building and Running (from `app/` directory):**

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Production | `npm run build` (tsc then vite build) |
| Lint | `npm run lint` |
| Type check | `tsc -b` |
| Tests | `npx vitest run` |

**Security Requirements (non-negotiable):**
- Math: `safeEval()` from `@/utils/safeEval` only; shunting-yard algorithm; allowed: `0-9`, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, whitespace
- HTML: `sanitizeHtml()` from `@/utils/sanitizeHtml` for all `dangerouslySetInnerHTML`; markdown uses `sanitizeMarkdownHtml()`; code editor uses `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`; regex uses `sanitizeHtml(..., {ADD_TAGS: ['mark']})`
- localStorage: `JSON.parse()` without validation is an anti-pattern; use `validateDesktopIcons()` or `validateFileSystem()`; VFS uses `ubuntuos_filesystem_v2`

**Coding Style:**
- Strict TypeScript: avoid `any`; use `unknown` for unpredictable data
- Component pattern: functional components with `memo` for performance-critical UI (Dock, Desktop)
- Hooks-first: business logic in custom hooks or centralized stores
- Naming: PascalCase for components/types; camelCase for utilities/hooks/variables

**State & Logic:**
- Global state via `useOS()` hook
- File access via `useFileSystem()` hook; reference files by node `id`, not path
- Theming: CSS variables from `src/index.css`, `var(--accent-primary)` pattern, Light/Dark mode via CSS variables

**Adding New Features — New Apps (6 steps):**
1. Create component in `src/apps/`
2. Register metadata in `src/apps/registry.ts`
3. Map `appId` in `src/apps/AppRouter.tsx`
4. If app evaluates math, use `safeEval()`
5. If app shows user HTML, use `sanitizeHtml()`
6. If app persists to localStorage, use zod validation

**Additional instruction:** Check `src/components/ui/` before creating custom UI components.

---

### 1.5 Cross-Document Reconciliation

**Identified Discrepancies and Consistencies:**

| Topic | AGENTS.md | CLAUDE.md | README.md | GEMINI.md | Verdict |
|---|---|---|---|---|---|
| XSS library | Custom `sanitizeHtml.ts` (implied wrapper) | Custom `sanitizeHtml.ts` | DOMPurify 3.4.7 | DOMPurify | **Discrepancy**: AGENTS.md and CLAUDE.md describe a custom utility; README and GEMINI.md name DOMPurify directly. The custom utility likely wraps DOMPurify, but this is not explicitly stated. |
| React version | Not specified | "React 19" | "19.2.0" | "React 19" | Consistent; README provides exact version |
| TypeScript version | Not specified | Not specified | "5.9.3" | "5.9" | Consistent |
| VFS persistence key | `ubuntuos_filesystem_v2` | `ubuntuos_filesystem_v2` | Not specified | `ubuntuos_filesystem_v2` | Consistent |
| Error boundaries | Missing (outstanding issue) | Missing (recommendation) | Missing (known issue) | Not mentioned | Consistent on absence; GEMINI.md is silent on this |
| Total app count | Not specified | Not specified | 54 | 54 | Consistent |
| Adding new app steps | 4 steps | 4 steps (with optional 5th) | Not specified | 6 steps | GEMINI.md adds security checklist steps 4-6; more detailed |
| osReducer size | 499 lines | 499 lines | Not specified | Not specified | Consistent |
| Safe eval algorithm | Shunting-yard | Not named | Shunting-yard | Shunting-yard | Consistent |
| Theming approach | Not specified | Design tokens in `index.css` | Not specified | CSS variables, Light/Dark mode | Consistent across those that mention it |
| Security audit date | 2026-05-31 | Not specified | Not specified | 2026-05-31 | Consistent |
| `eval()` previously in | Spreadsheet, Terminal | Not specified | Spreadsheet, Terminal | Not specified | Consistent |
| XSS previously in | Notes, MarkdownPreview, RegexTester, CodeEditor | Not specified | Not specified | Not specified | Only AGENTS.md provides this detail |
| localStorage previously used | `JSON.parse(saved) as T` | Not specified | Not specified | Not specified | Only AGENTS.md provides this detail |
| Z-index fix detail | `Math.min` in both OPEN and FOCUS | Not specified | Not specified | Not specified | Only AGENTS.md provides this detail |
| Window restore fix | Explicit `visibleWindows.length > 0` check | Not specified | Not specified | Not specified | Only AGENTS.md provides this detail |
| Chunk size | >500 kB | Not specified | >500 kB | Not specified | Consistent |
| localStorage cap | ~5 MB | Not specified | ~5 MB | Not specified | Consistent |
| Vitest | Not specified | Not specified | Not specified | `npx vitest run` | Only GEMINI.md provides the test command explicitly |

---

## Phase 2: Validation Against Provided Codebase

### 2.1 Validate Architectural Claims Against Provided Code

**From `src/App.tsx` (provided in full):**

| Claim | Evidence in Code | Status |
|---|---|---|
| `OSProvider` wraps everything | `<OSProvider><AppShell /></OSProvider>` at bottom of file | **Confirmed** |
| Boot → Login → Desktop conditional flow | `showBoot`, `showLogin`, `showDesktop` variables derived from `bootPhase` and `auth.isAuthenticated` | **Confirmed** |
| Boot phase dispatches `SET_BOOT_PHASE` | `useEffect` dispatches `{ type: 'SET_BOOT_PHASE', phase: 'logo' }` when `bootPhase === 'off'` | **Confirmed** |
| Super key toggles app launcher | `e.key === 'Meta'` dispatches `TOGGLE_APP_LAUNCHER` | **Confirmed** |
| Ctrl+Alt+T opens Terminal | `e.ctrlKey && e.altKey && e.key === 't'` dispatches `OPEN_WINDOW` with `appId: 'terminal'` | **Confirmed** |
| Super+D minimizes all | `e.key === 'd' && (e.metaKey || e.altKey)` dispatches `MINIMIZE_ALL` | **Confirmed** |
| Alt+Tab window switching | `e.key === 'Tab' && e.altKey` dispatches `START_ALT_TAB` / `CYCLE_ALT_TAB` | **Confirmed** |
| Escape closes overlays | Dispatches `SET_APP_LAUNCHER` (false) or `TOGGLE_NOTIFICATION_CENTER` | **Confirmed** |
| Ctrl+W closes active window | `e.ctrlKey && e.key === 'w'` dispatches `CLOSE_WINDOW` with `state.activeWindowId` | **Confirmed** |
| Wallpaper layer uses `state.theme.wallpaper` | Inline style `backgroundImage: url(${state.theme.wallpaper})` | **Confirmed** |
| Theme mode class | `className={state.theme.mode === 'light' ? 'light' : ''}` on root div | **Confirmed** |
| Alt+Tab UI shows non-minimized windows | `.filter((w) => w.state !== 'minimized')` | **Confirmed** |
| Alt+Tab selection via `state.altTabIndex` | `isSelected = i === state.altTabIndex` | **Confirmed** |

**From `src/components/Desktop.tsx` (provided in full):**

| Claim | Evidence in Code | Status |
|---|---|---|
| Grid snapping | `GRID_X = 80`, `GRID_Y = 90` constants; `Math.round((icon.position.x + dx) / GRID_X) * GRID_X + 16` | **Confirmed** |
| Desktop icons are draggable | `draggingId` state, `handleMouseMove` with position dispatch | **Confirmed** |
| Double-click opens app | `handleIconDoubleClick` dispatches `OPEN_WINDOW` with `icon.appId` | **Confirmed** |
| Context menu on desktop right-click | `handleDesktopContextMenu` dispatches `SHOW_CONTEXT_MENU` with `menuType: 'desktop'` | **Confirmed** |
| Context menu items include New Folder, New Document, Change Background, etc. | Items array in `handleDesktopContextMenu` | **Confirmed** |
| Icon selection on click | `onClick` dispatches `SELECT_DESKTOP_ICON` with `id: null` (deselect) | **Confirmed** |
| Icon appears with animation | `animation: 'iconAppear 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'` | **Confirmed** |
| Uses `DynamicIcon` component | Imported and used for rendering icon names | **Confirmed** |
| Desktop top offset = 28px (panel height) | `top: 28` in style | **Confirmed** |
| Desktop bottom offset = 48px (dock height) | `bottom: 48` in style | **Confirmed** |

**From `src/components/LoginScreen.tsx` (provided in full):**

| Claim | Evidence in Code | Status |
|---|---|---|
| Blurred wallpaper background | `backdropFilter: 'blur(24px)'` | **Confirmed** |
| Login dispatches `LOGIN` with `isGuest` | `handleUnlock` dispatches `{ type: 'LOGIN', isGuest: false }`; `handleGuest` dispatches `{ type: 'LOGIN', isGuest: true }` | **Confirmed** |
| Unlock has 800ms delay | `setTimeout(() => { dispatch(...) }, 800)` | **Confirmed** |
| Enter key triggers unlock | `onKeyDown` checks `e.key === 'Enter'` | **Confirmed** |
| Power/Moon/Logout buttons present | Three icon buttons at bottom (Power, Moon, LogOut from lucide-react) | **Confirmed** |

**From `src/components/NotificationSystem.tsx` (provided in full):**

| Claim | Evidence in Code | Status |
|---|---|---|
| Max 5 toasts displayed | `notifications.filter((n) => !n.isRead).slice(0, 5)` | **Confirmed** |
| Toast has auto-dismiss timer | 5000ms duration with 50ms interval | **Confirmed** |
| Progress bar at bottom | Absolute-positioned div with width based on `progress` percentage | **Confirmed** |
| Hover pauses auto-dismiss | `if (isHovered) return;` in the effect | **Confirmed** |
| Enter/exit animations | `toastEnter` (slide from right) and `toastExit` (slide to right) keyframes | **Confirmed** |

**From `src/components/ContextMenu.tsx` (provided in full):**

| Claim | Evidence in Code | Status |
|---|---|---|
| Edge detection | Checks `x + rect.width > vw`, `y + rect.height > vh`, `x < 8`, `y < 8` | **Confirmed** |
| `handleMenuAction` dispatches `OPEN_APP` | `OPEN_APP` case dispatches `OPEN_WINDOW` | **Confirmed** |
| `MINIMIZE_ALL` action dispatches | `dispatch({ type: 'MINIMIZE_ALL' })` | **Confirmed** |
| Several actions are placeholders | `NEW_FOLDER`, `NEW_DOCUMENT`, `CHANGE_BG`, etc. have empty case bodies with comment | **Confirmed** |

---

### 2.2 Validate Against Provided Config Files

**`package.json` Validation:**

| Doc Claim | package.json Value | Status |
|---|---|---|
| React 19.2.0 | `"react": "^19.2.0"` | **Confirmed** |
| TypeScript 5.9.3 | `"typescript": "~5.9.3"` | **Confirmed** |
| Vite 7.2 | `"vite": "^7.2.4"` | **Confirmed** (7.2.x range) |
| Tailwind CSS 3.4.19 | `"tailwindcss": "^3.4.19"` | **Confirmed** |
| Lucide React 0.562.0 | `"lucide-react": "^0.562.0"` | **Confirmed** |
| DOMPurify 3.4.7 | **Not present in dependencies or devDependencies** | **DISCREPANCY** |
| Zod 4.3.5 | `"zod": "^4.3.5"` | **Confirmed** |
| Radix UI | Multiple `@radix-ui/react-*` packages present | **Confirmed** |
| Shadcn UI | `class-variance-authority`, `clsx`, `tailwind-merge` present (Shadcn dependencies) | **Confirmed** |

**Undocumented Dependencies in `package.json` (not mentioned in any of the four MD files):**

| Dependency | Version | Purpose (inferred) |
|---|---|---|
| `plugin-inspect-react-code` | ^1.0.3 | Used in `vite.config.ts` as `inspectAttr()` |
| `next-themes` | ^0.4.6 | Used in `sonner.tsx` for theme detection |
| `sonner` | ^2.0.7 | Toast notification library (used in `sonner.tsx`) |
| `cmdk` | ^1.1.1 | Command palette (likely for App Launcher or search) |
| `recharts` | ^2.15.4 | Charting library (likely for System Monitor) |
| `react-router` | ^7.6.1 | Routing (may not be actively used in SPA context) |
| `react-resizable-panels` | ^4.2.2 | Resizable panel layout |
| `vaul` | ^1.1.2 | Drawer component |
| `embla-carousel-react` | ^8.6.0 | Carousel component |
| `react-day-picker` | ^9.13.0 | Date picker (likely for Calendar app) |
| `react-hook-form` | ^7.70.0 | Form handling |
| `date-fns` | ^4.1.0 | Date utilities |
| `input-otp` | ^1.4.2 | OTP input component |

**`vite.config.ts` Validation:**

| Claim | Value | Status |
|---|---|---|
| Port 3000 | `server: { port: 3000 }` | **Confirmed** |
| `@` alias | `alias: { "@": path.resolve(__dirname, "./src") }` | **Confirmed** |
| Sourcemap enabled | `build: { sourcemap: true }` | **Confirmed** |
| Manual chunks for react and lucide | `manualChunks: { react: [...], lucide: [...] }` | **Confirmed** |
| `inspectAttr()` plugin present | `plugins: [inspectAttr(), react()]` | **Confirmed** (undocumented) |
| `base: './'` | Present | **Confirmed** |

**`tsconfig.app.json` Validation:**

| Claim | Value | Status |
|---|---|---|
| Strict mode | `"strict": true` | **Confirmed** |
| No unused locals | `"noUnusedLocals": true` | **Confirmed** |
| No unused parameters | `"noUnusedParameters": true` | **Confirmed** |
| No fallthrough | `"noFallthroughCasesInSwitch": true` | **Confirmed** |
| `@/*` path alias | `"@/*": ["./src/*"]` | **Confirmed** |
| JSX react-jsx | `"jsx": "react-jsx"` | **Confirmed** |
| Target ES2022 | `"target": "ES2022"` | **Confirmed** |

**`tailwind.config.js` Validation:**

| Claim | Value | Status |
|---|---|---|
| Dark mode via `class` | `"darkMode": ["class"]` | **Confirmed** |
| CSS variable design tokens | `primary: "hsl(var(--primary))"`, etc. | **Confirmed** |
| `tailwindcss-animate` plugin | `plugins: [require("tailwindcss-animate")]` | **Confirmed** |
| Custom animations | `accordion-down`, `accordion-up`, `caret-blink` | **Confirmed** |

**`components.json` (Shadcn) Validation:**

| Field | Value | Status |
|---|---|---|
| Style | `new-york` | **Confirmed** |
| RSC | `false` (not using React Server Components) | **Confirmed** |
| Icon library | `lucide` | **Confirmed** |

---

### 2.3 Gap Identification in Provided Code

**`src/components/NotImplemented.tsx`:**

```tsx
// Line referencing Icons namespace without import:
<Icons.HelpCircle size={48} className="mb-4 opacity-50" />
<Icons.Hammer size={14} />
```

The file imports `{ getAppById }` from registry and `DynamicIcon` from `./DynamicIcon`, but does **not** import `* as Icons` from `lucide-react`. The `Icons` namespace is referenced in two places but never declared. This is a **runtime error** — accessing properties on an undefined variable would throw `ReferenceError: Icons is not defined`.

**`src/pages/Home.tsx`:**

Contains only the default Vite template with a counter button and "Edit src/App.tsx" text. This does not integrate with the UbuntuOS architecture (no `useOS`, no window system, no theming). It appears to be **leftover scaffolding** from project initialization and is likely dead code.

**`src/components/ui/sonner.tsx`:**

Uses `useTheme` from `next-themes`:
```tsx
const { theme = "system" } = useTheme()
```

However, the main application manages theme through `useOS` store with `state.theme.mode` (as seen in `App.tsx`):
```tsx
className={state.theme.mode === 'light' ? 'light' : ''}
```

These are two completely separate theme systems. The `sonner` Toaster will not reflect theme changes made through the OS settings — it will always report `"system"` unless `next-themes`'s `ThemeProvider` is separately mounted (which is not visible in the provided `App.tsx`). This is a **theme synchronization bug**.

**`src/components/ContextMenu.tsx` — `handleMenuAction`:**

The function signature is:
```tsx
function handleMenuAction(action: string, _state: unknown, dispatch: React.Dispatch<import('@/types').OSAction>)
```

The `_state` parameter is typed as `unknown`, which is inconsistent with the broader codebase's strict typing convention. Additionally, seven menu action cases are empty placeholders:
- `NEW_FOLDER`
- `NEW_DOCUMENT`
- `OPEN_TERMINAL`
- `CHANGE_BG`
- `ARRANGE_ICONS`
- `SHOW_SETTINGS`
- `PIN_DOCK`
- `UNPIN_DOCK`
- `QUIT_APP`

These actions are surfaced to users in context menus but produce no effect when clicked. This is an **incomplete implementation** that creates a poor user experience.

**`src/App.tsx` — Alt+Tab emoji rendering:**

The Alt+Tab switcher uses hardcoded emoji strings:
```tsx
<span className="text-xl absolute">{app?.icon === 'Folder' && '📁'}</span>
<span className="text-xl absolute">{app?.icon === 'Terminal' && '⌨'}</span>
```

This is inconsistent with the rest of the codebase, which uses `DynamicIcon` (Lucide React) for iconography. The Desktop component and NotificationSystem both use `DynamicIcon`, but Alt+Tab falls back to emoji. This is an **inconsistency with the design system**.

---

## Phase 3: Critical Code Review & Audit

### 3.1 Security Audit

**3.1.1 `eval()` / `new Function()` Usage**

From the provided code, no instances of `eval()` or `new Function()` were found. The documents state these were replaced with `safeEval()`. However, `safeEval.ts` itself is not among the provided files, so its implementation cannot be directly verified.

*Finding:* The safe eval implementation cannot be audited from the provided content. The documents claim it uses a shunting-yard algorithm with `ALLOWED_CHARS` regex validation.

**3.1.2 `dangerouslySetInnerHTML` Usage**

From the provided code files, no instances of `dangerouslySetInnerHTML` were found. The documents state all instances were wrapped in `sanitizeHtml()`. However, `sanitizeHtml.ts` is not among the provided files.

*Finding:* The sanitization utility cannot be audited. The documents claim it wraps DOMPurify (per README/GEMINI) or uses a custom implementation (per AGENTS/CLAUDE). This inconsistency requires resolution.

**3.1.3 localStorage Trust**

From the provided code, `useOSStore.tsx` is referenced but not fully provided. The documents claim it was fixed to use zod validation. The provided `App.tsx` shows state consumption via `useOS()` but not the store initialization.

*Finding:* localStorage validation cannot be directly verified from the provided code.

**3.1.4 XSS Attack Surface Analysis**

Based on the app feature matrix and provided code, the following user input → render pipelines exist:

| App | Input Type | Render Method | Risk if Unsanitized |
|---|---|---|---|
| Terminal | Command text | Terminal output | Command injection display |
| Notes | Rich text | Display area | Stored XSS via localStorage |
| MarkdownPreview | Markdown source | HTML preview | Stored XSS |
| CodeEditor | Source code | Syntax-highlighted display | XSS via highlighted code |
| Browser | URL + page content | Iframe/content area | Phishing, XSS |
| RegexTester | Regex pattern + test string | Highlighted matches | XSS via match highlighting |
| Chat | Messages | Message display | XSS via chat messages |
| Spreadsheet | Cell content | Cell display | XSS if formulas or content rendered as HTML |
| Email | Email body | Email viewer | Stored XSS via email content |
| Drawing/Whiteboard | Canvas data | Canvas rendering | Low risk (canvas-based) |

*Finding:* The documents identify 4 apps as previously vulnerable (Notes, MarkdownPreview, RegexTester, CodeEditor). The remaining apps are not mentioned in the remediation history. This does not mean they are vulnerable — only that the provided content does not confirm their sanitization status.

**3.1.5 DOMPurify Absence from Dependencies**

The most significant security finding: **DOMPurify is listed as a dependency in README.md (version 3.4.7) and referenced in GEMINI.md, but is completely absent from `package.json`.** 

This creates three possible scenarios:
1. DOMPurify was removed and replaced with a custom sanitizer (`sanitizeHtml.ts`) — in which case the docs are outdated
2. DOMPurify is a transitive dependency of another package — unlikely to be intentional for security-critical code
3. The custom `sanitizeHtml.ts` wraps DOMPurify but it was accidentally omitted from `package.json` — a build-breaking issue

*Severity:* **Critical** — this discrepancy affects the security posture of the entire application.

---

### 3.2 Bug & Reliability Audit

**3.2.1 Missing Error Boundaries**

From `App.tsx`, the component tree is:

```
App
  └── OSProvider
       └── AppShell
            ├── BootSequence
            ├── LoginScreen
            └── Desktop Shell
                 ├── Desktop
                 ├── WindowManager    ← No error boundary
                 ├── TopPanel
                 ├── Dock
                 ├── AppLauncher
                 ├── ContextMenu
                 ├── NotificationSystem
                 └── NotificationCenter
```

No `<ErrorBoundary>` components are visible in the provided code. All three documents that mention this issue (AGENTS.md, CLAUDE.md, README.md) agree it is missing.

*Finding:* **Confirmed missing.** A crash in any component (especially WindowManager or any app rendered within it) would bring down the entire shell.

**3.2.2 `NotImplemented.tsx` — Undefined `Icons` Reference**

As identified in Phase 2.3, the file references `Icons.HelpCircle` and `Icons.Hammer` without importing the `Icons` namespace from `lucide-react`. This would produce a `ReferenceError` at runtime when any unimplemented app is opened.

*Severity:* **Critical** — any app that routes to `NotImplemented` will crash.

*Note:* This could be masked if `NotImplemented` is never actually rendered (e.g., if the error boundary or router catches it first), but given that the project has 54 apps and the docs imply many are placeholders, this is a high-probability crash path.

**3.2.3 `sonner.tsx` Theme Mismatch**

As identified in Phase 2.3, `sonner.tsx` uses `next-themes` while the rest of the app uses a custom theme system. The `Toaster` component will not respond to theme changes made through UbuntuOS settings.

*Severity:* **Medium** — the toast notifications will display in a potentially wrong theme, creating visual inconsistency.

**3.2.4 `ContextMenu.tsx` — Placeholder Actions**

Seven action handlers are empty stubs. Users can trigger these actions through the context menu (e.g., "New Folder", "New Document", "Change Background") but nothing happens.

*Severity:* **Medium** — functional gap that impacts user expectations. The Desktop component's context menu includes these as available options.

**3.2.5 Potential Memory Leak in `NotificationSystem.tsx`**

The `Toast` component creates a `setInterval` in a `useEffect`:
```tsx
useEffect(() => {
    if (isHovered) return;
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          setIsExiting(true);
          setTimeout(onClose, 250);
          return 0;
        }
        return prev - step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [isHovered, onClose]);
```

The cleanup function `return () => clearInterval(timer)` correctly handles the interval. However, the inner `setTimeout(onClose, 250)` is created inside the interval callback when progress reaches zero, and this timeout is **not cleaned up** if the component unmounts during the 250ms exit animation window. The `onClose` callback references `dispatch`, which may point to a stale closure if the component has unmounted.

*Severity:* **Low** — the window is narrow (250ms) and the consequence is a dispatch to a potentially stale function, which React's batching typically handles gracefully.

**3.2.6 `App.tsx` — Alt+Tab Holding State**

The `altTabRef` is initialized as `{ holding: boolean }` but is only set to `true` on Alt keydown and `false` on Alt keyup during Alt+Tabbing. However, the `handleKeyUp` function only resets `holding` when `state.isAltTabbing` is true:

```tsx
if (e.key === 'Alt' && state.isAltTabbing) {
    dispatch({ type: 'END_ALT_TAB' });
    altTabRef.current.holding = false;
}
```

If Alt is pressed without Tab (e.g., user presses Alt then changes their mind), `altTabRef.current.holding` remains `true` indefinitely. This is a **stale state** issue, though `holding` is only read in the ref (not triggering re-renders), so its practical impact is limited unless the ref is checked elsewhere.

*Severity:* **Low** — the ref appears unused beyond this logic and does not cause visible bugs.

**3.2.7 `LoginScreen.tsx` — No Actual Authentication**

The password field accepts any input and the unlock button always succeeds after an 800ms delay. There is no credential verification. This is consistent with the project being a UI demo, but the error animation (`loginShake`) is defined in CSS but never triggered — there is no code path that sets `error` to `true` or applies the shake animation.

*Severity:* **Informational** — the shake animation and error state appear to be dead code, suggesting authentication was planned but not implemented.

**3.2.8 `Desktop.tsx` — Drag Detection Threshold**

The drag detection uses a 5-pixel threshold:
```tsx
if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
```

This is calculated relative to the `dragOffset` which is reset on each move:
```tsx
setDragOffset({ x: e.clientX, y: e.clientY });
```

This means after the initial 5px threshold is crossed, every subsequent mouse move (even 1px) triggers a position update. This is correct behavior for smooth dragging, but the grid snapping (`GRID_X = 80`, `GRID_Y = 90`) means the icon only visually moves in 80x90 increments, so many intermediate dispatches are wasted.

*Severity:* **Low** — performance concern on high-frequency mousemove events; could be optimized with `requestAnimationFrame` throttling.

**3.2.9 `App.tsx` — Keyboard Shortcut Conflicts**

The Super+D shortcut checks `e.key === 'd' && (e.metaKey || e.altKey)`. Using `e.altKey` as an alternative to `e.metaKey` means Alt+D will also trigger minimize-all, which conflicts with browser-level Alt+D (focus address bar in many browsers). The `e.preventDefault()` call prevents the browser default, which could frustrate users expecting standard browser behavior.

*Severity:* **Low** — UX concern, not a bug.

---

### 3.3 Architecture & Design Audit

**3.3.1 Monolithic Reducer**

The documents unanimously describe a 499-line `osReducer`. Based on the action types visible across the provided code, the reducer handles at least:

- Boot phases: `SET_BOOT_PHASE`
- Auth: `LOGIN`
- Window management: `OPEN_WINDOW`, `CLOSE_WINDOW`, `MINIMIZE_WINDOW`, `RESTORE_WINDOW`, `FOCUS_WINDOW`, `MINIMIZE_ALL`
- App launcher: `TOGGLE_APP_LAUNCHER`, `SET_APP_LAUNCHER`
- Context menu: `SHOW_CONTEXT_MENU`, `HIDE_CONTEXT_MENU`
- Desktop icons: `SELECT_DESKTOP_ICON`, `UPDATE_DESKTOP_ICON_POSITION`
- Notifications: `REMOVE_NOTIFICATION`
- Notification center: `TOGGLE_NOTIFICATION_CENTER`
- Alt+Tab: `START_ALT_TAB`, `CYCLE_ALT_TAB`, `END_ALT_TAB`
- Theme: (implied by `state.theme.mode` and `state.theme.wallpaper`)

This spans at least 5-6 domains in a single reducer, confirming the architectural concern raised in all documents.

*Finding:* **Confirmed architectural issue.** The reducer mixes window management, authentication, UI state, desktop layout, and notification concerns.

**3.3.2 Component Coupling**

From the provided code, cross-component communication patterns observed:

- `Desktop.tsx` → `useOS()` → dispatches to store
- `ContextMenu.tsx` → `useOS()` → dispatches to store
- `NotificationSystem.tsx` → `useOS()` → reads notifications, dispatches removal
- `LoginScreen.tsx` → `useOS()` → dispatches LOGIN
- `App.tsx` → `useOS()` → reads state, dispatches multiple action types

No direct cross-component imports (e.g., Desktop importing from Terminal) were observed. All communication goes through the store via `useOS()`. This is consistent with the anti-pattern documentation ("Bypassing the Store").

*Finding:* **Architecture is clean** — store-mediated communication is correctly followed in provided code.

**3.3.3 Performance — `memo` Usage**

Components using `memo`:
- `Desktop` — wrapped with `memo()`
- `LoginScreen` — wrapped with `memo()`
- `NotificationSystem` — wrapped with `memo()`
- `Toast` — wrapped with `memo()`
- `ContextMenu` — wrapped with `memo()`

Components NOT using `memo`:
- `NotImplemented` — plain function component
- `AppShell` — plain function component (inside `App.tsx`)

*Finding:* Performance-critical components (Desktop, ContextMenu, NotificationSystem) are properly memoized. The docs recommend `memo` for Dock and Desktop — Desktop is confirmed. Dock and WindowFrame are not among the provided files.

**3.3.4 Bundle Size**

The `vite.config.ts` manually splits `react` and `lucide-react` into separate chunks. However, the documents warn about a >500 kB chunk and suggest dynamic `import()` for game apps. The provided config does not implement dynamic imports.

*Finding:* **Manual chunk splitting is partial.** Only two libraries are separated. Game apps (11 total, including Chess AI) are not dynamically imported.

**3.3.5 UI Component Consistency**

The provided `src/components/ui/` directory contains 13 components:
- `accordion.tsx`, `alert-dialog.tsx`, `button-group.tsx`, `card.tsx`, `field.tsx`, `kbd.tsx`, `popover.tsx`, `select.tsx`, `sonner.tsx`, `spinner.tsx`, `textarea.tsx`, `toggle-group.tsx`, `tooltip.tsx`

All follow Shadcn patterns:
- `data-slot` attributes for styling
- `cn()` utility for class merging
- Radix UI primitives as base
- Consistent prop forwarding with `...props`

*Finding:* UI components are **well-structured and consistent** with Shadcn conventions.

**3.3.6 Accessibility**

From the provided components:
- `Tooltip` uses Radix UI (accessible by default)
- `AlertDialog` uses Radix UI (accessible by default)
- `Select` uses Radix UI (accessible by default)
- `Accordion` uses Radix UI (accessible by default)
- Context menu items use `<button>` elements (keyboard accessible)
- Desktop icons use `onDoubleClick` and `onMouseDown` but have no `role`, `tabIndex`, or `aria-label`
- Login screen input has `placeholder` but no `<label>` or `aria-label`
- Toast notifications have no `role="alert"` or ARIA live region attributes

*Finding:* **Accessibility is partial.** Shadcn/Radix components are accessible, but custom components (Desktop icons, Login, Notifications) lack ARIA attributes. This is consistent with the documented accessibility gap.

---

### 3.4 Testing Audit

**3.4.1 Test Coverage**

The documents state:
- `safeEval` has 24 test cases (mentioned in AGENTS.md and CLAUDE.md)
- No component-level tests exist for `WindowFrame`, `Desktop`, or `Dock`
- Vitest is configured (`npm run test` in `package.json`)

From `vite.config.ts`, there is no explicit vitest configuration beyond the default. No test files are among the provided source files.

*Finding:* **Testing is minimal.** Only utility-level tests exist. The test command `npx vitest run` is present (per GEMINI.md), but the absence of test files in the provided bundle suggests very low coverage.

**3.4.2 Missing High-Value Test Targets**

Per CLAUDE.md, these are high-value untested targets:
- `WindowFrame.tsx` — complex state transitions (minimize, maximize, restore, focus)
- `Desktop.tsx` — drag-and-drop, context menu, icon selection
- `Dock.tsx` — app pinning, running indicators

*Finding:* **Confirmed gap.** The most complex interactive components lack tests.

---

### 3.5 Documentation Accuracy Audit

**3.5.1 DOMPurify Dependency**

| Document | Claim | package.json | Status |
|---|---|---|---|
| README.md | DOMPurify 3.4.7 | Not present | **Inaccurate** |
| GEMINI.md | DOMPurify for XSS sanitization | Not present | **Inaccurate** |
| AGENTS.md | `sanitizeHtml.ts` (custom) | N/A | **Potentially accurate** |
| CLAUDE.md | `sanitizeHtml()` from `@/utils/sanitizeHtml` | N/A | **Potentially accurate** |

**3.5.2 Feature Count**

README and GEMINI claim 54 apps. The feature matrix sums to: 7 + 10 + 7 + 7 + 11 + 8 + 4 = **54**. The matrix is internally consistent.

*Finding:* Cannot verify the actual count against `registry.ts` (not provided), but the documentation is self-consistent.

**3.5.3 Remediation Claims**

README claims 5 specific fixes. Cross-referencing:

| Fix | AGENTS.md Detail | Can Verify in Provided Code |
|---|---|---|
| Replaced eval/Function with safeEval | Yes — Spreadsheet and Terminal remediated | Not in provided files |
| DOMPurify-based sanitization | Yes — Notes, MarkdownPreview, RegexTester, CodeEditor | Not in provided files |
| localStorage zod validation | Yes — useOSStore and useFileSystem | Not in provided files |
| Z-index bounds checking | Yes — Math.min in OPEN_WINDOW and FOCUS_WINDOW | Not in provided files |
| Fragile reduce logic fix | Yes — visibleWindows.length check | Not in provided files |

*Finding:* All 5 fixes are documented with technical detail in AGENTS.md, but the remediated source files are not among the provided code. Verification requires access to `useOSStore.tsx`, `useFileSystem.ts`, `safeEval.ts`, and `sanitizeHtml.ts`.

**3.5.4 Tech Stack Version Accuracy**

Cross-referencing all four documents against `package.json`:

| Technology | Doc Version | package.json | Match |
|---|---|---|---|
| React | 19.2.0 | ^19.2.0 | Yes |
| TypeScript | 5.9.3 | ~5.9.3 | Yes |
| Vite | 7.2 | ^7.2.4 | Yes (7.2.x) |
| Tailwind CSS | 3.4.19 | ^3.4.19 | Yes |
| Lucide React | 0.562.0 | ^0.562.0 | Yes |
| Zod | 4.3.5 | ^4.3.5 | Yes |
| DOMPurify | 3.4.7 | **Absent** | **No** |

---

## Consolidated Findings Report

### Critical Issues

| # | Issue | Location | Impact | Source |
|---|---|---|---|---|
| C1 | **DOMPurify absent from `package.json`** despite being claimed as the XSS sanitization library in README and GEMINI | `package.json` | Security-critical: either the docs are wrong, the dependency is missing, or a custom sanitizer is used without documentation. Build may fail or security layer may be missing. | Phase 3.1.5 |
| C2 | **`NotImplemented.tsx` references undefined `Icons` namespace** | `src/components/NotImplemented.tsx` | Runtime `ReferenceError` crash when any unimplemented app is opened. With 54 apps and many likely unimplemented, this is a high-probability crash path. | Phase 2.3 / 3.2.2 |

### High-Severity Issues

| # | Issue | Location | Impact | Source |
|---|---|---|---|---|
| H1 | **Missing Error Boundaries** on `AppRouter` and `WindowManager` | `src/App.tsx` | Any app crash brings down the entire desktop shell. Confirmed by all three docs that mention it. | Phase 3.2.1 |
| H2 | **`sonner.tsx` uses `next-themes` instead of OS theme system** | `src/components/ui/sonner.tsx` | Toast notifications will not respond to theme changes, breaking visual consistency. The `useTheme()` from `next-themes` will always return `"system"` unless a separate `ThemeProvider` is mounted (not visible in `App.tsx`). | Phase 2.3 / 3.2.3 |
| H3 | **Seven context menu actions are non-functional placeholders** | `src/components/ContextMenu.tsx` | New Folder, New Document, Change Background, Arrange Icons, Display Settings, Pin/Unpin Dock, Quit App all have empty handler bodies. Users see these options but clicking does nothing. | Phase 2.3 / 3.2.4 |

### Medium-Severity Issues

| # | Issue | Location | Impact | Source |
|---|---|---|---|---|
| M1 | **DOMPurify claimed but absent creates documentation trust issue** | All four MD files | Developers and AI agents following the docs will reference a library that may not be installed. The actual sanitization approach is unclear. | Phase 3.5.1 |
| M2 | **`handleMenuAction` uses `unknown` type for state parameter** | `src/components/ContextMenu.tsx` | Violates strict TypeScript convention; prevents type-safe action handling. | Phase 2.3 |
| M3 | **13+ dependencies undocumented** in any of the four MD files | `package.json` | Developers and AI agents have no context for libraries like `cmdk`, `recharts`, `vaul`, `embla-carousel-react`, `react-resizable-panels`, etc. | Phase 2.2 |
| M4 | **Alt+Tab uses emoji instead of DynamicIcon** | `src/App.tsx` | Inconsistent with design system (all other components use Lucide icons via `DynamicIcon`). | Phase 2.3 |
| M5 | **Login screen shake animation is dead code** | `src/components/LoginScreen.tsx` | `loginShake` keyframes are defined but never triggered; `error` state is set to `false` but the code path to set it `true` does not exist. | Phase 3.2.7 |
| M6 | **`safeEval.ts` and `sanitizeHtml.ts` implementations cannot be audited** | Not in provided bundle | The two most security-critical utilities are not among the provided files. Their correctness cannot be verified. | Phase 3.1.1 / 3.1.2 |

### Low-Severity Issues

| # | Issue | Location | Impact | Source |
|---|---|---|---|---|
| L1 | **Potential timeout leak in `Toast` component** | `src/components/NotificationSystem.tsx` | `setTimeout(onClose, 250)` not cleaned up on unmount during exit animation. Narrow 250ms window. | Phase 3.2.5 |
| L2 | **`altTabRef.holding` can become stale** | `src/App.tsx` | If Alt is pressed without Tab, the ref stays `true`. No functional impact observed. | Phase 3.2.6 |
| L3 | **Desktop drag dispatches on every mousemove after threshold** | `src/components/Desktop.tsx` | Unnecessary position dispatches due to grid snapping making intermediate values invisible. Could be throttled with `rAF`. | Phase 3.2.8 |
| L4 | **Alt+D conflicts with browser address bar shortcut** | `src/App.tsx` | `preventDefault()` blocks standard browser behavior. | Phase 3.2.9 |
| L5 | **`Home.tsx` appears to be dead code** | `src/pages/Home.tsx` | Default Vite template, not integrated with UbuntuOS. | Phase 2.3 |
| L6 | **`plugin-inspect-react-code` is undocumented** | `vite.config.ts` | No documentation on what this plugin does or why it's included. | Phase 2.2 |

### Informational Observations

| # | Observation | Details | Source |
|---|---|---|---|
| I1 | **Architecture is clean** | Store-mediated communication via `useOS()` is consistently followed. No cross-component direct imports observed. | Phase 3.3.2 |
| I2 | **Memo usage is appropriate** | Performance-critical components (Desktop, ContextMenu, NotificationSystem, Toast) are properly wrapped in `memo()`. | Phase 3.3.3 |
| I3 | **Shadcn UI components are well-structured** | All 13 provided UI components follow consistent Shadcn patterns with Radix primitives, `data-slot` attributes, and `cn()` utility. | Phase 3.3.5 |
| I4 | **Build configuration is reasonable** | Sourcemaps enabled, manual chunk splitting for react and lucide, proper alias resolution. | Phase 2.2 |
| I5 | **TypeScript strict mode is fully enabled** | All strict flags are on: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`. | Phase 2.2 |
| I6 | **Documentation is unusually thorough for this type of project** | Four separate AI-targeted briefing documents with cross-referencing security rules, architectural patterns, and lessons learned. | Phase 1 |

### Improvement Recommendations (Prioritized)

1. **Resolve DOMPurify discrepancy** — Either add DOMPurify to `package.json` or update all four documentation files to reflect the actual sanitization approach. This is the highest-priority documentation fix.

2. **Fix `NotImplemented.tsx` import** — Add `import * as Icons from 'lucide-react'` or replace `Icons.HelpCircle`/`Icons.Hammer` with `DynamicIcon` references.

3. **Add React Error Boundaries** — Wrap `WindowManager` and `AppRouter` (or the desktop shell div) in error boundaries to isolate app crashes.

4. **Fix `sonner.tsx` theme integration** — Either integrate `next-themes`'s `ThemeProvider` with the OS theme system, or replace `useTheme()` with the OS store's `state.theme.mode`.

5. **Implement placeholder context menu actions** — At minimum, implement `NEW_FOLDER` and `NEW_DOCUMENT` which are fundamental desktop operations.

6. **Include security utilities in the provided bundle** — `safeEval.ts`, `sanitizeHtml.ts`, and `storageValidation.ts` are the most security-critical files and should be reviewable.

7. **Document all dependencies** — Add a dependency rationale section or at minimum mention the key third-party libraries in the project documentation.

8. **Add ARIA attributes to custom components** — Desktop icons need `role`, `tabIndex`, and `aria-label`; login input needs a label; notifications need `role="alert"`.

9. **Remove or integrate `Home.tsx`** — Either delete the dead Vite template or document its purpose.

10. **Split `osReducer`** — As recommended by all documentation, break into domain-specific reducers (window management, notifications, desktop icons, authentication, theme).

# https://aistudio.xiaomimimo.com/#/share/2559e76cda34e5e0e111d3fe5db9041a 

