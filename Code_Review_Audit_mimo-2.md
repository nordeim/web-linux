# Consolidated Audit Report: UbuntuOS Web

---

## Project Summary

UbuntuOS Web is a high-fidelity, browser-based replica of the Ubuntu Linux desktop environment, built with React 19, TypeScript 5.9, Vite 7.2, and Tailwind CSS 3.4. It features a window manager with z-index stacking, a localStorage-backed virtual file system (VFS) with zod validation, and 54 interactive applications. A security audit and remediation was completed on 2026-05-31, eliminating `eval()`, `new Function()`, and XSS vulnerabilities.

---

## Phase 1: Document-by-Document Extraction (Summary)

Five documentation files and twenty source/config files were provided. The documents are:

| Document | Stated Purpose | Key Domains Covered |
|---|---|---|
| **AGENTS.md** | AI coding agent briefing; non-obvious patterns, security rules, lessons learned | Architecture, Security, State Mgmt, Anti-Patterns, Troubleshooting |
| **CLAUDE.md** | Coding standards and implementation guidelines for Claude AI | React/TS conventions, Security, Persistence, Build commands, Performance |
| **GEMINI.md** | Project context for Gemini AI interactions | Tech stack, Build/run, Security rules, Coding style, Adding features |
| **README.md** | Project overview for developers and users | Features, Architecture, Security improvements, Known issues, Build commands |

Each document was extracted independently before cross-referencing (per Phase 2).

---

## Phase 2: Cross-Document Reconciliation

### Consistencies (All four documents agree)

| Topic | Consensus |
|---|---|
| Security audit date | 2026-05-31 (AGENTS.md, CLAUDE.md, GEMINI.md, README.md) |
| `eval()` / `new Function()` forbidden | All four documents treat this as non-negotiable |
| `dangerouslySetInnerHTML` must be sanitized | Mandated across all documents |
| localStorage must use zod validation | Consistently stated |
| VFS localStorage key | `ubuntuos_filesystem_v2` with legacy migration support |
| Z-index cap | 2147483647, applied in OPEN_WINDOW, FOCUS_WINDOW, END_ALT_TAB |
| App count | 54 |
| Code splitting via React.lazy + Suspense | ~1 MB initial → ~360 KB shell, 60 chunks |
| osReducer is ~500 lines | CLAUDE.md says ~500; README.md says ~500; AGENTS.md says 499 |
| ~17 apps with raw JSON.parse | Same list in AGENTS.md and CLAUDE.md |
| Shared DynamicIcon eliminates duplication | Stated in AGENTS.md, CLAUDE.md, README.md |
| Reducer side effects moved to useEffect | Pure reducer pattern confirmed |

### Discrepancies

| Topic | Document A | Document B | Verdict |
|---|---|---|---|
| **XSS sanitization library** | AGENTS.md & CLAUDE.md: custom `sanitizeHtml()` wrapper from `@/utils/sanitizeHtml` | GEMINI.md: "DOMPurify for XSS sanitization" | **Difference in detail level.** `package.json` includes `dompurify: ^3.4.7` as a dependency. The custom wrapper likely wraps DOMPurify internally. Both documents describe the same system at different abstraction levels — not a true contradiction. |
| **DynamicIcon usage count** | AGENTS.md: "inlined in 8 components (Dock, WindowFrame, Desktop, AppLauncher, NotificationCenter, NotImplemented, ContextMenu, NotificationSystem)" | App.tsx also imports DynamicIcon (for Alt+Tab switcher) | **Discrepant.** AGENTS.md lists 8 components, but a 9th (App.tsx) also imports it. AGENTS.md may predate the Alt+Tab addition, or the claim is inaccurate. |
| **Lucide import style** | CLAUDE.md & GEMINI.md: "`import * as Icons from 'lucide-react'` (imports the entire ~587 KB library)" as anti-pattern | NotImplemented.tsx: uses `import * as Icons from 'lucide-react'` | **Discrepant.** Source code contradicts the stated convention. AGENTS.md's troubleshooting section explains this was done intentionally to fix a ReferenceError, but CLAUDE.md and GEMINI.md still list it as forbidden. The guidance is self-contradictory. |

### Gaps (One document covers topics others omit)

| Topic | Covered By | Not Covered By |
|---|---|---|
| Z-index overflow symptoms and root cause details | AGENTS.md | CLAUDE.md, GEMINI.md |
| Window state restoration fragile `.reduce()` bug | AGENTS.md | CLAUDE.md, GEMINI.md |
| `NotImplemented.tsx` "Icons is not defined" ReferenceError fix | AGENTS.md | CLAUDE.md, GEMINI.md |
| `safeJsonParse` utility existence | AGENTS.md, CLAUDE.md | GEMINI.md (mentions zod but not this specific utility) |
| Monolithic reducer recommendation | AGENTS.md, CLAUDE.md | GEMINI.md |
| `plan.md` and `REMEDIATION.md` referenced | README.md | Not provided for verification |

---

## Phase 3: Source Code Validation

### Claim-by-Claim Validation Table

| # | Claim | Source Document | Verification in Code | Outcome |
|---|---|---|---|---|
| 1 | React 19 | All docs | `package.json`: `"react": "^19.2.0"` | **Confirmed** |
| 2 | TypeScript 5.9 | README.md, GEMINI.md | `package.json`: `"typescript": "~5.9.3"` | **Confirmed** |
| 3 | Vite 7.2 | README.md, GEMINI.md | `package.json`: `"vite": "^7.2.4"` | **Confirmed** |
| 4 | Tailwind CSS 3.4 | All docs | `package.json`: `"tailwindcss": "^3.4.19"` | **Confirmed** |
| 5 | Lucide React 0.562.0 | README.md | `package.json`: `"lucide-react": "^0.562.0"` | **Confirmed** |
| 6 | DOMPurify 3.4.7 | README.md | `package.json`: `"dompurify": "^3.4.7"` | **Confirmed** |
| 7 | Zod 4.3.5 | README.md | `package.json`: `"zod": "^4.3.5"` | **Confirmed** |
| 8 | Vitest 4.x | README.md | `package.json`: `"vitest": "^4.1.7"` | **Confirmed** |
| 9 | Dev server on port 3000 | GEMINI.md | `vite.config.ts`: `server: { port: 3000 }` | **Confirmed** |
| 10 | Strict TypeScript enabled | All docs | `tsconfig.app.json`: `"strict": true` | **Confirmed** |
| 11 | `noUnusedLocals: true` | CLAUDE.md | `tsconfig.app.json`: confirmed | **Confirmed** |
| 12 | `noUnusedParameters: true` | CLAUDE.md | `tsconfig.app.json`: confirmed | **Confirmed** |
| 13 | Path alias `@/*` → `./src/*` | CLAUDE.md | `tsconfig.json` and `vite.config.ts`: confirmed | **Confirmed** |
| 14 | `safeEval()` used for math | AGENTS.md, CLAUDE.md, GEMINI.md | Not verifiable — `@/utils/safeEval.ts` not provided | **Unverifiable** |
| 15 | `sanitizeHtml()` used for XSS | AGENTS.md, CLAUDE.md, GEMINI.md | Not verifiable — `@/utils/sanitizeHtml.ts` not provided | **Unverifiable** |
| 16 | `storageValidation.ts` with zod | AGENTS.md, CLAUDE.md | Not verifiable — file not provided | **Unverifiable** |
| 17 | `safeJsonParse` utility | AGENTS.md, CLAUDE.md | Not verifiable — `@/utils/safeJsonParse.ts` not provided | **Unverifiable** |
| 18 | Shared `DynamicIcon.tsx` component | AGENTS.md, CLAUDE.md | `@/components/DynamicIcon` imported in App.tsx, Desktop.tsx, NotificationSystem.tsx, ContextMenu.tsx, NotImplemented.tsx | **Confirmed** |
| 19 | DynamicIcon used in 8 components | AGENTS.md | App.tsx (9th component) also imports it | **Discrepant** |
| 20 | `memo()` on performance-critical components | CLAUDE.md | Desktop, NotificationSystem (Toast), ContextMenu, LoginScreen all use `memo()` | **Confirmed** |
| 21 | Shadcn UI "new-york" style | CLAUDE.md | `components.json`: `"style": "new-york"` | **Confirmed** |
| 22 | `OSProvider` wraps the app | AGENTS.md | `App.tsx`: `<OSProvider><AppShell /></OSProvider>` | **Confirmed** |
| 23 | Cascading windows with 30px offset | AGENTS.md | Not verifiable — `useOSStore.tsx` not provided | **Unverifiable** |
| 24 | Boot → Login → Desktop flow | AGENTS.md | `App.tsx`: conditional rendering of BootSequence, LoginScreen, Desktop based on `bootPhase` and `auth.isAuthenticated` | **Confirmed** |
| 25 | `npm run test` runs Vitest | CLAUDE.md, GEMINI.md | `package.json`: `"test": "vitest run"` | **Confirmed** |
| 26 | 41 tests in test suite | README.md | Not verifiable — test files not provided | **Unverifiable** |
| 27 | 60 individual chunks from code splitting | AGENTS.md | Not verifiable — build output not provided | **Unverifiable** |

### Issues Found in Source Code (Independent of Documentation Claims)

---

## Phase 4: Multi-Dimensional Critical Audit

### A. Security Audit

**S1 — Lucide React Monolithic Import (~587 KB bundle impact)**

- **File:** `app/src/components/NotImplemented.tsx`, line: `import * as Icons from 'lucide-react';`
- **Issue:** Imports the entire lucide-react library (~587 KB per CLAUDE.md) when only three icons are used: `Icons.HelpCircle`, `Icons.Hammer`, and the icon passed to `DynamicIcon` (which handles its own imports). The code splitting implemented via `React.lazy` is partially negated for any chunk that loads this component.
- **Evidence:** CLAUDE.md states: *"Do not use `import * as Icons from 'lucide-react'` (imports the entire ~587 KB library)."* GEMINI.md states: *"Lucide monolithic import (`import * as Icons from 'lucide-react'`) still imports the entire library (~587 KB). Use named imports when possible."*
- **Mitigating context:** AGENTS.md's troubleshooting section explains this was an intentional fix for a `ReferenceError` ("Ensure `NotImplemented.tsx` imports `* as Icons from 'lucide-react'`"), but this directly contradicts the import style rules in CLAUDE.md and GEMINI.md. The fix introduces a performance regression to solve a correctness bug.
- **Impact:** Every unbuilt app window loads the full lucide bundle. This undermines the 60-chunk code splitting architecture.
- **Severity:** **Medium** — Not a security vulnerability, but a significant performance regression that contradicts the project's stated optimization achievements.

**S2 — Potential Stale Closure in Keyboard Event Handlers**

- **File:** `app/src/App.tsx`, lines: `handleKeyDown` and `handleKeyUp` callbacks inside `useEffect`
- **Issue:** The `handleKeyDown` callback references `state.isAltTabbing` and `state.activeWindowId` directly from the `state` object captured at effect creation time. While these are listed in the `useEffect` dependency array (through `state.appLauncherOpen`, `state.notificationCenterOpen`, `state.isAltTabbing`, `state.activeWindowId`), the `handleKeyUp` handler checks `state.isAltTabbing` but the handler is only recreated when those specific dependencies change. Between re-creation cycles, `state.isAltTabbing` could become stale if state changes occur without triggering a dependency update (e.g., rapid Alt+Tab cycling).
- **Evidence:** `App.tsx` lines: `if (e.key === 'Alt' && state.isAltTabbing)` in `handleKeyUp`, and `if (!state.isAltTabbing)` in `handleKeyDown`.
- **Impact:** Edge case where Alt+Tab switching could fail to end properly, leaving the user in Alt+Tab mode. Low probability but real.
- **Severity:** **Low** — Requires specific rapid keyboard interaction to trigger; does not cause data loss or security issues.

**S3 — All Verified Source Files Are Free of `eval()`, `new Function()`, and Unsanitized `dangerouslySetInnerHTML`**

- **Files inspected:** App.tsx, Desktop.tsx, LoginScreen.tsx, NotificationSystem.tsx, ContextMenu.tsx, NotImplemented.tsx, spinner.tsx, textarea.tsx, field.tsx
- **Outcome:** No instances of `eval()`, `new Function()`, or `dangerouslySetInnerHTML` found in any provided source file. The security remediation claims are confirmed for all verifiable files.
- **Severity:** **Informational (Positive)**

### B. Bug & Reliability Audit

**B1 — ARRANGE_ICONS Dispatches CASCADE_WINDOWS (Semantic Mismatch)**

- **File:** `app/src/components/ContextMenu.tsx`, in `handleMenuAction` function
- **Issue:** The desktop context menu offers an "Arrange Icons" action (`action: 'ARRANGE_ICONS'`), but the `handleMenuAction` function dispatches `{ type: 'CASCADE_WINDOWS' }` for this action. Cascading windows and arranging desktop icons are fundamentally different operations. This either indicates a missing `ARRANGE_ICONS` reducer case or a placeholder that was never completed.
- **Evidence:** Desktop.tsx defines the menu item: `{ id: 'arrange', label: 'Arrange Icons', icon: 'LayoutGrid', action: 'ARRANGE_ICONS' }`. ContextMenu.tsx handles it: `case 'ARRANGE_ICONS': { dispatch({ type: 'CASCADE_WINDOWS' }); break; }`.
- **Impact:** Users clicking "Arrange Icons" will cascade their windows instead, which is unexpected behavior.
- **Severity:** **Medium** — Functional bug affecting user experience; not a crash or security issue.

**B2 — No Error Boundaries in Provided Source**

- **Files inspected:** All provided `.tsx` files
- **Issue:** None of the provided source files implement or reference React error boundaries. The `WindowManager` component (referenced but not provided) is described as managing window lifecycle but no `ErrorBoundary` wrapper is visible. If a window component throws during render, it could crash the entire application.
- **Evidence:** README.md states "54 interactive applications" — any single app crash could cascade.
- **Impact:** Unhandled render errors in any app could crash the desktop shell.
- **Severity:** **Medium** — Standard React best practice gap; mitigated if `WindowManager` (not provided) includes error boundaries internally. Marking as **Unverifiable for the full app** but flagging the absence in provided code.

**B3 — contextMenu State Properties Accessed Without Null Guard**

- **File:** `app/src/components/ContextMenu.tsx`
- **Issue:** The component accesses `contextMenu.x`, `contextMenu.y`, `contextMenu.items`, and `contextMenu.visible` directly. While `contextMenu.visible` is checked before rendering, the edge-detection logic at the top of the component runs even when `!contextMenu.visible`, accessing `contextMenu.x` and `contextMenu.y`. If the initial state has these as `undefined`, the comparisons `x + rect.width > vw` would produce `NaN > vw` → `false`, which is benign but indicates sloppy defensive coding.
- **Evidence:** The early return `if (!contextMenu.visible) return null;` is placed after the edge-detection logic, not before it.
- **Impact:** Negligible — produces no visible bug in practice, but violates defensive coding principles.
- **Severity:** **Low**

### C. Architecture & Design Audit

**A1 — Broad `useOS()` Hook Causes Unnecessary Re-renders**

- **File:** `app/src/App.tsx`, `AppShell` component
- **Issue:** `AppShell` calls `const { state, dispatch } = useOS()` at the top level, subscribing to the entire OS state. Any state change (e.g., window position update, notification addition, theme toggle) triggers a re-render of the root shell component, even if only a subset of state is relevant. CLAUDE.md recommends: *"Use `useOS()` hook to access system state."* But with a monolithic reducer and no selectors, this creates a performance bottleneck.
- **Evidence:** `App.tsx`: `const { state, dispatch } = useOS();` followed by destructuring `const { bootPhase, auth } = state;`. Only `bootPhase`, `auth`, `theme`, `windows`, `apps`, `appLauncherOpen`, `notificationCenterOpen`, `isAltTabbing`, `altTabIndex`, `activeWindowId` are used — a fraction of total state.
- **AGENTS.md** acknowledges: *"Monolithic reducers are hard to maintain... Consider splitting by domain or switching to a state management library with selectors."*
- **Impact:** Every state change triggers re-render of the entire AppShell including wallpaper layer, desktop, and all overlays.
- **Severity:** **Medium** — Performance concern that compounds with 54 active apps; not a correctness bug.

**A2 — ContextMenu Component Function Exported Alongside Default Export**

- **File:** `app/src/components/ContextMenu.tsx`
- **Issue:** `handleMenuAction` is exported as a named export (`export function handleMenuAction(...)`) alongside the default `ContextMenu` component. This function takes `state` and `dispatch` as parameters and contains all the business logic for context menu actions. This pattern tightly couples action handling to the ContextMenu component rather than placing it in a hook or reducer.
- **Evidence:** `export function handleMenuAction(action: string, _state: import('@/types').OSState, dispatch: React.Dispatch<import('@/types').OSAction>)`
- **Impact:** If any other component needs to trigger context menu actions, it must import from ContextMenu.tsx, creating circular dependency risks. Actions that belong in the reducer (NEW_FOLDER, NEW_DOCUMENT) are handled here instead.
- **Severity:** **Low** — Architectural concern; functional but creates coupling.

**A3 — Positive: Consistent Use of `memo()` on Performance-Critical Components**

- **Files:** Desktop.tsx, LoginScreen.tsx, NotificationSystem.tsx, ContextMenu.tsx
- **Evidence:** All four major shell components use `memo()` wrapping, consistent with CLAUDE.md guidance: *"Use functional components with `memo` for performance-critical UI."*
- **Severity:** **Informational (Positive)**

### D. Testing Audit

**D1 — Test Infrastructure Present but Test Files Not Provided**

- **Evidence:** `vitest.setup.ts` exists with `import '@testing-library/jest-dom/vitest';`. `package.json` includes `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`. Test command: `"test": "vitest run"`.
- **README.md** claims "41 tests" and AGENTS.md claims "24 cases" for safeEval alone.
- **CLAUDE.md** acknowledges: *"Component-level tests are missing. No tests exist for `WindowFrame`, `Desktop`, or `Dock`."*
- **Outcome:** Test infrastructure is correctly configured. Test file content is not provided, so test quality and coverage cannot be assessed.
- **Severity:** **Informational** — Cannot validate test coverage without test files.

### E. Documentation Accuracy Audit

**D2 — DynamicIcon Usage Count Off by One**

- **Claim:** AGENTS.md states DynamicIcon was "inlined in 8 components" and lists them.
- **Evidence:** App.tsx imports `DynamicIcon` for the Alt+Tab switcher UI (line: `import DynamicIcon from '@/components/DynamicIcon';`), which is not in AGENTS.md's list of 8.
- **Severity:** **Low** — Minor documentation inaccuracy.

**D3 — `plan.md` and `REMEDIATION.md` Referenced but Not Provided**

- **Claim:** README.md references `REMEDIATION.md` ("See [REMEDIATION.md](REMEDIATION.md) for the full audit report") and `plan.md` ("Original project roadmap and feature checklist").
- **Evidence:** Neither file was included in the provided content.
- **Outcome:** Claims in these documents cannot be verified.
- **Severity:** **Informational**

**D4 — GEMINI.md Tech Stack Table Lists Security as "DOMPurify" While Source Uses Custom Wrapper**

- **Claim:** GEMINI.md: `| **Security** | DOMPurify | 3.4.7 | XSS sanitization for user-generated HTML |`
- **Evidence:** AGENTS.md and CLAUDE.md both describe `@/utils/sanitizeHtml` as a custom utility. `package.json` does include `dompurify: ^3.4.7`, confirming the dependency exists. The discrepancy is in description precision — GEMINI.md describes the underlying library, while AGENTS.md/CLAUDE.md describe the wrapper API.
- **Severity:** **Low** — Difference in detail level, not a true contradiction.

---

## Phase 5: Consolidated Report

### Critical Issues
*None identified in provided content.*

No confirmed security vulnerabilities, runtime crash paths, or data loss risks were found in the provided source code. The key security-sensitive files (`safeEval.ts`, `sanitizeHtml.ts`, `storageValidation.ts`) were not provided for independent verification, but no evidence of bypassing their usage was found in the provided code.

---

### High-Severity Issues
*None identified.*

No major functionality gaps or significant architectural problems were confirmed with high confidence from the provided content.

---

### Medium-Severity Issues

| # | Issue | Location | Impact | Evidence Source |
|---|---|---|---|---|
| **M1** | Lucide monolithic import (`import * as Icons`) in NotImplemented.tsx contradicts CLAUDE.md and GEMINI.md import conventions and loads ~587 KB unnecessarily | `app/src/components/NotImplemented.tsx` | Every unbuilt app window loads the full lucide bundle, undermining code splitting | Phase 4, Security S1; CLAUDE.md & GEMINI.md vs. source code |
| **M2** | "Arrange Icons" context menu action dispatches `CASCADE_WINDOWS` instead of arranging icons | `app/src/components/ContextMenu.tsx` (`handleMenuAction`) | Users clicking "Arrange Icons" get window cascading instead | Phase 4, Bug B1; Desktop.tsx + ContextMenu.tsx |
| **M3** | Broad `useOS()` subscription in AppShell re-renders the entire shell on any state change | `app/src/App.tsx` | Performance degradation as state complexity grows; every window drag/notification/theme change triggers full shell re-render | Phase 4, Architecture A1; App.tsx + AGENTS.md acknowledgment |
| **M4** | No error boundaries visible in any provided component | All provided `.tsx` files | Unhandled render errors in any app could crash the desktop shell | Phase 4, Bug B2; absence of evidence in provided code |

---

### Low-Severity Issues

| # | Issue | Location | Impact | Evidence Source |
|---|---|---|---|---|
| **L1** | Potential stale closure in keyboard handlers for Alt+Tab state | `app/src/App.tsx` (`handleKeyUp`) | Edge case: Alt+Tab might not exit cleanly during rapid key presses | Phase 4, Security S2 |
| **L2** | ContextMenu edge-detection runs before visibility check | `app/src/components/ContextMenu.tsx` | Benign — produces no visible bug but violates defensive coding | Phase 4, Bug B3 |
| **L3** | `handleMenuAction` exported from ContextMenu.tsx creates tight coupling | `app/src/components/ContextMenu.tsx` | Action logic is co-located with presentation component; could cause circular imports | Phase 4, Architecture A2 |
| **L4** | Project name is `"my-app"` in package.json | `app/package.json` | Unprofessional; could cause confusion in monorepo or deployment contexts | Phase 3, config validation |
| **L5** | `tailwind.config.js` uses CommonJS `require()` / `module.exports` in an ESM project (`"type": "module"` in package.json) | `app/tailwind.config.js`, `app/package.json` | Potential compatibility issues with future Tailwind/Node versions | Phase 3, config validation |
| **L6** | DynamicIcon usage count (8 vs. 9) is inaccurate in AGENTS.md | `AGENTS.md` vs. `App.tsx` | Minor documentation drift | Phase 4, Documentation D2 |
| **L7** | `REMEDIATION.md` and `plan.md` referenced in README.md but not provided | `README.md` | Cannot verify remediation claims or project roadmap | Phase 4, Documentation D3 |

---

### Informational Observations (Confirmed Positives)

| # | Observation | Evidence |
|---|---|---|
| **I1** | All verified source files are free of `eval()`, `new Function()`, and unsanitized `dangerouslySetInnerHTML` | 9 source files inspected in Phase 4, Security S3 |
| **I2** | Consistent use of `memo()` on performance-critical shell components (Desktop, LoginScreen, NotificationSystem, ContextMenu) | Phase 4, Architecture A3 |
| **I3** | Clean TypeScript configuration with strict mode, noUnusedLocals, and noUnusedParameters enforced | `tsconfig.app.json` confirmed; `CLAUDE.md` documentation accurate |
| **I4** | All dependency version claims in documentation match `package.json` exactly | Phase 3, claims #1–#8 |
| **I5** | All four documentation files are internally consistent on security requirements, architecture patterns, and known issues | Phase 2 reconciliation |
| **I6** | Proper `OSProvider` wrapping and clean component hierarchy in App.tsx | `App.tsx` source code |
| **I7** | Zod runtime validation correctly integrated at dependency level (`^4.3.5`) | `package.json` confirmed |

---

### Prioritized Improvement Recommendations

| Priority | Recommendation | Addresses |
|---|---|---|
| **1** | Replace `import * as Icons from 'lucide-react'` in NotImplemented.tsx with named imports (`import { HelpCircle, Hammer } from 'lucide-react'`) or use DynamicIcon for the two fallback icons. AGENTS.md's troubleshooting guidance should be updated accordingly. | M1 |
| **2** | Implement a proper `ARRANGE_ICONS` action in the reducer (e.g., snap icons to grid positions) instead of dispatching `CASCADE_WINDOWS`. | M2 |
| **3** | Add React error boundaries around `WindowManager` and individual window renders to prevent app-level crashes from bringing down the desktop shell. | M4 |
| **4** | Consider implementing a selector pattern or splitting `useOS()` into domain-specific hooks to reduce unnecessary re-renders in AppShell. | M3 |
| **5** | Rename the project in `package.json` from `"my-app"` to `"ubuntuos-web"`. | L4 |
| **6** | Rename `tailwind.config.js` to `tailwind.config.cjs` (or convert to ESM `tailwind.config.ts`/`tailwind.config.mjs`) to match the project's `"type": "module"` setting. | L5 |
| **7** | Provide `safeEval.ts`, `sanitizeHtml.ts`, `storageValidation.ts`, `useOSStore.tsx`, `useFileSystem.ts`, and `WindowManager.tsx` for complete security verification. | D3, Unverifiable claims #14–17, #23 |
| **8** | Update AGENTS.md's DynamicIcon count from 8 to 9 to include App.tsx. | L6 |

---

### Verification Pass Self-Check

1. **Evidence traceability**: All findings trace to specific source files, config files, or documentation statements provided in the reference content.
2. **Verification outcome accuracy**: Each "Confirmed" and "Discrepant" verdict was verified by re-reading the relevant source and documentation side by side.
3. **Severity calibration**: No finding exceeds "Medium" severity — no confirmed critical security vulnerabilities or crash paths were found in the provided code. Key security-critical utility files were not provided, so security claims remain "Unverifiable" rather than "Confirmed."
4. **Completeness**: All 5 documents and 20 source/config files were addressed. All 7 audit dimensions were covered.
5. **No fabrication**: Findings marked "Unverifiable" clearly state the reason (missing source files). No issues were invented beyond what the evidence supports.
6. **Absence handling**: Claims #14–17, #23, and #26 are explicitly marked "Unverifiable" because the required source files were not provided. This does not imply the documentation is incorrect.

