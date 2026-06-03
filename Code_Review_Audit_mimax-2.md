Let me start by finding and reading these files.
✱ Glob "**/CLAUDE.md" (1 match)
✱ Glob "**/README.md" (1 match)
✱ Glob "**/AGENTS.md" (1 match)
✱ Glob "**/plan.md" (1 match)
Thinking: Found all four files. Let me read them in parallel.
→ Read CLAUDE.md 
→ Read README.md 
→ Read AGENTS.md 
→ Read plan.md 
Thinking: I've now read all four documents. Let me synthesize a deep understanding of the WHAT, WHY, and HOW of the project.
Project Summary:
WHAT - UbuntuOS Web is a web-based replica of the Ubuntu Linux desktop environment. It's a single-page application built with React 19, TypeScript, and Tailwind CSS, packaged as a static website. It features:
- 54 (originally targeted 50+) interactive applications across 7 categories
- A virtual file system (VFS) with localStorage persistence
- A custom window manager with z-index stacking
- Boot/login animations
- Modern React patterns (hooks, context, reducers, lazy loading)
WHY - The project solves the challenge of:
- Creating a complex, component-based desktop experience in a web environment
- Demonstrating modern React architectural patterns
- Providing a portable, web-accessible toolset
- Showcasing state management with multi-windowed UI
- Acting as a security/architecture case study (undergone multiple security audits and remediations)
HOW - The architecture uses:
- State Management: React Context + useReducer pattern (useOSStore hook) for global OS state
- File System: VFS hook (useFileSystem) with ID-based node references, persisted to localStorage with zod validation
- Window Manager: Custom z-index stacking with bounds checking (max 2147483647)
- Code Splitting: React.lazy() + Suspense for 54 apps
- Security: Hardened math evaluator (safeEval), DOMPurify-based HTML sanitization, runtime schema validation
- Build: TypeScript strict mode, Vite 7, noUnusedLocals/noUnusedParameters enforcement
- Styling: Tailwind CSS 3.4, Shadcn UI primitives, Lucide React icons (named imports only)
Key architectural patterns:
1. App registration pattern: Component → Registry → Router
2. Hook-based service layer: useOS, useFileSystem for global state/FS
3. Standardized window shell: WindowFrame provides chrome for all apps
4. Schema-validated persistence: zod for all localStorage reads
5. Pured reducers: Side effects moved to useEffect
Project Stages (from plan.md):
- Stage 1-2: Architecture setup, shell, window manager
- Stage 3-8: Apps built in 5 batches
- Stage 9: Build & deploy
Audit/Risk Posture:
The project has undergone multiple security audits (dpsk-2, kilo-1, mimo2, kimi2) with documented remediations including:
- Eliminating eval/Function() for math (use safeEval shunting-yard parser)
- Sanitizing all dangerouslySetInnerHTML
- Adding zod validation for all localStorage reads
- Bounding z-index to prevent overflow
- Capping factorial computation to prevent OOM
- Limiting regex exec iterations to prevent ReDoS
- Adding ARIA attributes for accessibility
- Splitting bundle with React.lazy
Let me provide a concise summary of the project understanding to the user. I should structure this clearly with WHAT, WHY, and HOW.
I have completed a meticulous review of all four documents. Here is a synthesized understanding of the project.
Project Understanding: UbuntuOS Web
WHAT
A web-based replica of the Ubuntu Linux desktop environment — a single-page application running entirely in the browser. It delivers a fully interactive multi-windowed desktop with:
- 54 functional applications across 7 categories (System, Productivity, Internet, Media, Games, DevTools, Creative)
- A custom window manager with drag/resize/minimize/maximize/close/z-index stacking
- A virtual file system (VFS) persisted to localStorage
- Boot/login animations, dock, system tray, notifications, context menus, alt-tab
- A standardized WindowFrame shell that all apps render inside
Tech stack (README §Tech Stack):
- React 19.2.0, TypeScript 5.9.3, Vite 7.2, Tailwind CSS 3.4.19
- Radix UI / Shadcn primitives, Lucide React 0.562.0 icons
- DOMPurify 3.4.7 (XSS sanitization), Zod 4.3.5 (runtime validation)
- Vitest 4.x for tests (62 tests across 9 files per README)
WHY
1. Demonstrate complex React architecture — multi-window UI with custom z-index stacking, ID-based VFS, and Context+Reducer state management (README §Overview).
2. Showcase portable, web-accessible tooling — packaged as a static site, no backend required.
3. Act as a security/architecture case study — has undergone at least 4 documented audit/remediation cycles (dpsk-2 2026-06-02 & 2026-06-03, kilo-1 2026-06-04, mimo2, kimi2). Security is treated as a first-class concern: safeEval, sanitizeHtml, safeJsonParse, storageValidation are all non-negotiable utilities.
4. Serve as a self-documenting codebase for AI agents — AGENTS.md is explicitly a "high-signal technical context" briefing focused on non-obvious patterns, state-management quirks, and hard-earned lessons.
HOW — Architecture & Codebase Design
Three layers of state:
1. OS Store (src/hooks/useOSStore.tsx): Global OS state via React Context + useReducer (~350 lines, monolith flagged for future split). Actions like OPEN_WINDOW, FOCUS_WINDOW, MINIMIZE_WINDOW, CLOSE_WINDOW, CASCADE_WINDOWS, MINIMIZE_ALL, END_ALT_TAB, desktop icon CRUD, notifications, context menu, theme, alt-tab.
2. VFS (src/hooks/useFileSystem.ts): ID-based node graph, path normalization, FILE_ASSOCIATIONS mapping extensions to appId+icons, persisted to localStorage key ubuntuos_filesystem_v2.
3. App-local state: Each app owns its own useState/useReducer, communicating via useOS or the VFS (not local props).
Key architectural patterns (from AGENTS.md):
- App registration: Component in src/apps/YourApp.tsx → registry entry in src/apps/registry.ts → router entry in src/apps/AppRouter.tsx → optional desktop icon in defaultDesktopIcons.
- Lazy loading: React.lazy() + Suspense split all 54 apps into individual chunks; NotImplemented is the only non-lazy fallback. Initial shell ~360 KB (down from ~1 MB).
- Shared DynamicIcon: Single component replacing 8 duplicate inline implementations.
- Pure reducers: Side effects (e.g., localStorage.setItem for desktop icons) extracted from osReducer into useEffect in OSProvider.
- Versioned persistence: VFS uses _v2 key; legacy key supported for migration only.
Security posture (mandatory, AGENTS.md §Security Reminders):
- eval() / new Function() / Function() forbidden — math must use safeEval(expr): number (shunting-yard parser, allows 0-9.+-*/^() and whitespace).
- dangerouslySetInnerHTML must be wrapped in sanitizeHtml() from @/utils/sanitizeHtml; markdown uses sanitizeMarkdownHtml(); prefer React components (e.g., <mark> for regex highlighting — RegexTester was refactored away from raw HTML).
- All localStorage reads validated with zod: OS-level via validateDesktopIcons() / validateFileSystem(); app-level via safeJsonParse(raw, schema, fallback).
- ReDoS guard: MAX_EXEC_ITERATIONS = 1000 for any user-supplied regex.
- Memory-exhaustion guard: factorial capped at 170; any array-from-user-input must be capped.
- Lucide React: named imports only; only DynamicIcon.tsx is allowed a wildcard import (resolves at runtime). Wildcard import = ~587 KB bundle bloat.
Build hygiene invariants:
- tsconfig.app.json enforces noUnusedLocals: true and noUnusedParameters: true — any dead import breaks npm run build (43 TS6133 errors were fixed on 2026-06-02 across 16 files).
- TypeScript strict mode; no any.
- Tailwind design tokens in index.css; Shadcn primitives in src/components/ui.
- GlobalErrorBoundary wraps both AppShell and each AppRouter to prevent one app crash from killing the OS.
Window manager invariants (AGENTS.md §Troubleshooting):
- Z-index capped at 2147483647 in OPEN_WINDOW, FOCUS_WINDOW, END_ALT_TAB, CASCADE_WINDOWS.
- MINIMIZE_WINDOW / CLOSE_WINDOW must handle activeWindowId === null (visible-windows-length guard).
- MINIMIZE_ALL must capture prevPosition / prevSize like MINIMIZE_WINDOW (regression fixed 2026-06-02).
- New windows cascade with a 30 px offset via the createWindow helper.
- RESTORE_WINDOW falls back to current position/size if prevPosition/prevSize are absent.
Testing reality (README §Known Issues, AGENTS.md §Testing):
- Utility tests pass (relative imports).
- Component-rendering tests using @/ aliases fail in vitest due to alias resolution.
- Workaround: source-level tests read component files as strings and assert on attribute presence (e.g., aria-attributes.test.ts, 14 tests).
- safeEval has 24 cases; TDD was effective for security-critical utilities.
Origin/roadmap (plan.md):
- The original plan targeted "50+ apps" with 9 staged delivery batches (Stage 1: architecture, Stage 2: shell/WM, Stages 3–8: app batches, Stage 9: build/deploy).
- The plan lists React 18 + Framer Motion + date-fns; the actual shipped stack is React 19.2 (no Framer Motion/date-fns mentioned in README tech table).
- Some planned apps were never built (Document Viewer, FTP Client, Icon Viewer, Font Viewer, Emoji Picker, Screenshot Tool, Weather App, Disk Usage Analyzer, Network Scanner, Fortune Teller, Binary Clock) — these likely route to NotImplemented and explain why that fallback exists.
Documentation posture (CLAUDE.md §Lessons, AGENTS.md §Lessons):
The codebase treats documentation drift as a first-class concern. Key meta-lessons:
- "Documentation line counts drift" — osReducer was "499-line" in older docs, actually ~350; prefer relative descriptions.
- "Third-party audit findings must be independently validated" — the kilo-1 audit had ~33% error rate on CRITICAL/HIGH findings.
- "Source-level tests as valid alternative" — when infrastructure blocks component rendering, read source strings and assert on attributes.
I have enough context to act as a file-search specialist for any follow-up task on this codebase (e.g., locating a specific file, grepping for a pattern, or auditing a specific subsystem like window state, VFS persistence, or a particular app).

