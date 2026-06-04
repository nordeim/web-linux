## Role Definition

You are a **Codebase Audit Analyst**. Your specialty is conducting rigorous, evidence-grounded reviews of software projects by cross-referencing documentation against actual source code, identifying discrepancies, bugs, architectural issues, and security concerns - then delivering a consolidated, severity-ranked findings report.

---

## Mission Statement

Given a set of project documentation files (e.g., README, architecture guides, AI-agent briefings, contributor guidelines) and corresponding source code, your task is to: (1) deeply understand the project's architecture, design rationale, and stated conventions by extracting structured knowledge from each document; (2) validate every material claim in the documentation against the actual source code; (3) conduct a multi-dimensional critical audit of the codebase; and (4) produce a consolidated report that is evidence-traceable, severity-ranked, and actionable.

---

## Operating Principles

1. **Evidence is sovereign.** Every finding must be traceable to a specific piece of provided content - a line of code, a config value, a documentation statement, or the absence thereof. Never speculate beyond what the provided content supports.

2. **Distinguish verification outcomes clearly.** A claim can be: **Confirmed** (source code supports it), **Discrepant** (source code contradicts it), **Inconsistent** (documents contradict each other), or **Unverifiable** (required source files not provided). Never collapse these categories.

3. **Extract from documents individually before cross-referencing.** Process each document in isolation to capture its full content and perspective. Only then reconcile across documents. This prevents premature averaging that loses important details.

4. **Validate config files as first-class evidence.** Package manifests, build configs, and type configs are machine-readable ground truth. They often resolve documentation disputes definitively.

5. **Audit source code independently of documentation claims.** Even perfectly documented code can contain bugs, security issues, or architectural problems. The audit phase is not merely a validation pass - it is an independent review.

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

Additionally, perform **gap identification** on provided source files: scan each file for bugs, missing imports, dead code, type errors, inconsistencies with the project's stated conventions, and incomplete implementations - independent of any documentation claims.

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
3. **Severity calibration**: Are severity levels consistent? A finding marked "Critical" should represent a genuine security risk, crash path, or data loss scenario - not merely an inconvenience.
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
- Raw extraction dumps - all information should be processed, verified, and contextualized.

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
- Note when multiple documents agree on a claim - this strengthens confidence but does not replace source code verification.
- Flag when a single document makes a unique claim not found in others - this may indicate either specialized knowledge or an error.
- Prioritize findings by real-world impact: what breaks, what is exploitable, what degrades user experience, what creates maintenance burden.
# AI Agent Briefing: UbuntuOS Web

This document provides high-signal technical context for AI coding agents. It focuses on non-obvious architectural patterns, state management quirks, security rules, and hard-earned lessons from the comprehensive security audit and remediation completed on 2026-05-31.

🔍 Comprehensive Project Review
📌 WHAT: The Project
UbuntuOS Web is a comprehensive web-based replica of the Ubuntu Linux desktop environment. It is not a static mockup, but a fully interactive, single-page application (SPA) built on modern web technologies.
- Product Type: Web application (Desktop Environment)
- Core Functionality: A complete desktop environment with a custom window manager, a virtual file system (VFS), and 55 functional, interactive applications.
- Key Features:
- Window Manager: Custom z-index stacking, drag-and-drop windows, minimize/maximize/restore functionality.
- Desktop Environment:
- Virtual File System (VFS): A robust file management layer with unique ID-based references, trash handling, and localStorage persistence for data.
- Application Ecosystem: 55 pre-installed apps across 7 categories (System, Productivity, Internet, Media, Games, DevTools, Creative).
🎯 WHY: The Purpose and Rationale
The project serves a dual purpose:
1. Developer Showcase: It demonstrates advanced architectural patterns in React, such as complex state management without external libraries (using Context + useReducer), and creative solutions to SPA challenges like windowing systems and z-index stacking.
2. User Toolset: It provides a portable, web-accessible collection of common productivity, utility, and entertainment applications (e.g., Calculator, Terminal, Games, Text Editor).
The motivation for the architecture stemmed from the complexity of managing 55 individual applications. Eagerly loading all of them would create an unacceptable initial bundle size, and managing state across all these disparate components without a clear architecture would lead to a tangled, unmaintainable codebase.
🛠️ HOW: Architecture, Tech Stack, and Design
Core Tech Stack
Layer	Technology	Purpose
Frontend	React 19.2.0	Component-based UI & Hook-based logic
Language	TypeScript 5.9.3	Strict type safety across the OS store
Build Tool	Vite 7.2	Development server and production build
Styling	Tailwind CSS 3.4	Utility-first styling with design tokens
Components	Radix UI / Shadcn	Accessible primitive components
Icons	Lucide React	Vector iconography (named imports only)
Security	DOMPurify	XSS sanitization for user-generated HTML
Validation	Zod	Runtime schema validation for localStorage data
Testing	Vitest	Unit and source-level testing
Architectural Design
The project follows a clear separation of concerns, separating the OS shell, application logic, and shared utilities.
1. Centralized State Management (useOS Hook):
- Technology: React Context + useReducer.
- Role: This is the "brain" of the OS. It manages all global state, including the list of open windows, their z-indices, focus, minimize/maximize status, and desktop icon positions.
- Key Pattern: Actions are dispatched to a central osReducer to update the global state.
2. Virtual File System (VFS) (useFileSystem Hook):
- Technology: Custom hook built on top of a JavaScript object graph.
- Role: Manages all file and directory operations.
- Key Design: Files and folders are identified by a unique id, not their path. This allows for robust renaming and moving without breaking references. It also normalizes paths (e.g., //home//user// -> /home/user).
- Persistence: The entire VFS is serialized to localStorage under the key ubuntuos_filesystem_v2.
3. Window Management (WindowFrame & App):
- Technology: Custom window engine in src/components/WindowFrame.tsx.
- Role: Provides a standardized, look-and-feel-consistent window chrome (title bar, borders, controls) for all applications.
- Key Patterns:
- Drag & Resize: Handled at the WindowFrame level, so individual apps don't need to implement it.
- Focus Management: Z-index is managed globally via a nextZIndex counter. To focus a window, an FOCUS_WINDOW action is dispatched, which increments the counter. Never should a developer manually set z-index in CSS.
- State Transitions: Carefully handles transitions between normal, minimized, and maximized states, including restoring previous size and position.
4. Application Isolation (Dynamic Routing):
- Technology: React.lazy() and Suspense.
- Role: Drastically reduces the initial bundle size.
- Pattern: Instead of eagarly importing all 55 apps, they are loaded on demand. This reduced the initial bundle from ~1 MB to ~360 KB. NotImplemented.tsx is the only component that cannot be lazy-loaded because it serves as a fallback.
5. Shared Utilities (src/utils/):
- safeEval.ts: A hardened math expression parser (shunting-yard algorithm) that replaces the dangerous eval() and new Function(). This is mandatory for any math evaluation.
- sanitizeHtml.ts: A wrapper around DOMPurify to sanitize dangerouslySetInnerHTML content. It also provides sanitizeMarkdownHtml() for markdown tags.
- storageValidation.ts & safeJsonParse.ts: A runtime validation layer that uses zod to ensure data read from localStorage matches its expected schema before use. This prevents crashes from corrupted data.
- DynamicIcon.tsx: A shared component for rendering Lucide icons by name. This is the only file in the codebase authorized to use a wildcard import (import * as Icons from 'lucide-react'), as it dynamically resolves icons at runtime, eliminating ~587KB of bundle bloat in other components.
Security & Performance Principles
- Security-First: The project has undergone multiple audits. Forbidden patterns include eval(), new Function(), and dangerouslySetInnerHTML without sanitizeHtml().
- Performance-First: Strict TypeScript configuration (noUnusedLocals, noUnusedParameters) ensures dead code is eliminated at build time. Optimization strategies include code splitting with dynamic imports and a shared DynamicIcon.
📋 Key Documents and Their Roles
Document	Purpose & Audience
plan.md	The original project roadmap. Contains the initial feature checklist, application list (50+ apps), and staged execution plan. Provides historical context for the project's scope.
README.md	The primary public-facing documentation. Contains the project overview, quick start guide, architecture summary, and a detailed list of recent security and reliability improvements.
AGENTS.md	A high-signal technical briefing specifically for AI coding agents. It focuses on non-obvious architectural patterns, state management quirks, security rules, and lessons learned from past audits. It is crucial for ensuring future code changes maintain the project's quality standards.
CLAUDE.md	A more detailed coding standards document, expanding on AGENTS.md with specific implementation guidelines for React, TypeScript, Tailwind, Lucide, and the project's security and persistence rules. It includes a validated plan for a "Real Terminal" feature and a list of prioritized recommendations for future work.
✅ Summary
UbuntuOS Web is a complex, well-architected single-page application that cleverly recreates a desktop OS in the browser. Its design is built around principles of strict type safety (TypeScript), implicit security (forbidding eval() and XSS vectors), robust state management (React Context + Reducer), and performance optimization (dynamic imports). The extensive documentation is a testament to the project's maturity and the lessons learned from rigorous code reviews, ensuring a high standard of quality and maintainability.

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
> - **Bug fix of**: `Spreadsheet.tsx` and `Terminal.tsx` previously used `eval()` and `new Function()` - both removed.

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
- **`walkAndDelete` Traversal Helper**: A module-level `walkAndDelete(nodes, nodeId)` function recursively deletes a node and all descendants, returning an list of deleted IDs. It replaces two previously duplicated inline `recurseDelete` closures in `deleteNode` and `emptyTrash`, eliminating ~30 lines of duplication while preserving immutability (it operates on a shallow-copied `nodes` object).
- **`TextEncoder` for File Size**: `createFile` and `writeFile` use `new TextEncoder().encode(content).length` instead of `new Blob([content]).size`. `TextEncoder` avoids a full Blob allocation, is lighter, and yields an identical UTF-8 byte count.

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
- **Missing ARIA on Interactive Elements**: All clickable elements and fields must have accessible names. Use `aria-label` for icon-only buttons, `aria-pressed` for toggle buttons, and `aria-hidden="true"` for decorative icons. Include `role` and `tabIndex` where appropriate for keyboard navigation.

## 🔗 Key Entry Points
- `src/hooks/useOSStore.tsx`: Global OS state and reducer.
- `src/hooks/useFileSystem.ts`: VFS logic and associations.
- `src/apps/AppRouter.tsx`: Central component mapping for windows.
- `src/utils/safeEval.ts`: Secure math evaluator.
- `src/utils/sanitizeHtml.ts`: XSS sanitization (also exports `sanitizeMarkdownHtml()` for markdown content).
- `src/utils/safeJsonParse.ts`: Generic `JSON.parse` + zod validation utility.
- `src/utils/storageValidation.ts`: localStorage schema validation for OS-level data.
- `src/components/GlobalErrorBoundary.tsx`: Error boundary wrapper for apps and shell.

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

### NotImplemented - pattern for icons in fallback views
**Pattern**: `NotImplemented.tsx` lives at `src/components/NotImplemented.tsx` (not under `src/apps/`) and uses named Lucide imports (`HelpCircle`, `Hammer`) plus `<DynamicIcon />` for runtime icon resolution by string name.
**Why named imports only**: A wildcard `import * as Icons from 'lucide-react'` reintroduces the ~587 KB bundle bloat the `DynamicIcon.tsx` refactor eliminated. Only `DynamicIcon.tsx` is authorised to use the wildcard form because it resolves icons by string at runtime; everything else (including `NotImplemented.tsx`) must use named imports. The ESLint config (`app/eslint.config.js`) enforces this.
**Historical note**: An earlier version of `NotImplemented.tsx` referenced `Icons.HelpCircle` / `Icons.Hammer` without importing `lucide-react`, causing `ReferenceError: Icons is not defined` whenever an unbuilt app opened. That bug is fixed; this section is preserved as a pattern reference, not a troubleshooting entry.

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

### MINIMIZE_ALL Losing Window Positions
**Symptom**: After using "Minimize All" (Super+D), restoring individual windows returns them to incorrect positions.
**Root Cause**: `MINIMIZE_ALL` reducer sets `state: 'minimized'` but does NOT capture `prevPosition` and `prevSize` (unlike `MINIMIZE_WINDOW` which does). Restoration falls back to current values instead of pre-minimize positions.
**Fix**: `MINIMIZE_ALL` now captures `prevPosition: { ...w.position }` and `prevSize: { ...w.size }` before minimizing, matching the behavior of `MINIMIZE_WINDOW`.
**Context**: This inconsistency created a UX regression where the restore behavior differed depending on whether windows were minimized individually or via "Minimize All".

### Apps Using Unvalidated `localStorage`
**Symptom**: App crashes on load, shows corrupted data, or loads stale values after localStorage has been tampered with.
**Root Cause**: Some apps used `JSON.parse(localStorage.getItem(...))` without schema validation. Corrupted data or unexpected types would cause `TypeError`s or silent failures.
**Fix**: All apps now use `safeJsonParse(raw, schema, fallback)` from `@/utils/safeJsonParse`, which validates with zod before returning data. `Todo.tsx` and `VoiceRecorder.tsx` were the last two apps fixed in the 2026-06-04 remediation. If adding a new feature, always use `safeJsonParse` with a zod schema.
**Context**: This was a medium-severity finding (M1-M2) in the 2026-06-04 audit. The `safeJsonParse` utility provides zero-boilerplate validation: `safeJsonParse(localStorage.getItem('key'), MySchema, fallbackValue)`.

### VFS `walkAndDelete` Duplication
**Symptom**: `deleteNode` and `emptyTrash` in `useFileSystem.ts` both contained nearly identical inline `recurseDelete` closures, violating DRY and making maintenance harder.
**Root Cause**: Both functions needed recursive descendant deletion logic but duplicated it inline.
**Fix**: Extracted a module-level `walkAndDelete(nodes, nodeId)` helper that returns `string[]` of deleted IDs. Callers receive the IDs and clean up `trashMeta` independently. This preserves immutability (operates on a shallow-copied `nodes` object), eliminates ~30 lines of duplication, and is reusable across VFS operations.

### `new Blob([content]).size` Allocation Overhead
**Symptom**: File creation and writes in the VFS allocate unnecessary `Blob` objects just to compute a string's byte length.
**Root Cause**: `createFile` and `writeFile` used `new Blob([content]).size` for size calculation.
**Fix**: Replaced with `new TextEncoder().encode(content).length`. `TextEncoder` is lighter, avoids Blob allocation, and produces the exact same UTF-8 byte count. Applied to both `createFile` and `writeFile` in `useFileSystem.ts`.

### Legacy localStorage Key Bloat After Migration
**Symptom**: `localStorage` grows over time with stale keys, even after migration.
**Root Cause**: `storageValidation.ts` migrated data from `ubuntuos_filesystem` (legacy) to `ubuntuos_filesystem_v2` but left the old key in place.
**Fix**: `validateFileSystem` now calls `localStorage.removeItem(LEGACY_FILESYSTEM_KEY)` after successfully saving migrated data to the new key, keeping storage clean.

### Mid-File Import Statements
**Symptom**: Build failures or confusing import chains when `import` statements appear in the middle of a file rather than at the top.
**Root Cause**: `useOSStore.tsx` had `import { validateDesktopIcons } from '@/utils/storageValidation'` between the `createInitialDockItems` and `loadDesktopIcons` helper functions, breaking TypeScript/React conventions.
**Fix**: Moved the import to the top of the file with all other top-level imports. Always keep all `import` statements at the top of the file.

### `authToken.ts` Production Guard
**Symptom**: The development-only JWT token generator (`generateToken`) could be accidentally called in production, generating invalid or insecure tokens.
**Root Cause**: `authToken.ts` was intended for development and testing only but had no guard against production use.
**Fix**: Added an `if (!import.meta.env.DEV) throw new Error(...)` guard at the top of `generateToken`. Any attempt to use it in a production build throws immediately. For production, use a backend `/auth/token` endpoint instead.

### PasswordManager Hardcoded PIN (C-2)
**Symptom**: The PasswordManager app used a hardcoded `MASTER_PIN = '1234'`, creating a critical security vulnerability.
**Root Cause**: A development placeholder was left in production code.
**Fix**:
- Removed `const MASTER_PIN = '1234'`.
- Added `storedPin` state, persisted to `localStorage` under `password_manager_pin`, defaulting to `'1234'` for backward compatibility.
- Added a "Change PIN" UI in the authenticated view to let users set their own PIN.
- Added a demo-mode security warning banner.
- `checkPin` now compares against the user-stored PIN instead of a constant. Note: this is still demo-grade security; a production app must use proper encryption and backend validation.

### Terminal `windowId` Prop (H-1)
**Symptom**: `Terminal.tsx` declared an optional `windowId` prop in its interface but never destructured or used it, making it a dead prop.
**Root Cause**: The prop was added contractually but never wired into the component logic.
**Fix**: Changed `(_props: TerminalProps)` to `({ windowId }: TerminalProps)`. The initial `lines` state now includes `windowId` in the welcome message when present, making the prop functional and enabling per-window identification.

### Missing ARIA on Icon-Only Buttons (H-2)
**Symptom**: Screen readers cannot identify the purpose of buttons that contain only an icon (no visible text).
**Root Cause**: `Calculator.tsx` and `TextEditor.tsx` had multiple icon-only `<button>` elements without `aria-label`.
**Fix**: Added `aria-label` to: Calculator's history toggle (`aria-label="Toggle history"`), backspace (`ariaLabel="Backspace"`), and delete (`ariaLabel="Delete"`); TextEditor's zoom out/in, close find, and close tab buttons. The `ariaLabel` prop flows through a reusable `Btn` component in Calculator. For subsequent apps, always add `aria-label` to any `<button>` that lacks visible text.
**Context**: This was a high-severity accessibility finding. The fix was validated with 7 new source-level tests in `aria-attributes.test.ts`.

### CSS Build Warning from Regex Pattern
**Symptom**: Build output shows `▲ [WARNING] Expected identifier but found "-" [css-syntax-error]` with `  -: \|\s;`.
**Root Cause**: Tailwind CSS content scanner misinterprets regex patterns containing character classes like `[-:\|\s]` as CSS class selectors. This occurs when files are included in the Tailwind `content` configuration.
**Fix**: Exclude affected files from Tailwind scanning in `tailwind.config.mjs`:
```javascript
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '!./src/apps/MarkdownPreview.tsx']
```
**Verification**: Run `npm run build` and verify no `css-syntax-error` warnings appear.
**Context**: This was discovered during the 2026-06-04 audit. The MarkdownPreview.tsx file contains a regex pattern `[-:\|\s]` for matching markdown table separators, which Tailwind misinterprets as a CSS class selector.

### Registry Completeness Mismatch
**Symptom**: An app is routed in `AppRouter.tsx` but does not appear in the app launcher or desktop icons.
**Root Cause**: The app was added to `AppRouter.tsx` but not registered in `registry.ts`. Without a registry entry, the app cannot be discovered by the UI.
**Fix**: Add a registry entry in `src/apps/registry.ts` with the same `id` as the case statement in `AppRouter.tsx`. The registry completeness test (`src/apps/__tests__/registry-completeness.test.ts`) automatically verifies this.
**Context**: This was discovered when `matrixrain` was routed but not registered, preventing it from appearing in the app launcher.

### Invalid CSS Color Injection
**Symptom**: Malicious color values could be injected via `dangerouslySetInnerHTML` in CSS context.
**Root Cause**: The `chart.tsx` component generates CSS variables from `ChartConfig` color values without validation.
**Fix**: Use `isValidColor()` from `@/utils/colorValidation` to validate color values before CSS injection:
```typescript
import { isValidColor } from '@/utils/colorValidation';
return color && isValidColor(color) ? `--color-${key}: ${color};` : null;
```
**Context**: This was discovered during the 2026-06-04 audit. While current color values come from application config (not user input), validation provides defense-in-depth.

## 🔒 Security Reminders

1. Any new app that evaluates math must use `safeEval()`.
2. Any new app that renders user HTML must use `sanitizeHtml()`. **Prefer React components over `dangerouslySetInnerHTML` wherever possible.**
3. Any new feature that persists to `localStorage` must validate with `zod`.
4. Never add `eval()`, `new Function()`, or `Function()` to any app unless it is the `safeEval` implementation itself.
5. **Any app accepting user-supplied regex must limit `exec()` iterations** to prevent ReDoS (catastrophic backtracking). Use a max iteration counter (e.g., 1000) and bail out early.
6. **Any function creating arrays from user input must cap the size** before allocation to prevent memory exhaustion crashes.
7. **Always use named imports for Lucide React icons**. Wildcard imports (`import * as Icons from 'lucide-react'`) bloat the bundle by ~587 KB. `DynamicIcon.tsx` is the only authorized wildcard import since it resolves icons by string name at runtime. `WindowFrame.tsx` was fixed to use named imports (`Minus`, `Copy`, `Square`, `X`).
8. **Wrap `dangerouslySetInnerHTML` with `sanitizeHtml()` even for internal CSS injection**. The `chart.tsx` UI component generates CSS variables from `ChartConfig` color values. While these values come from application-level configuration (not user input), always validate dynamic content before injection. If chart colors are ever sourced from user input, add hex/rgb/hsl color value validation.
9. **Export shared sanitization utilities from `@/utils/` modules**. `sanitizeMarkdownHtml()` was local to `MarkdownPreview.tsx` but is now properly exported from `@/utils/sanitizeHtml` for reuse across apps.
10. **Remove dead code immediately**, not just comment it out. `Desktop.tsx` retained a commented `import * as Icons from 'lucide-react'` line that served no purpose and violated build hygiene.
11. **Source-level tests are valid for accessibility regression detection**. When vitest infrastructure blocks component rendering, reading source files and asserting on ARIA attribute presence catches regressions. See `aria-attributes.test.ts` for the pattern.
12. **Audit all z-index increment sites for the overflow cap**. After `END_ALT_TAB` was found missing the z-index cap (while `OPEN_WINDOW` and `FOCUS_WINDOW` had it), establish a pattern of auditing every point that increments z-index when changes are made. The cap is `Math.min(nextZIndex + 1, 2147483647)`.
13. **Remove unused dependencies before they accumulate**. The `jose` JWT library was installed but unused, increasing bundle size and potential attack surface. Dependencies should only be added when actively needed; remove them if plans change.
14. **Propagate windowId through the component hierarchy explicitly**. When a component's child needs per-window identity (cleanup, focus, or container mapping), always pass `windowId` as a prop. Do not rely on child components re-registering or deriving window identity from global state.
15. **Development-only utilities must have production guards**. `authToken.ts` previously lacked a guard against production use. Any development-only helper (JWT generators, mock data injectors, debug toggles) should throw or no-op in production builds.
16. **Never ship hardcoded secrets or demo credentials in production code**. The PasswordManager's hardcoded `MASTER_PIN = '1234'` was a critical vulnerability. Even for demo apps, secrets must be user-configurable and persisted securely. Always add a visible security warning when encryption is absent.
17. **Icon-only buttons must have accessible names**. Any `<button>` containing only an icon (no visible text) requires an `aria-label`. This is a WCAG requirement and a high-severity accessibility gap.
18. **Validate CSS color values before injection**. Use `isValidColor()` from `@/utils/colorValidation` when injecting dynamic color values via `dangerouslySetInnerHTML` in CSS context.
19. **Verify registry completeness when adding apps**. After adding a new app to `AppRouter.tsx`, ensure it has a corresponding entry in `registry.ts`. The registry completeness test will catch mismatches automatically.

## 📐 Performance Patterns

### React.lazy + Suspense for Code Splitting
- **Before**: All 55 apps eagerly imported in `AppRouter.tsx`, creating a ~1 MB initial bundle.
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
- **Monolithic reducers are hard to maintain**. The `osReducer` is approximately 375 lines and is difficult to test and reason about. Consider splitting by domain.
- **Window state transitions are surprisingly complex**. The interaction of z-index, focus, minimize, maximize, and close requires careful handling of edge cases.
- **Dead import (Icons) can crash an entire app**. `NotImplemented.tsx` was missing `import * as Icons from 'lucide-react'`, causing a `ReferenceError` whenever any unbuilt app opened. Always verify imports manually.
- **Dead code breaks builds, not just aesthetics**. `tsconfig.app.json` enforces `noUnusedLocals` and `noUnusedParameters`. A single unused import (e.g., a stolen from `lucide-react`) or unread state variable will cause `npm run build` to fail with `TS6133`. Clean up dead code immediately when removing features.
- **`dangerouslySetInnerHTML` is a persistent XSS vector**. Even with DOMPurify, custom tag/attribute allowlists create attack surface. Prefer React components for highlighting (e.g., `<mark>`) over concatenated HTML strings. The RegexTester refactoring eliminated all `dangerouslySetInnerHTML` usage in favor of React component rendering.
- **ReDoS (catastrophic backtracking) from user regex is real**. A pattern like `(a+)+$` against a long string can freeze the browser tab entirely. Always limit `exec()` iterations (e.g., 1000) and bail out early. Never trust user-supplied regex without guards.
- **Unbounded array creation from user input crashes browsers**. The Calculator factorial function previously created an array of size `Math.floor(v)` without a cap, allowing input like `1e8` to crash the tab. Always cap input-dependent allocations (factorial capped at 170, where JavaScript `Number` overflows to `Infinity`).
- **Stale closures in keyboard handlers are subtle bugs**. The Calculator keyboard handler's `useEffect` dependency array didn't include the handler functions (`inputDigit`, `performOp`, etc.), capturing the first render's versions. Always include all referenced values in `useEffect` dependency arrays, or use refs for values that change frequently.
- **`MINIMIZE_ALL` must save `prevPosition`/`prevSize`** just like `MINIMIZE_WINDOW`. Failing to capture window positions before minimizing causes restoration to fall back to incorrect coordinates. Always mirror state-saving logic across related actions.
- **Named imports for Lucide React save bundle size**. `WindowFrame.tsx` previously imported `* as Icons from 'lucide-react'` (~587 KB), which was fixed to use named imports (`Minus`, `Copy`, `Square`, `X`). Only `DynamicIcon.tsx` should use wildcard imports since it resolves icons dynamically by string name.
- **Shared sanitization utilities must be exported from `@/utils/`**. `sanitizeMarkdownHtml()` was local to `MarkdownPreview.tsx`, forcing any app needing markdown sanitization to duplicate the logic or import from an app file. It is now properly exported from `@/utils/sanitizeHtml` for reuse across the codebase.
- **Dead commented code is still dead code**. `Desktop.tsx` retained a commented `import * as Icons from 'lucide-react'` line that served no purpose. `tsconfig.app.json` enforces `noUnusedLocals`, so dead code must be removed, not just commented out.
- **Documentation line counts drift**. The `osReducer` was documented as "499-line" but is actually ~350 lines. Always re-verify quantitative claims (line counts, file sizes, test counts) before documenting them. Prefer relative descriptions ("large monolithic reducer") over specific numbers that go stale.
- **Internal CSS injection via `dangerouslySetInnerHTML` still needs validation**. The `chart.tsx` UI component generates CSS variables from `ChartConfig` color values. Even though these come from application-level config (not user input), always validate dynamic content before injection. If chart colors are ever sourced from user input, add hex/rgb/hsl color value validation.
- **Vitest `@/` alias resolution blocks component tests**. Tests importing components via `@/` aliases fail due to vitest module resolution. Solution: Use source-level tests (reading file source strings) for component validation, or fix the alias configuration to support component rendering tests.
- **Source-level tests as valid alternative**: When component rendering is blocked by infrastructure, validate by reading component source files and asserting on attribute presence (e.g., `aria-label`, `role`, `tabIndex`). This catches ARIA regressions without requiring full rendering.
- **Third-party implementation plans must also be independently validated**. The plan_xterm.md draft had the wrong xterm package names (v4 unscoped instead of v5 `@xterm/*`), wrong category casing (lowercase vs PascalCase), and assumed a JWT system existed (it did not). The `AppRouterProps` declared `windowId` but the `AppRouter` component never destructured it. All three issues were caught by reading the actual source code, not the plan.

- **Third-party audit findings must be independently validated**: The kilo-1 audit had a ~33% error rate on CRITICAL/HIGH findings. C-1 (Calendar unused imports) was completely wrong; H-1 (17 apps using raw JSON.parse) was stale/post-fix; H-6 (osReducer line count) misinterpreted file lines vs. function lines. Always grep the actual source before acting on audit findings.
- **Remove unused dependencies before they accumulate**: The `jose` JWT library was installed for the Real Terminal feature but was unused, increasing bundle size and potential attack surface. Dependencies should only be added when actively needed; remove them if plans change.
- **`walkAndDelete` reduces VFS duplication**: Extracting a single `walkAndDelete` helper eliminated ~30 lines of duplicated inline `recurseDelete` closures in `deleteNode` and `emptyTrash`. Preserving immutability (shallow-copied `nodes` object) while returning deleted IDs allows callers to clean up `trashMeta` independently.
- **`TextEncoder` is lighter than `Blob` for byte counting**: `new TextEncoder().encode(content).length` produces the same UTF-8 byte count as `new Blob([content]).size` without allocating a full `Blob` object. This is a micro-optimization but matters for frequently called operations like `writeFile`.
- **Legacy localStorage keys must be cleaned after migration**: After migrating data from `ubuntuos_filesystem` → `ubuntuos_filesystem_v2`, the old key was left in place, causing storage bloat. Always delete the legacy key after confirming a successful migration.
- **Mid-file imports break conventions and readability**: `useOSStore.tsx` had an `import` between helper functions, which is confusing and violates TypeScript/React style. Always keep all `import` statements at the top of the file.
- **Development-only utilities must have production guards**: `authToken.ts` previously lacked a guard against production use. Any development-only helper should throw immediately when `import.meta.env.PROD` is true, preventing accidental misuse.
- **Demo apps still need security hygiene**: The PasswordManager's hardcoded `MASTER_PIN = '1234'` was a critical vulnerability. Even for demo features, secrets must be user-configurable, persisted with schema validation, and accompanied by a visible security warning.
- **Dead props create silent contract violations**: `Terminal.tsx` declared `windowId` in its interface but never destructured or used it. Always verify that declared props are actually consumed in the component body; otherwise, the prop contract is misleading.
- **Source-level tests catch ARIA regressions**: When vitest infrastructure blocks component rendering, reading source files and asserting on attribute presence (e.g., `aria-label`, `role`, `tabIndex`) catches regressions without requiring full rendering. See `aria-attributes.test.ts` for the pattern.
- **Tailwind content scanning can misinterpret regex patterns**: Character classes in regex patterns (e.g., `[-:\|\s]`) can be misinterpreted as CSS class selectors by Tailwind's content scanner. Exclude affected files from Tailwind scanning to prevent build warnings.
- **Registry completeness tests prevent missing apps**: Always verify that apps routed in `AppRouter.tsx` have corresponding entries in `registry.ts`. The registry completeness test (`src/apps/__tests__/registry-completeness.test.ts`) automatically validates this.
- **CSS color validation provides defense-in-depth**: Even when color values come from application config (not user input), validate them with `isValidColor()` from `@/utils/colorValidation` before CSS injection to prevent potential attacks.
