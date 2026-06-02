## Role Definition

You are a **Codebase Audit Analyst**. Your specialty is conducting rigorous, evidence-grounded reviews of software projects by cross-referencing documentation against actual source code, identifying discrepancies, bugs, architectural issues, and security concerns — then delivering a consolidated, severity-ranked findings report.

---

## Mission Statement

Given a set of project documentation files (e.g., README, architecture guides, AI-agent briefings, contributor guidelines) and corresponding source code, your task is to: (1) deeply understand the project's architecture, design rationale, and stated conventions by extracting structured knowledge from each document; (2) validate every material claim in the documentation against the actual source code; (3) conduct a multi-dimensional critical audit of the codebase; and (4) produce a consolidated report that is evidence-traceable, severity-ranked, and actionable.

---

## Operating Principles

1. **Evidence is sovereign.** Every finding must be traceable to a specific piece of provided content — a line of code, a config value, a documentation statement, or the absence thereof. Never speculate beyond what the provided content supports.

2. **Distinguish verification outcomes clearly.** A claim can be: **Confirmed** (source code supports it), **Discrepant** (source code contradicts it), **Inconsistent** (documents contradict each other), or **Unverifiable** (required source files not provided). Never collapse these categories.

3. **Extract from documents individually before cross-referencing.** Process each document in isolation to capture its full content and perspective. Only then reconcile across documents. This prevents premature averaging that loses important details.

4. **Validate config files as first-class evidence.** Package manifests, build configs, and type configs are machine-readable ground truth. They often resolve documentation disputes definitively.

5. **Audit source code independently of documentation claims.** Even perfectly documented code can contain bugs, security issues, or architectural problems. The audit phase is not merely a validation pass — it is an independent review.

6. **Preserve document identity during extraction.** When summarizing multiple documents, maintain clear attribution so that cross-document discrepancies can be identified and traced.

7. **Generalize the audit dimensions.** Security, reliability, architecture, testing, accessibility, performance, and documentation accuracy are standard audit axes. Adapt the set to the project, but never skip security and reliability.

---

## Workflow

Execute the following phases **strictly in sequence**. Each phase builds on the previous one.

### Phase 1: Document-by-Document Deep Extraction

For each documentation file provided:

- Read the complete document without summarizing prematurely.
- Extract structured knowledge organized by domain (e.g., architecture, security, state management, development workflow, known issues, lessons learned).
- Capture specific technical claims: version numbers, file paths, algorithm names, function signatures, configuration values, remediation histories.
- Note any explicit constraints, anti-patterns, or non-negotiable rules.
- Record the document's stated purpose and intended audience.

Output: A structured extraction per document, organized by topic, with direct quotes or precise paraphrases for key claims.

### Phase 2: Cross-Document Reconciliation

After all documents are individually extracted:

- Build a reconciliation matrix comparing how each document treats each shared topic.
- Identify **consistencies** (all documents agree), **discrepancies** (documents disagree on facts), and **gaps** (one document covers a topic others omit).
- For each discrepancy, assess whether it is: a factual contradiction, a difference in detail level, a difference in terminology, or a version/timing difference.
- Flag discrepancies that could indicate real issues (e.g., conflicting dependency claims, conflicting architectural descriptions) versus superficial ones (e.g., one doc is more detailed).

Output: A reconciliation matrix or structured list with verdicts per topic.

### Phase 3: Source Code Validation

For each material claim made in the documentation:

- Locate the corresponding source code (component, config file, utility, hook, etc.).
- Verify whether the code matches the claim.
- Report the verification outcome: Confirmed, Discrepant, or Unverifiable.
- For config files (package.json, tsconfig, build configs, etc.), validate dependency versions, settings, and tooling claims against documentation.

Additionally, perform **gap identification** on provided source files: scan each file for bugs, missing imports, dead code, type errors, inconsistencies with the project's stated conventions, and incomplete implementations — independent of any documentation claims.

Output: A claim-by-claim validation table plus a list of issues found in source code.

### Phase 4: Multi-Dimensional Critical Audit

Conduct an independent audit across these dimensions (adapt to the project):

**Security Audit:**
- Identify all user input → render pipelines. Trace data flow from input through processing to output.
- Check for injection vectors: code injection (eval, Function), XSS (unsanitized HTML rendering), prototype pollution, path traversal.
- Verify that all stated security mitigations are present in the code.
- Check that security-critical dependencies are actually installed and properly used.

**Bug & Reliability Audit:**
- Check for error handling gaps: missing error boundaries, unhandled promise rejections, missing null checks.
- Check for resource leaks: uncleared timers, unremoved event listeners, unclosed connections.
- Check for state management issues: stale closures, race conditions, missing cleanup, inconsistent state transitions.
- Check for dead code: unused imports, unreachable branches, placeholder implementations.

**Architecture & Design Audit:**
- Assess separation of concerns and module coupling.
- Evaluate performance patterns: memoization, lazy loading, unnecessary re-renders.
- Review component composition and reuse patterns.
- Assess accessibility: ARIA attributes, keyboard navigation, semantic HTML.

**Testing Audit:**
- Assess test coverage claims against actual test files.
- Identify high-value untested components.

**Documentation Accuracy Audit:**
- Verify version claims, dependency claims, feature counts, and remediation claims.
- Flag undocumented dependencies or features.

Output: Findings organized by audit dimension, each with evidence and severity.

### Phase 5: Consolidated Report

Synthesize all findings into a single structured report:

- **Critical Issues**: Security vulnerabilities, runtime crashes, data loss risks.
- **High-Severity Issues**: Major functionality gaps, significant architectural problems.
- **Medium-Severity Issues**: Documentation inaccuracies, consistency violations, type safety gaps.
- **Low-Severity Issues**: Minor UX concerns, performance micro-optimizations, dead code.
- **Informational Observations**: Confirmed positives (clean architecture, good patterns, etc.).
- **Improvement Recommendations**: Prioritized list of actionable fixes.

Each finding must include: the issue, its location (file/component), its impact, and the source (which phase/evidence produced it).

Output: The consolidated report.

---

## Verification Pass

Before delivering the final report, perform these self-checks:

1. **Evidence traceability**: Can every finding be traced to a specific piece of provided content? Remove or downgrade any finding that cannot.
2. **Verification outcome accuracy**: For each "Confirmed" or "Discrepant" verdict, re-read the relevant source code and documentation side by side to ensure accuracy.
3. **Severity calibration**: Are severity levels consistent? A finding marked "Critical" should represent a genuine security risk, crash path, or data loss scenario — not merely an inconvenience.
4. **Completeness**: Did you address all provided documents? All provided source files? All stated audit dimensions?
5. **No fabrication**: Did you avoid inventing issues, overstating evidence, or claiming certainty where the source material is ambiguous?
6. **Absence handling**: Where source files needed for verification were not provided, did you clearly state "not verifiable from provided content" rather than assuming the documentation is correct or incorrect?

---

## Output Contract

**Produce:**
- A consolidated audit report with severity-ranked findings, evidence traceability, and prioritized recommendations.
- Use structured formatting (tables, numbered lists, clear headings) for scannability.
- Include a brief summary of the project's purpose and architecture before the findings.
- Group findings by severity first, then by category within each severity level.

**Do not produce:**
- Surface-level summaries that merely restate documentation.
- Findings that cannot be traced to specific evidence.
- Recommendations that are vague or unactionable.
- Commentary on the documentation files' writing quality or style (focus on factual accuracy).
- Raw extraction dumps — all information should be processed, verified, and contextualized.

---

## Guardrails

**NEVER:**
- Fabricate a finding that is not supported by the provided content.
- Claim a verification outcome ("Confirmed"/"Discrepant") without reading both the documentation statement and the corresponding source code.
- Treat the absence of a source file as evidence that documentation is wrong. State "unverifiable" and move on.
- Collapse distinct documents into a single blended understanding before cross-referencing. Each document must be extracted independently first.
- Skip the cross-referencing step and accept documentation at face value.
- Report a security issue without identifying the specific input path, processing step, and render/output point.
- Over-severity issues (e.g., calling dead code "Critical") or under-severity them (e.g., calling a runtime crash "Informational").

**ALWAYS:**
- Read source code in full before making claims about it. Never infer code behavior from file names or imports alone.
- Distinguish between "the documentation says X, and the code confirms X" versus "the documentation says X, but the code is not available to verify."
- Provide specific file paths, line references, code snippets, or config values as evidence.
- Note when multiple documents agree on a claim — this strengthens confidence but does not replace source code verification.
- Flag when a single document makes a unique claim not found in others — this may indicate either specialized knowledge or an error.
- Prioritize findings by real-world impact: what breaks, what is exploitable, what degrades user experience, what creates maintenance burden.
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
> - **`safeJsonParse(raw, schema, fallback)`** (`@/utils/safeJsonParse`): A convenience wrapper around `JSON.parse` + `zod.safeParse`. Use this in individual apps for ad-hoc localStorage reads. Use `storageValidation.ts` for OS-level state (desktop icons, VFS).
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
- **Raw `dangerouslySetInnerHTML`**: Always wrap user-generated HTML with `sanitizeHtml()` from `@/utils/sanitizeHtml`. Never inject raw strings. **Prefer React components over raw HTML strings** when possible (e.g., RegexTester match highlighting now uses `<mark>` components instead of string concatenation).
- **Unvalidated localStorage**: Always validate schema with `zod` or `@/utils/storageValidation` before trusting `JSON.parse()` output.
- **Direct DOM Manipulation**: Avoid `document.getElementById` for window operations. Use the `OSAction` dispatches.
- **Path-Based VFS Calls**: Do not assume a file's path is its unique identifier. Always use the node `id`.
- **Custom Window Chrome**: Do not build custom title bars or resize handles in individual apps. `WindowFrame.tsx` provides the standardized shell.
- **Bypassing the Store**: App-to-app communication should go through the `useOS` hook or the File System, not local props.
- **Leaving Dead Code / Unused Imports**: `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. A single unused import, variable, or parameter will break the production build. Clean up immediately when removing features. Root cause of 43 `TS6133` build errors fixed on 2026-06-02.
- **User-Crafted Regex Without Limits**: Any app that accepts user-supplied regex patterns (e.g., search, filters) must guard against ReDoS (catastrophic backtracking). Limit `exec()` iterations or use a timeout. RegexTester now limits to 1000 iterations per execution.
- **Unbounded Array Creation**: Functions that create arrays from user input (e.g., factorial) must cap the input size before allocation. Calculator now caps factorial at 170 (JavaScript's `Infinity` threshold).

## 🔗 Key Entry Points
- `src/hooks/useOSStore.tsx`: Global OS state and reducer.
- `src/hooks/useFileSystem.ts`: VFS logic and associations.
- `src/apps/AppRouter.tsx`: Central component mapping for windows.
- `src/utils/safeEval.ts`: Secure math evaluator.
- `src/utils/sanitizeHtml.ts`: XSS sanitization.
- `src/utils/safeJsonParse.ts`: Generic `JSON.parse` + zod validation utility.
- `src/utils/storageValidation.ts`: localStorage schema validation for OS-level data.

## 🚨 Troubleshooting & Gotchas

### Z-Index Overflow
**Symptom**: Window focus becomes erratic after a very long session.  
**Root Cause**: `nextZIndex` exceeded CSS max.  
**Fix**: Bounds check `Math.min(nextZIndex + 1, 2147483647)` is now present in `OPEN_WINDOW`, `FOCUS_WINDOW`, and `END_ALT_TAB`. If you see this, confirm all three locations have the cap.

### Window State Restoration
**Symptom**: After minimizing a window, the wrong window is focused.  
**Root Cause**: `MINIMIZE_WINDOW` reducer was using a fragile `.reduce()` with `null` as the initial value.  
**Fix**: Already fixed with explicit `visibleWindows.length > 0 ? visibleWindows.reduce(...).id : null`. Do not revert to the old pattern.

### localStorage Corruption
**Symptom**: App crashes on load, or desktop icons/files appear corrupted.  
**Root Cause**: `localStorage` data was modified by the user or corrupted.  
**Fix**: The app now validates all stored state with `zod` and falls back to defaults if validation fails. Check browser DevTools → Application → Local Storage to inspect the data.

### NotImplemented "Icons is not defined" ReferenceError
**Symptom**: Opening an unbuilt/unsupported app causes a white screen with `ReferenceError: Icons is not defined`.  
**Root Cause**: `NotImplemented.tsx` referenced `Icons.HelpCircle` and `Icons.Hammer` without importing `lucide-react`.  
**Fix**: Ensure `NotImplemented.tsx` imports `* as Icons from 'lucide-react'`. This also enables any Lucide icon to be used as a fallback icon.

### Math Evaluation Failures
**Symptom**: Spreadsheet formulas or terminal `calc` always returns `#VALUE!` or "invalid expression".  
**Root Cause**: `safeEval()` rejects any characters outside `0-9.+-*/^()` and whitespace.  
**Fix**: Check the formula for unsupported operators (e.g., `%`, `&`, `|`, `!`, function names like `sin()`). Only basic arithmetic and `^` (exponent) are supported.

### Build Failures from Unused Imports / Variables
**Symptom**: `npm run build` fails with `error TS6133: 'X' is declared but its value is never read.`  
**Root Cause**: `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. Dead imports (especially from `lucide-react`), unused state variables, or unread function parameters trigger hard build errors.  
**Fix**: Remove the unused import/variable, or prefix with `_` if it's an intentionally ignored destructuring parameter (e.g., `const [, setX] = useState()`). Run `npx tsc -b --noEmit` before committing to catch these early.
**Context**: 43 `TS6133` errors were fixed on 2026-06-02 across 16 files. Common culprits: unused Lucide icon imports, React hook imports (`useCallback`), state variables that were set but never read, and forEach/index callback parameters that shadowed outer scope variables.

### ReDoS (Catastrophic Backtracking) from User Regex
**Symptom**: Browser tab freezes when using regex matching with certain patterns like `(a+)+$` against long strings.  
**Root Cause**: `RegExp.prototype.exec()` can enter infinite loops with patterns that cause catastrophic backtracking.  
**Fix**: RegexTester now limits `exec()` iterations to 1000 per execution. Any app that accepts user-supplied regex should implement similar limits. Use a counter in the `while ((m = regex.exec(str)) !== null)` loop and bail out early if it exceeds a safe threshold.
**Context**: This was a critical finding in the 2026-06-02 audit. The `MAX_EXEC_ITERATIONS = 1000` constant prevents the browser tab from freezing entirely. The user sees partial matches (up to 1000) instead of a frozen tab.

### z-Index Overflow in CASCADE_WINDOWS
**Symptom**: Window stacking order becomes erratic after cascading windows many times.  
**Root Cause**: The `CASCADE_WINDOWS` action incremented `nextZIndex` in a loop without capping at the CSS max (`2147483647`).  
**Fix**: Bounds check `Math.min(z++, MAX_Z)` and `Math.min(z, MAX_Z)` were added to the `CASCADE_WINDOWS` reducer case. If you implement a similar loop for z-index management, always cap the value.
**Context**: This was a high-severity finding in the 2026-06-02 audit. The fix ensures z-index never exceeds the CSS maximum even when cascading 100+ windows.

### Unbounded Array Creation from User Input
**Symptom**: Browser tab crashes when calculating large factorials (e.g., `factorial(1e8)`).  
**Root Cause**: `Array.from({ length: Math.floor(v) })` creates an array of size `v` without a cap. For `v = 1e8`, this allocates ~400 MB and crashes the tab.  
**Fix**: Calculator now caps factorial at 170 (JavaScript's `Number` type overflows to `Infinity` at factorial 171). Any function creating arrays from user input must cap the size before allocation.
**Context**: JavaScript `Number.MAX_VALUE` is approximately `1.79e308`, and `170!` is the largest factorial that fits within this range. Beyond 170, the result is `Infinity` anyway, so capping is safe.

### Stale Closures in Keyboard Handlers
**Symptom**: Calculator keyboard handler doesn't respond to key presses, or uses stale state values.  
**Root Cause**: A `useEffect` dependency array that omits handler functions (`inputDigit`, `performOp`, etc.) captures the first render's versions, leading to stale closures after state changes.  
**Fix**: Calculator keyboard handler's `useEffect` now includes all referenced handlers in its dependency array: `[inputDigit, inputDecimal, performOp, calculate, clear, backspace, percentage]`. Always include all referenced values in `useEffect` dependency arrays, or use refs for values that change frequently.
**Context**: This was a subtle bug found during the 2026-06-02 audit. The handlers ARE recreated on every render, so including them in the dep array is correct (they won't cause infinite re-renders because they're stable).

## 🔒 Security Reminders

1. Any new app that evaluates math must use `safeEval()`.
2. Any new app that renders user HTML must use `sanitizeHtml()`. **Prefer React components over `dangerouslySetInnerHTML` wherever possible.**
3. Any new feature that persists to `localStorage` must validate with `zod`.
4. Never add `eval()`, `new Function()`, or `Function()` to any app unless it is the `safeEval` implementation itself.
5. **Any app accepting user-supplied regex must limit `exec()` iterations** to prevent ReDoS (catastrophic backtracking). Use a max iteration counter (e.g., 1000) and bail out early.
6. **Any function creating arrays from user input must cap the size** before allocation to prevent memory exhaustion crashes.

## 🔒 Security Reminders

1. Any new app that evaluates math must use `safeEval()`.
2. Any new app that renders user HTML must use `sanitizeHtml()`. **Prefer React components over `dangerouslySetInnerHTML` wherever possible.**
3. Any new feature that persists to `localStorage` must validate with `zod`.
4. Never add `eval()`, `new Function()`, or `Function()` to any app unless it is the `safeEval` implementation itself.
5. **Any app accepting user-supplied regex must limit `exec()` iterations** to prevent ReDoS (catastrophic backtracking). Use a max iteration counter (e.g., 1000) and bail out early.
6. **Any function creating arrays from user input must cap the size** before allocation to prevent memory exhaustion crashes.

## 📐 Performance Patterns

### React.lazy + Suspense for Code Splitting
- **Before**: All 54 apps eagerly imported in `AppRouter.tsx`, creating a ~1 MB initial bundle.
- **After**: `AppRouter.tsx` uses `React.lazy()` + `Suspense` with `AppSkeleton` fallback. Each app is loaded on demand, producing 60 individual chunks. Initial shell reduced to ~360 KB.
- **Caveat**: `NotImplemented.tsx` cannot be lazy-loaded (it's the fallback). All other apps are lazy.
- **Build verification**: `npx vite build` now emits `dist/assets/[AppName]-[hash].js` for each app.

### Shared DynamicIcon
- **Before**: `DynamicIcon` inlined in 8 components (`Dock`, `WindowFrame`, `Desktop`, `AppLauncher`, `NotificationCenter`, `NotImplemented`, `ContextMenu`, `NotificationSystem`).
- **After**: Single `src/components/DynamicIcon.tsx` shared by all.
- **Benefit**: Eliminates duplication and ensures consistent fallback (`HelpCircle`) and `memo()` behavior.

### Reducer Side-Effect Extraction
- **Before**: `ADD_DESKTOP_ICON`, `REMOVE_DESKTOP_ICON`, and `UPDATE_DESKTOP_ICON_POSITION` performed `localStorage.setItem` directly inside `osReducer`.
- **After**: Side effects moved to `useEffect` in `OSProvider`.
- **Benefit**: Reducer is now pure, testable, and deterministic.

---

## 💡 Lessons Learned

- **`eval()` is never safe**, even with regex sanitization. Build a proper parser or use a restricted subset.
- **TypeScript types are not runtime guarantees**. `JSON.parse()` + `as T` is a security and reliability risk. Always validate persisted data with **zod** at runtime.
- **Shared zod validation utility saves boilerplate**. `safeJsonParse(raw, schema, fallback)` (in `src/utils/safeJsonParse.ts`) provides a zero-boilerplate wrapper for `storageValidation.ts`-style validation in ad-hoc app reads.
- **Monolithic reducers are hard to maintain**. The 499-line `osReducer` works but is difficult to test and reason about. Consider splitting by domain.
- **Window state transitions are surprisingly complex**. The interaction of z-index, focus, minimize, maximize, and close requires careful handling of edge cases.
- **Dead import (Icons) can crash an entire app**. `NotImplemented.tsx` was missing `import * as Icons from 'lucide-react'`, causing a `ReferenceError` whenever any unbuilt app opened. Always verify imports manually.
- **Dead code breaks builds, not just aesthetics**. `tsconfig.app.json` enforces `noUnusedLocals` and `noUnusedParameters`. A single unused import (e.g., a stolen from `lucide-react`) or unread state variable will cause `npm run build` to fail with `TS6133`. Clean up dead code immediately when removing features.
- **`dangerouslySetInnerHTML` is a persistent XSS vector**. Even with DOMPurify, custom tag/attribute allowlists create attack surface. Prefer React components for highlighting (e.g., `<mark>`) over concatenated HTML strings. The RegexTester refactoring eliminated all `dangerouslySetInnerHTML` usage in favor of React component rendering.
- **ReDoS (catastrophic backtracking) from user regex is real**. A pattern like `(a+)+$` against a long string can freeze the browser tab entirely. Always limit `exec()` iterations (e.g., 1000) and bail out early. Never trust user-supplied regex without guards.
- **Unbounded array creation from user input crashes browsers**. The Calculator factorial function previously created an array of size `Math.floor(v)` without a cap, allowing input like `1e8` to crash the tab. Always cap input-dependent allocations (factorial capped at 170, where JavaScript `Number` overflows to `Infinity`).
- **Stale closures in keyboard handlers are subtle bugs**. The Calculator keyboard handler's `useEffect` dependency array didn't include the handler functions (`inputDigit`, `performOp`, etc.), capturing the first render's versions. Always include all referenced values in `useEffect` dependency arrays, or use refs for values that change frequently.
- **Window state transitions are surprisingly complex**. The interaction of z-index, focus, minimize, maximize, and close requires careful handling of edge cases.
- **Dead import (Icons) can crash an entire app**. `NotImplemented.tsx` was missing `import * as Icons from 'lucide-react'`, causing a `ReferenceError` whenever any unbuilt app opened. Always verify imports manually.
- **Dead code breaks builds, not just aesthetics**. `tsconfig.app.json` enforces `noUnusedLocals` and `noUnusedParameters`. A single unused import (e.g., a stolen from `lucide-react`) or unread state variable will cause `npm run build` to fail with `TS6133`. Clean up dead code immediately when removing features.
- **`dangerouslySetInnerHTML` is a persistent XSS vector**. Even with DOMPurify, custom tag/attribute allowlists create attack surface. Prefer React components for highlighting (e.g., `<mark>`) over concatenated HTML strings. The RegexTester refactoring eliminated all `dangerouslySetInnerHTML` usage in favor of React component rendering.
- **ReDoS (catastrophic backtracking) from user regex is real**. A pattern like `(a+)+$` against a long string can freeze the browser tab entirely. Always limit `exec()` iterations (e.g., 1000) and bail out early. Never trust user-supplied regex without guards.
- **Unbounded array creation from user input crashes browsers**. The Calculator factorial function previously created an array of size `Math.floor(v)` without a cap, allowing input like `1e8` to crash the tab. Always cap input-dependent allocations (factorial capped at 170, where JavaScript `Number` overflows to `Infinity`).
- **Stale closures in keyboard handlers are subtle bugs**. The Calculator keyboard handler's `useEffect` dependency array didn't include the handler functions (`inputDigit`, `performOp`, etc.), capturing the first render's versions. Always include all referenced values in `useEffect` dependency arrays, or use refs for values that change frequently.
