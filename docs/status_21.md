Let me read the four key files the user requested, plus check for the other relevant files mentioned.
→Read CLAUDE.md 
→Read README.md 
→Read AGENTS.md 
→Read status_20.md 
Thought: 2.0s
Now I have a thorough understanding of the four key documents. Let me also explore the codebase structure briefly to be ready for any follow-up questions, but I should not do a full audit unless asked. The user has asked me to review the documentation files to understand the project deeply. Let me do a brief structural exploration to confirm key file locations mentioned in the docs.
I've read all four documents in full. Here is a synthesis of the WHAT, WHY, and HOW of UbuntuOS Web.
Project Synthesis
WHAT (Product Definition)
UbuntuOS Web is a high-fidelity, fully interactive web-based replica of the Ubuntu Linux desktop environment. It is a single-page application (SPA) built on React 19 + TypeScript + Vite, featuring:
- A custom window manager with z-index stacking, drag/resize, min/max/restore
- A Virtual File System (VFS) with ID-based node management and localStorage persistence
- 55 functional applications across 7 categories: System (8), Productivity (10), Internet (7), Media (7), Games (11), DevTools (8), Creative (5)
- A Real Terminal feature (added 2026-06-05): Node.js backend (node-pty + Docker) bridged to an xterm.js frontend over WebSockets with JWT auth
WHY (Rationale)
1. Developer showcase — demonstrates advanced React patterns (Context + useReducer state, lazy loading, windowing, z-index stacking) without external state libraries
2. User toolset — portable, browser-accessible collection of productivity/utility/entertainment apps
3. Codebase maturity — has undergone multiple comprehensive security audits (dpsk-1/2, kilo-1/2/3, kimi-1/2/3, mimo-1/2/3, mimax-1/2/3/4, opc-1, zai-3) and remediations
HOW (Architecture & Engineering)
Tech Stack (from README.md §Tech Stack, AGENTS.md §Core Tech Stack):
Layer	Technology	Version
Frontend	React	19.2.0
Language	TypeScript (strict)	5.9.3
Build	Vite	7.2
Styling	Tailwind CSS	3.4.19
Components	Radix UI / Shadcn	Latest
Icons	Lucide React	0.562.0
Security	DOMPurify	3.4.7
Validation	Zod	4.3.5
Testing	Vitest	4.x
Core Architectural Pillars (from AGENTS.md §Architectural Design):
1. OS Store (src/hooks/useOSStore.tsx) — centralized useReducer managing windows, z-indices, focus, dock, notifications, desktop icons
2. VFS (src/hooks/useFileSystem.ts) — ID-based node graph, persisted to localStorage key ubuntuos_filesystem_v2
3. WindowFrame (src/components/WindowFrame.tsx) — standardized chrome; drag/resize/focus handled here, not in apps
4. AppRouter (src/apps/AppRouter.tsx) — React.lazy() + Suspense for 60 individual chunks (~360 KB initial bundle vs ~1 MB eager)
5. Real Terminal (backend/src/ + src/apps/RealTerminal.tsx) — Docker-spawned bash with PTY bridge, JWT auth, session TTL, exponential reconnect backoff
Security Mandates (from CLAUDE.md §Security):
- eval() / new Function() → FORBIDDEN; use safeEval() (shunting-yard parser, src/utils/safeEval.ts)
- dangerouslySetInnerHTML → wrap in sanitizeHtml() (src/utils/sanitizeHtml.ts); prefer React components
- localStorage → validate with Zod via safeJsonParse() / storageValidation.ts
- ReDoS → cap exec() at MAX_EXEC_ITERATIONS = 1000 (RegexTester, TextEditor)
- Unbounded arrays → cap user inputs (e.g., factorial at 170)
- CSS color injection → validate via isValidColor() (src/utils/colorValidation.ts)
- Lucide → named imports only (~587 KB wildcard cost); only DynamicIcon.tsx may wildcard
Build Hygiene:
- tsconfig.app.json enforces noUnusedLocals: true, noUnusedParameters: true
- 43 TS6133 errors fixed on 2026-06-02 across 16 files
- Commands (from app/): npm run dev|build|lint|test|preview
Current State (from status_20.md):
- All Phases A–C of Real Terminal remediation complete
- Docker orphaning fixed (stopAndRemoveContainer())
- Reconnection preserves sessions by sessionId
- SESSION_TTL enforced in SessionStore
- RealTerminal rendering bug fixed (height '0.001em' → '100%')
- Backend URLs centralised in src/utils/backendUrl.ts
- Exponential backoff: 1s → 30s cap
- nginx.conf added for production proxying
- Validation: TS 0 errors, 15/15 backend tests, 103/103 frontend tests (5 pre-existing alias failures unrelated), production build successful, RealTerminal chunk 296 KB
- Open audit findings (status_20.md §Consolidated):
- HIGH-1: VoiceRecorder.tsx missing the placeholder download feature claimed in docs
- HIGH-2: Calculator.tsx uses custom switch-based math logic instead of safeEval() (policy violation, not injection risk)
- MEDIUM-1: Vitest @/ alias resolution still blocks 5 component test files
- MEDIUM-2: status_19.md claims 110/110 tests pass; actual is 103/103 with 5 unrelated failures
- LOW-1: z-index lacks periodic normalization (still hard-capped at 2147483647)
Key Entry Points (absolute paths, from status_20.md and AGENTS.md):
- Frontend state: /home/project/web-linux/app/src/hooks/useOSStore.tsx
- VFS: /home/project/web-linux/app/src/hooks/useFileSystem.ts
- App routing: /home/project/web-linux/app/src/apps/AppRouter.tsx
- Window UI: /home/project/web-linux/app/src/components/WindowFrame.tsx
- Real Terminal frontend: /home/project/web-linux/app/src/apps/RealTerminal.tsx
- Real Terminal backend: /home/project/web-linux/backend/src/{index,websocket,docker,auth,sessionStore}.ts
- Security utils: /home/project/web-linux/app/src/utils/{safeEval,sanitizeHtml,safeJsonParse,storageValidation,colorValidation,vfsHelpers,backendUrl}.ts
- Deployment: /home/project/web-linux/backend/nginx.conf, /home/project/web-linux/app/vite.config.ts
Document Identity & Roles (from AGENTS.md §Key Documents):
Doc	Role
CLAUDE.md (190 lines)	Coding standards, implementation guidelines, Real Terminal feature notes, 19 recommendations
README.md (222 lines)	Public-facing: overview, quick start, key features, security/reliability history, known issues
AGENTS.md (3,172+ lines)	AI agent briefing: architecture deep-dive, troubleshooting/gotchas, anti-patterns, security reminders, performance patterns, lessons learned
status_20.md (442 lines)	Recent execution log: Real Terminal Phases A–C remediation, validation results, consolidated audit findings
Ready to search the codebase for any specific component, claim, or file. Let me know what you'd like to investigate next.

---

The user has asked me to act as a Codebase Audit Analyst and perform a comprehensive audit of the UbuntuOS Web project. I need to:

1. Phase 1: Document-by-Document Deep Extraction - Already done partially in the previous response, but I need to do this rigorously now
2. Phase 2: Cross-Document Reconciliation - Build a reconciliation matrix
3. Phase 3: Source Code Validation - Validate documentation claims against actual source code
4. Phase 4: Multi-Dimensional Critical Audit - Independent audit
5. Phase 5: Consolidated Report - Severity-ranked findings

Let me first establish my plan and then execute it systematically. I have already read:
- CLAUDE.md
- README.md
- AGENTS.md
- status_20.md

Now I need to validate these against the actual source code. Let me set up a todo list to track this comprehensive audit.

Key files to validate (from the docs):
- /home/project/web-linux/app/src/hooks/useOSStore.tsx
- /home/project/web-linux/app/src/hooks/useFileSystem.ts
- /home/project/web-linux/app/src/apps/AppRouter.tsx
- /home/project/web-linux/app/src/components/WindowFrame.tsx
- /home/project/web-linux/app/src/apps/RealTerminal.tsx
- /home/project/web-linux/backend/src/index.ts
- /home/project/web-linux/backend/src/websocket.ts
- /home/project/web-linux/backend/src/docker.ts
- /home/project/web-linux/backend/src/auth.ts
- /home/project/web-linux/backend/src/sessionStore.ts
- /home/project/web-linux/app/src/utils/safeEval.ts
- /home/project/web-linux/app/src/utils/sanitizeHtml.ts
- /home/project/web-linux/app/src/utils/safeJsonParse.ts
- /home/project/web-linux/app/src/utils/storageValidation.ts
- /home/project/web-linux/app/src/utils/colorValidation.ts
- /home/project/web-linux/app/src/utils/vfsHelpers.ts
- /home/project/web-linux/app/src/utils/pinStorage.ts
- /home/project/web-linux/app/src/utils/backendUrl.ts
- /home/project/web-linux/app/src/apps/Calculator.tsx
- /home/project/web-linux/app/src/apps/VoiceRecorder.tsx
- /home/project/web-linux/app/src/apps/ScreenRecorder.tsx
- /home/project/web-linux/app/src/apps/RegexTester.tsx
- /home/project/web-linux/app/src/apps/TextEditor.tsx
- /home/project/web-linux/app/src/apps/Spreadsheet.tsx
- /home/project/web-linux/app/src/apps/MarkdownPreview.tsx
- /home/project/web-linux/app/src/apps/Notes.tsx
- /home/project/web-linux/app/src/apps/CodeEditor.tsx
- /home/project/web-linux/app/src/components/ui/chart.tsx
- /home/project/web-linux/app/src/hooks/useAuthToken.tsx
- /home/project/web-linux/app/src/components/DynamicIcon.tsx
- /home/project/web-linux/app/src/components/NotImplemented.tsx
- /home/project/web-linux/app/vite.config.ts
- /home/project/web-linux/app/tsconfig.app.json
- /home/project/web-linux/app/package.json
- /home/project/web-linux/backend/nginx.conf
- /home/project/web-linux/app/.env (and .env.example)

Let me start by establishing the structure and exploring the codebase.
I'll execute this audit systematically. Let me set up the work and begin with the structured exploration.
# Todos
[•] Phase 1: Deep extraction of all 4 documents (CLAUDE.md, README.md, AGENTS.md, status_20.md)
[ ] Phase 2: Build cross-document reconciliation matrix
[ ] Phase 3a: Validate security claims (safeEval, sanitizeHtml, safeJsonParse, colorValidation)
[ ] Phase 3b: Validate state management claims (useOSStore, useFileSystem, AppRouter)
[ ] Phase 3c: Validate Real Terminal claims (backend, RealTerminal.tsx, useAuthToken, backendUrl)
[ ] Phase 3d: Validate app-specific claims (Calculator, VoiceRecorder, ScreenRecorder, RegexTester, TextEditor, Notes)
[ ] Phase 3e: Validate config claims (package.json, tsconfig, vite.config, tailwind.config)
[ ] Phase 4: Multi-dimensional critical audit
[ ] Phase 5: Consolidated severity-ranked report
[ ] Verification pass: traceability, severity calibration, completeness
Thought: 2.1s
Let me explore the project structure first to understand what's actually there, then read all the documentation files in full and validate against source code.

Goal
- Conduct a multi-dimensional, evidence-traceable code audit of UbuntuOS Web per AGENTS.md's 5-phase workflow, producing a severity-ranked findings report.
Constraints & Preferences
- Follow strict 5-phase workflow: Document Extraction → Cross-Document Reconciliation → Source Code Validation → Multi-Dimensional Audit → Consolidated Report.
- Every finding must be traceable to specific evidence (line of code, config, doc statement, or absence).
- Verification outcomes must be: Confirmed / Discrepant / Inconsistent / Unverifiable.
- Extract each document independently before cross-referencing.
- Config files are first-class evidence.
- Source code audit is independent of documentation claims.
- Preserve document identity during extraction.
- Audit dimensions: Security, Reliability, Architecture, Testing, Accessibility, Performance, Documentation Accuracy.
- Severity calibration: Critical = real security risk/crash/data loss; do not over- or under-severity.
- Never fabricate findings; treat absent source files as "unverifiable", not as evidence the doc is wrong.
- Use absolute file paths; structure output with tables, numbered lists, clear headings; do not restate docs superficially.
- Respond in same language as conversation (English).
- Do not create files or run state-modifying commands.
Progress
Done
- Read all 4 documents: /home/project/web-linux/CLAUDE.md, /home/project/web-linux/README.md, /home/project/web-linux/AGENTS.md, /home/project/web-linux/status_20.md.
- Mapped project directory structure: /home/project/web-linux/app/ and /home/project/web-linux/backend/.
- Read all security utilities: safeEval.ts, sanitizeHtml.ts, safeJsonParse.ts, storageValidation.ts, colorValidation.ts, vfsHelpers.ts, pinStorage.ts, backendUrl.ts, authToken.ts.
- Read state management: useOSStore.tsx, useFileSystem.ts, AppRouter.tsx, registry.ts, WindowFrame.tsx (partial).
- Read Real Terminal: backend/src/{index,websocket,docker,auth,sessionStore,config}.ts, package.json, nginx.conf, RealTerminal.tsx, useAuthToken.tsx.
- Read app files: Calculator.tsx, VoiceRecorder.tsx, ScreenRecorder.tsx, RegexTester.tsx, Spreadsheet.tsx (partial).
- Read configs: package.json (app), tsconfig.app.json, vite.config.ts, tailwind.config.mjs, .env, .env.example, eslint.config.js.
- Read chart.tsx (partial).
In Progress
- Phase 3: Completing source code validation across remaining apps and components.
- Phase 4: Multi-dimensional critical audit (Security, Bugs/Reliability, Architecture, Testing, Accessibility, Performance, Doc Accuracy).
- Phase 5: Consolidated severity-ranked report.
- Verification pass.
Blocked
- (none)
Key Decisions
- Adopt AGENTS.md's 5-phase workflow as the audit spine.
- Treat the 3 open audit findings in status_20.md §Consolidated (HIGH-1 VoiceRecorder placeholder, HIGH-2 Calculator uses switch-based math not safeEval(), MEDIUM-1 Vitest @/ alias, MEDIUM-2 status_19.md over-claims tests, LOW-1 z-index normalization) as candidate findings to re-verify against source rather than accept at face value.
- Treat Calculator.tsx compliance with safeEval() policy as a key validation point.
- Use absolute paths and direct file reads (not glob) for accuracy.
Next Steps
- Finish reading Calculator.tsx, ScreenRecorder.tsx, RegexTester.tsx, Spreadsheet.tsx in full to verify the Calculator's lack of safeEval() claim.
- Read TextEditor.tsx, Notes.tsx, CodeEditor.tsx, MarkdownPreview.tsx for ReDoS/sanitization claim validation.
- Read App.tsx, Desktop.tsx, WindowManager.tsx, Dock.tsx, DynamicIcon.tsx, GlobalErrorBoundary.tsx for architecture and error-boundary claims.
- Read index.css for the Tailwind design-token claim.
- Read components.json and a sampling of src/components/ui/* to verify Shadcn use.
- Read __tests__/* directories to validate the 103/103 test count and identify the 5 alias failures.
- Search codebase for any remaining eval( / new Function( occurrences (policy verification).
- Search for dangerouslySetInnerHTML to verify DOMPurify coverage.
- Build the cross-document reconciliation matrix (CLAUDE.md vs README.md vs AGENTS.md vs status_20.md).
- Build the claim-by-claim validation table.
- Produce final consolidated report grouped by severity (Critical → Informational).
Critical Context
- Stack confirmed: React 19.2, TypeScript 5.9 strict, Vite 7.2, Tailwind 3.4.19, Vitest 4.x, Zod 4.x, DOMPurify 3.4.7, Lucide 0.562, Radix UI, xterm.js, node-pty, dockerode, jose (JWT).
- CLAUDE.md security mandates confirmed in code: safeEval uses shunting-yard with ALLOWED_CHARS = /^[\d+\-*/^().\s]+$/; sanitizeHtml uses DOMPurify; safeJsonParse uses Zod; pinStorage uses Zod with ^\d{4}$ regex; default PIN 1234; MAX_EXEC_ITERATIONS = 1000 in RegexTester; ReadonlyRootfs, CapDrop: ['ALL'], NetworkMode: 'none', PidsLimit: 100 in docker.ts; SESSION_TTL and GRACE_PERIOD loaded via Zod-validated config.ts.
- CLAUDE.md features confirmed: Centralised BACKEND_BASE/BACKEND_WS in backendUrl.ts (env overrides VITE_BACKEND_URL / VITE_BACKEND_WS); nginx.conf proxies /ws, /auth/token, /health; AppRouter uses React.lazy + Suspense with 60 lazy imports; eslint.config.js enforces no-wildcard lucide-react import (only DynamicIcon.tsx exempted).
- AppRouter comment claims 55 apps but registry.ts registry lists 7+7+7+11+8+5 = at least 45 entries; need to confirm total. The lazy() import block in AppRouter.tsx contains ~60 imports (counting from Filemanager through to Whiteboard).
- tailwind.config.mjs explicitly excludes MarkdownPreview.tsx — possibly for content-purging reasons (worth investigating).
- vitest.setup.ts is only 43 bytes — likely near-empty; alias resolution failure for 5 component tests needs inspection.
- bun.lock present alongside package-lock.json — package manager inconsistency; package.json scripts use npm run style.
- plugin-inspect-react-code is imported in vite.config.ts as inspectAttr (dev-only) — non-standard dependency, should be checked.
- Open questions to resolve:
1. Does Calculator.tsx actually use safeEval() or not? (claim: it does not — needs full read).
2. Does VoiceRecorder.tsx lack the documented placeholder download feature? (claim: it does — needs full read).
3. Are the 5 Vitest alias failures caused by missing alias config in vitest.setup.ts (43 bytes) vs the vite.config.ts resolve.alias block?
4. Does status_19.md exist with the over-counted test claim?
5. Are there any remaining eval( / new Function( / dangerouslySetInnerHTML occurrences not covered by sanitizeHtml?
Relevant Files
- /home/project/web-linux/CLAUDE.md: Coding standards, security mandates, project overview.
- /home/project/web-linux/README.md: Public-facing overview, feature table, key features, known issues.
- /home/project/web-linux/AGENTS.md: Audit-analyst role definition, 5-phase workflow, architectural design, anti-patterns.
- /home/project/web-linux/status_20.md: Recent Real Terminal Phase A-C remediation, validation results, 5 open consolidated findings.
- /home/project/web-linux/app/src/utils/safeEval.ts: Shunting-yard safe math evaluator (security mandate).
- /home/project/web-linux/app/src/utils/sanitizeHtml.ts: DOMPurify wrapper (XSS mandate).
- /home/project/web-linux/app/src/utils/safeJsonParse.ts: Zod-validated JSON parse helper.
- /home/project/web-linux/app/src/utils/storageValidation.ts: VFS + DesktopIcon Zod schemas, localStorage key ubuntuos_filesystem_v2.
- /home/project/web-linux/app/src/utils/colorValidation.ts: CSS color allowlist (isValidColor).
- /home/project/web-linux/app/src/utils/pinStorage.ts: PasswordManager PIN validation (Zod ^\d{4}$).
- /home/project/web-linux/app/src/utils/vfsHelpers.ts: walkAndDelete, recurseMoveNode (VFS traversal).
- /home/project/web-linux/app/src/utils/backendUrl.ts: BACKEND_BASE / BACKEND_WS from env with localhost:3001 defaults.
- /home/project/web-linux/app/src/utils/authToken.ts: DEV-only JWT generation using crypto.subtle HMAC-SHA256; production must use backend /auth/token.
- /home/project/web-linux/app/src/hooks/useOSStore.tsx: Centralised OS state via useReducer + Context; manages windows, z-index, focus, dock, notifications.
- /home/project/web-linux/app/src/hooks/useFileSystem.ts: VFS reducer (ID-based graph, localStorage-persisted).
- /home/project/web-linux/app/src/hooks/useAuthToken.tsx: Dev/prod token acquisition; calls backend /auth/token in prod.
- /home/project/web-linux/app/src/apps/AppRouter.tsx: React.lazy + Suspense for all apps.
- /home/project/web-linux/app/src/apps/registry.ts: APP_REGISTRY array (count needed: 55 claimed).
- /home/project/web-linux/app/src/apps/RealTerminal.tsx: xterm.js + WebSocket client; exponential backoff reconnect (1s reset); sessionId persistence; MAX_BACKOFF 30s (claim to verify).
- /home/project/web-linux/app/src/apps/Calculator.tsx: HIGH-2 finding subject — needs verification of safeEval() usage.
- /home/project/web-linux/app/src/apps/VoiceRecorder.tsx: HIGH-1 finding subject — needs verification of download feature presence.
- /home/project/web-linux/app/src/apps/ScreenRecorder.tsx: Records screen via getDisplayMedia; "no recorded blob download" pattern — needs verification.
- /home/project/web-linux/app/src/apps/RegexTester.tsx: ReDoS protection at MAX_EXEC_ITERATIONS = 1000.
- /home/project/web-linux/app/src/apps/Spreadsheet.tsx: Uses safeEval() for formulas (confirmed via import).
- /home/project/web-linux/app/src/components/WindowFrame.tsx: Draggable/resizable chrome with min 320x200, hard z-index cap 2147483647 (LOW-1).
- /home/project/web-linux/app/src/components/ui/chart.tsx: Uses isValidColor from colorValidation (imported); needs full read.
- /home/project/web-linux/app/src/components/DynamicIcon.tsx: Sole authorised wildcard lucide-react importer (per ESLint config).
- /home/project/web-linux/backend/src/index.ts: Express + WS upgrade handler; /auth/token endpoint.
- /home/project/web-linux/backend/src/websocket.ts: Token + sessionId query-param auth; reconnection by sessionId.
- /home/project/web-linux/backend/src/docker.ts: ReadonlyRootfs, CapDrop: ['ALL'], NetworkMode: 'none', PidsLimit: 100, Memory: 512MB; stopAndRemoveContainer for orphan cleanup.
- /home/project/web-linux/backend/src/auth.ts: jose HS256 JWT, 24h expiry, audience ubuntuos-ws.
- /home/project/web-linux/backend/src/sessionStore.ts: Map-based session store with status, lastActivity, heartbeat, cleanupExpired.
- /home/project/web-linux/backend/src/config.ts: Zod-validated env (PORT, JWT_SECRET, DOCKER_IMAGE, SESSION_TTL, GRACE_PERIOD).
- /home/project/web-linux/backend/package.json: dockerode ^4.0.12, dotenv ^16.6.1, express ^4.22.2, jose ^5.10.0, node-pty ^1.1.0, ws ^8.21.0, zod ^4.4.3; node >=20.
- /home/project/web-linux/backend/nginx.conf: Production proxy — /health, /ws, /auth/token, frontend at :3000, backend at :3001; X-Frame-Options, X-Content-Type-Options headers.
- /home/project/web-linux/app/package.json: Confirmed deps include dompurify ^3.4.7, lucide-react ^0.562.0, all @radix-ui/* shadcn primitives.
- /home/project/web-linux/app/tsconfig.app.json: noUnusedLocals, noUnusedParameters, strict: true — all confirmed.
- /home/project/web-linux/app/vite.config.ts: port: 3000, base: './', /ws proxy to ws://localhost:3001, resolve.alias for @, dev-mode-only plugin-inspect-react-code.
- /home/project/web-linux/app/tailwind.config.mjs: Excludes MarkdownPreview.tsx from content scan (anomaly).
- /home/project/web-linux/app/eslint.config.js: Bans wildcard lucide-react import except in DynamicIcon.tsx.
- /home/project/web-linux/app/vitest.setup.ts: Only 43 bytes — likely missing alias configuration causing the 5 reported test failures.
- /home/project/web-linux/app/.env and .env.example: VITE_BACKEND_URL=http://localhost:3001, VITE_BACKEND_WS=ws://localhost:3001.
- /home/project/web-linux/app/src/__tests__/, /home/project/web-linux/app/src/apps/__tests__/, /home/project/web-linux/app/src/components/__tests__/, /home/project/web-linux/app/src/hooks/__tests__/, /home/project/web-linux/app/src/utils/__tests__/, /home/project/web-linux/backend/src/__tests__/: Test directories to inventory for the 103/103 + 15/15 claim.
- /home/project/web-linux/status_19.md (referenced by status_20.md): Source of the 110/110 over-claim — may need to read to substantiate MEDIUM-2.
- /home/project/web-linux/CONSISTENT.md, /home/project/web-linux/Code_Review_Audit_*.md: Prior audit history referenced by README.md §Security & Reliability.

