# UbuntuOS Web

<img width="931" height="689" alt="UbuntuOS Web Desktop" src="https://github.com/user-attachments/assets/f6d4911a-438c-4db2-9372-6e844f238e20" />

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, high-fidelity web-based replica of the Ubuntu Linux desktop environment. This project delivers a fully interactive experience in the browser, featuring a window manager, virtual file system, and 56 functional applications (including a real terminal).

## 🌟 Overview

UbuntuOS Web solves the challenge of creating a complex, component-based desktop experience in a web environment. It demonstrates the power of modern React by managing a multi-windowed UI with a custom z-index stacking system and a virtualized file system (VFS) that persists data locally.

Built for developers as a showcase of architectural patterns and for users as a portable, web-accessible toolset.

## 🚀 Key Features

| Category | Apps | Highlights |
| :--- | :--- | :--- |
| **📁 System** | 8 Apps | Terminal (simulated + real bash), File Manager, System Monitor, Settings |
| **📝 Productivity** | 10 Apps | Calendar, Spreadsheet, Todo List, Password Manager, Whiteboard |
| **🌐 Internet** | 7 Apps | Tabbed Browser, Email Client, Chat, RSS Reader, Network Tools |
| **🎬 Media** | 7 Apps | Video/Music Players, Photo Editor, Screen/Voice Recorders |
| **🎮 Games** | 11 Apps | Chess (AI), Tetris, Minesweeper, Solitaire, 2048, Sudoku |
| **🛠️ DevTools** | 8 Apps | Code Editor, Git Client, JSON Formatter, Regex Tester, API Tester |
| **🎨 Creative** | 5 Apps | Drawing, Image Gallery, Color Picker, ASCII Art, Matrix Rain |

### Codebase Audit Remediation (2026-06-04)
- **Registered matrixrain app in registry.ts**: The Matrix Rain app was routed in `AppRouter.tsx` but not registered in `registry.ts`, preventing it from appearing in the app launcher. Added proper registry entry with metadata.
- **Fixed GEMINI.md app count inconsistency**: Corrected internal inconsistency where line 7 said "55 applications" but line 22 said "54 applications". Now consistently states 56.
- **Updated osReducer line count in documentation**: Changed from "approximately 350 lines" to "approximately 375 lines" across all documentation files to match actual reducer function size.
- **Added color validation utility**: Created `src/utils/colorValidation.ts` to validate CSS color strings before injection, preventing potential CSS injection attacks. Integrated into `chart.tsx` to validate color values from `ChartConfig`.
- **Added registry completeness test**: Created `src/apps/__tests__/registry-completeness.test.ts` to automatically verify that all apps routed in `AppRouter.tsx` have corresponding entries in `registry.ts`.
- **Fixed CSS build warning from regex pattern**: Tailwind CSS content scanner was misinterpreting the regex pattern in `MarkdownPreview.tsx` as a CSS class selector. Fixed by excluding the file from Tailwind scanning in `tailwind.config.mjs`.

## 🛡️ Recent Security & Reliability Improvements

This codebase has undergone multiple comprehensive security audits and remediations. Key fixes include:

### Audit Remediation (2026-06-07)
- **Implemented Phase 3 Security Infrastructure for Real Terminal**: Created and integrated `types.ts`, `policy.ts`, and `logger.ts` into the backend WebSocket handler. Commands are now filtered against a configurable denylist (e.g., `rm -rf /`, fork bombs, privilege escalation), and all commands are written to an audit log.
- **Fixed critical session management bug**: `websocket.ts` previously called `disconnect()` during connection setup, causing immediate session expiration. Moved to the `close` event handler to keep sessions alive during active connections.
- **Implemented real ScreenRecorder**: Replaced placeholder `.txt` downloads with a real `getDisplayMedia` + `MediaRecorder` implementation for `.webm` downloads.
- **Added client heartbeat for Real Terminal**: `RealTerminal.tsx` now sends a heartbeat every 30 seconds to keep sessions alive, matching the server's heartbeat handler.
- **Added MINIMIZE_ALL test coverage**: New test file validates that `prevPosition` and `prevSize` are correctly captured.
- **Stale comment fixes**: Updated `AppRouter.tsx` and `registry.ts` to correctly reference 56 apps.

### mimax-8 Code Review Audit & Remediation (2026-06-07)
- **Fixed `npm run build` failure (CRITICAL)**: Removed unused shadcn components (`toggle-group.tsx`, `calendar.tsx`, `sidebar.tsx`) that contained Tailwind v4 syntax incompatible with lightningcss. Production build now passes cleanly.
- **Fixed `.env` tracked in git (CRITICAL)**: Added `.env` to both root and `app/.gitignore` to prevent accidental secret leakage. `app/.env` stays locally but is no longer tracked.
- **Removed JWT secret fallback (CRITICAL)**: Backend `auth.ts` previously had a hardcoded dev secret fallback (`?? 'ubuntuos-dev-secret-change-me'`). Now throws `JwtSecretMissingError` when `JWT_SECRET` is unset, eliminating a silent security downgrade.
- **Added `fsEvents` typed event bus (HIGH)**: Created `src/utils/fsEvents.ts` to replace the silent `try/catch { /* ignore */ }` anti-pattern in `useFileSystem.ts`. QuotaExceededErrors and other save failures now emit typed events that the OSProvider subscribes to, surfacing user-visible notifications instead of silently dropping data.
- **Fixed `index.html` title (LOW)**: Changed `<title>LinuxOS</title>` to `<title>UbuntuOS Web</title>` for brand consistency.
- **Installed `@testing-library/dom`** (INFRA): Resolved missing peer dependency that caused `VoiceRecorder.test.tsx` and `NotImplemented.test.tsx` to fail.
- **Added backend rate limiting (CRITICAL)**: Installed `express-rate-limit` in the backend. `POST /auth/token` now enforces 5 requests per 15 minutes per IP, preventing brute-force token generation.
- **Fixed Spreadsheet cell-reference validation (HIGH)**: Added `isValidCellRef()` helper in `Spreadsheet.tsx` to validate cell references against the `COLS` array (A–T) before evaluation, preventing out-of-bounds errors.
- **Added Spreadsheet formula recursion cap (HIGH)**: `evaluateCell` now tracks recursion depth with `MAX_DEPTH = 100`, returning `#DEPTH!` for overly long chains instead of causing stack overflow.

### Audit Remediation (2026-06-06)
- **Added zod validation to game highscore stores**: Snake, Sudoku, Tetris, FlappyBird, Minesweeper, and Game2048 now use `safeJsonParse()` with zod schemas for localStorage reads, replacing raw `parseInt()` calls.
- **Added ARIA labels to FileManager icon-only buttons**: Navigate up, Grid view, List view, New Folder, and New File buttons now have `aria-label` attributes.
- **Added ARIA labels to Settings icon-only buttons**: Toggle component and accent color buttons now have `aria-label` and `aria-pressed` attributes.
- **Added 21 new tests**: 12 tests for game highscore validation pattern, 9 tests for FileManager and Settings ARIA attributes.
- **Fixed README.md test count discrepancy**: Updated from 18 to 19 test files (now 20 with new tests).

### dpsk-2 Phase 2: Accessibility & Documentation (2026-06-03)
- **Added ARIA attributes to core components**: Added `aria-label`, `role`, `tabIndex` to `Dock.tsx`, `WindowFrame.tsx`, and `Desktop.tsx` interactive elements.
- **Added keyboard focus styles**: Global `:focus-visible` and `:focus:not(:focus-visible)` CSS rules in `index.css` for keyboard accessibility.
- **Added automated accessibility source tests**: 14 source-level tests verify ARIA attribute presence in component source files.
- **Added mock data documentation**: Added "simulated data" comments to `Email.tsx` and `RssReader.tsx` to clarify that data is for demo purposes only.
- **Fixed TextEditor.tsx raw JSON.parse**: Was missed in original audit due to `try/catch` wrapper; now uses `safeJsonParse` with zod schema validation.

### kilo-1 Code Review Validation (2026-06-04)
- **Fixed ReDoS in TextEditor find bar**: Added `escapeRegExp()` and `countMatchesSafely()` utilities to prevent catastrophic backtracking from user-controlled search input. Escapes regex special characters and caps iterations at 1000.
- **Fixed stale ContextMenu test**: Updated `ContextMenu-actions.test.tsx` to expect `ARRANGE_ICONS` (not `CASCADE_WINDOWS`), matching the actual source dispatch.

### kimi-3 Code Review Audit & Remediation (2026-06-04)
Key fixes from the comprehensive kimi-3 audit, conducted after the real terminal feature plan validation:
- **Added real-terminal routing**: Registered `real-terminal` appId in `AppRouter.tsx` to route to `<Terminal />`, enabling the coexistence of simulated and real bash terminals.
- **Fixed z-index cap in END_ALT_TAB**: The `END_ALT_TAB` reducer case was incrementing `nextZIndex` without capping it at `2147483647`, which could cause z-index overflow after prolonged use. Fixed to use `Math.min(state.nextZIndex + 1, 2147483647)`.
- **Eliminated remaining raw JSON.parse in Todo.tsx and VoiceRecorder.tsx**: Both apps previously used unvalidated `JSON.parse()` for localStorage reads. Now use `safeJsonParse(raw, schema, fallback)` with zod schemas, aligning with the project's security policy and preventing data corruption crashes.
- **Fixed windowId prop handling**: `Terminal.tsx` now accepts an optional `windowId` prop, and `AppRouter.tsx` passes `windowId` to `<Terminal />` for `real-terminal`. Enables future real terminal coexistence and per-window cleanup.
- **Removed unused `jose` dependency**: The `jose` JWT library was installed for a planned real terminal feature but was unused. Removed to reduce bundle size and attack surface.
- **Updated documentation counts**: App count corrected from 54 to 56 (real-terminal added, later expanded to 56 total apps). Test count updated to 115 tests across 19 test files.

### dpsk-2 Phase 3: VFS Refactor, Security Hardening & Accessibility (2026-06-04)
- **Extracted `walkAndDelete` VFS helper**: Removed duplicated inline `recurseDelete` closures in `deleteNode` and `emptyTrash` within `useFileSystem.ts`. Replaced with a single module-level `walkAndDelete(nodes, nodeId)` function that returns deleted IDs, eliminating ~30 lines of duplication while preserving immutability and trash cleanup behavior.
- **Replaced `Blob` with `TextEncoder` for size calculations**: `createFile` and `writeFile` in `useFileSystem.ts` now use `new TextEncoder().encode(content).length` instead of `new Blob([content]).size`. `TextEncoder` avoids a full Blob allocation, is lighter, and yields identical UTF-8 byte counts.
- **Added legacy localStorage cleanup after migration**: `storageValidation.ts` now removes the legacy `ubuntuos_filesystem` key after successfully migrating data to `ubuntuos_filesystem_v2`, preventing stale data bloat.
- **Fixed mid-file import anti-pattern**: Moved the `validateDesktopIcons` import in `useOSStore.tsx` from its previous position between helper functions up to the top-level imports, aligning with TypeScript/React conventions.
- **Hardened `authToken.ts` against production misuse**: Added an `import.meta.env.DEV` guard to `generateToken()` so it throws in non-development environments. This prevents accidental use of the development-only JWT generator in production.
- **Hardened PasswordManager PIN security (C-2)**:
  - Removed hardcoded `MASTER_PIN = '1234'` constant.
  - Added `storedPin` state backed by `localStorage` (`password_manager_pin`), defaulting to `'1234'` for backward compatibility.
  - Added a "Change PIN" UI in the authenticated view, allowing users to set a custom 4-digit PIN.
  - Added a demo-mode security warning banner: "Demo Mode — passwords are not securely encrypted."
- **Made `Terminal.tsx` `windowId` prop functional (H-1)**: Changed `_props` to destructured `({ windowId })` and included `windowId` in the initial welcome message, fulfilling the prop contract and enabling per-window identification.
- **Added ARIA labels to icon-only buttons (H-2)**: Added `aria-label` attributes to icon-only buttons in `Calculator.tsx` (history toggle, backspace, delete) and `TextEditor.tsx` (zoom in/out, close find, close tab) to improve screen-reader accessibility.
- **Added automated ARIA source-level tests**: Added 7 new source-level tests (`Calculator.tsx` ×3, `TextEditor.tsx` ×4) to `aria-attributes.test.ts`, bringing the suite to 81 tests. These tests verify `aria-label` presence in component source files without requiring full DOM rendering.

### kilo-3 Real Terminal Implementation (2026-06-05)
- **Implemented full-stack bash terminal with PTY support**: Backend Node.js server with WebSocket, Docker container spawning, JWT auth, and PTY bridge via `node-pty`.
- **RealTerminal.tsx**: xterm.js v5 frontend with `ResizeObserver`, WebSocket auto-reconnect, sessionId localStorage persistence (zod-validated), and focus handling via `useOS`.
- **JWT authentication**: Backend `/auth/token` endpoint issues signed JWTs via `jose` library; frontend `useAuthToken` fetches from backend in production, falls back to dev-only generator locally.
- **Docker hardening**: Containers spawned with `--read-only`, `--cap-drop=ALL`, `--network=none`, `-u 1000:1000`, CPU/memory/PID limits.
- **Session persistence**: Disconnect grace period (5 min), heartbeat, auto-reconnect with exponential backoff, cleanup on unmount.
- **Backend URL centralisation**: Created `src/utils/backendUrl.ts` to resolve backend URLs from `import.meta.env` with dev defaults, eliminating hardcoded `localhost:3001` strings.

### kilo-3 Remediation (2026-06-05)
- **Fixed Docker container orphaning (CRITICAL)**: `endSession()` in `websocket.ts` previously killed the PTY but never stopped/removed the Docker container. Added `stopAndRemoveContainer()` to `docker.ts` and called it in `endSession()`, preventing resource leaks.
- **Implemented reconnection (HIGH)**: `startSession()` now checks `this.sessions.get(sessionId)` and reuses the existing container/PTY if a session already exists, preserving bash state across browser refreshes.
- **Wired `SESSION_TTL` into `SessionStore`**: Added `ttlMs` option to `SessionStore`; `cleanupExpired()` now removes sessions that exceed both grace period and total TTL.
- **Fixed RealTerminal rendering bug**: Changed `height: '0.001em'` to `height: '100%'` to ensure the terminal is visible.
- **Implemented exponential reconnect backoff**: Reconnect delay now doubles (capped at 30 s) instead of using a fixed 1 s delay.
- **Removed `manualChunks: { lucide: ... }` from `vite.config.ts` ` (H-2)**: The `manualChunks` configuration forced `lucide-react` into a single vendor chunk, undermining the named-import bundle-size optimization. Removed the `manualChunks` block entirely, restoring per-app chunking benefits.
- **Made `plugin-inspect-react-code` dev-only (L-4)**: `inspectAttr()` is now excluded from production builds by switching `vite.config.ts` to use `defineConfig(({ mode }) => ({...}))` and conditionally including the plugin only when `mode !== 'production'`.
- **Added zod-validated PIN storage for PasswordManager (M-7)**: `PasswordManager.tsx` no longer reads `password_manager_pin` via raw `localStorage.getItem()`. Instead, it uses `safeStoredPin()` and `saveșin()` from the new `src/utils/pinStorage.ts` module, which validates PINs against `z.string().regex(/^\d{4}$/)`. Corrupted or non-4-digit values gracefully fall back to the default `'1234'`.
- **Extracted `recurseMoveNode` from inline closure (M-4)**: The `recurseMove` closure was duplicated inline inside `useFileSystem.moveToTrash`. Extracted to `src/utils/vfsHelpers.ts` alongside the existing `walkAndDelete` helper, eliminating ~10 lines of duplication and making the helper independently testable. 
- **Debounced `desktopIcons` persistence (L-1)**: The `useEffect` in `OSProvider` that writes `desktopIcons` to `localStorage` on every state change now wraps the write in a 300 ms debounce with a cleanup handler. This prevents rapid re-serialization during drag operations.
- **Added ARIA labels to PasswordManager icon-only buttons (M-5)**: Added `aria-label` attributes to 8 icon-only buttons in `PasswordManager.tsx` (Lock, Close form, Generate password, Edit, Copy password, Delete, Hide/Show password) to improve screen-reader accessibility.
- **Removed unused dependencies and lint artifacts (L-6, L-7, L-8)**: Removed `next-themes`, `sonner`, and `tw-animate-css` from `package.json` (unused in `src/`). Removed dead `eslint-disable` directive in `safeJsonParse.ts`. Removed unused `_setToken` import from `useAuthToken.tsx`.
- **Added `engines` field to `package.json` (L-3)**: Enforces `node >= 20`, matching the documented prerequisite.

See [REMEDIATION.md](REMEDIATION.md) for the full security audit report, [REMEDIATION_MIMO2.md](REMEDIATION_MIMO2.md) for the prior code review audit remediation, and [REMEDIATION_KIMI2.md](REMEDIATION_KIMI2.md) for the latest code review audit. See [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md) for the active remediation tracking, and [Code_Review_Audit_kimi-3.md](Code_Review_Audit_kimi-3.md) for the latest audit findings.

## 🎯 Real Terminal Feature Plan

A validated implementation plan exists for integrating a real bash terminal (`node-pty` + Docker) into UbuntuOS Web. The independent validation found **1 critical blocker** (no existing JWT auth system; must be built +2–3 days) and **3 high-severity discrepancies** (xterm package names, category casing, `windowId` propagation), all now corrected.

- **Validated Plan**: [Validated_Implementation_Plan_Real_Terminal.md](Validated_Implementation_Plan_Real_Terminal.md)
- **Validation Report**: [Code_Review_Audit_xterm_VALIDATED.md](Code_Review_Audit_xterm_VALIDATED.md)
- **Status**: Ready to implement (13–19 days) after confirming 6 pre-implementation decisions
- **Risk**: JWT issuance system must be built first (Approach B: backend `/auth/token` endpoint recommended)

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 19.2.0 | Component-based UI & Hook-based logic |
| **Language** | TypeScript | 5.9.3 | Strict type safety across the OS store |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first design with Ubuntu tokens |
| **Components** | Radix UI / Shadcn | Latest | Accessible primitive components |
| **Icons** | Lucide React | 0.562.0 | Vector iconography for apps and UI |
| **Storage** | LocalStorage | N/A | Persistence for the Virtual File System |
| **Security** | DOMPurify | 3.4.7 | XSS sanitization for user-generated HTML |
| **Validation** | Zod | 4.3.5 | Runtime schema validation for persistence |
| **Testing** | Vitest | 4.x | Unit tests for utils and components |

### Core Systems
1.  **Window Manager:** A custom engine in `src/components/WindowFrame.tsx` handling dragging, resizing, focus management, and state transitions (min/max/restore).
2.  **OS Store:** Centralized state management using React Context + `useReducer` to sync the Dock, Desktop, and Windows.
3.  **Virtual File System (VFS):** A robust file management layer with associations, trash handling, and directory traversal. Data is persisted to `localStorage` and validated with `zod` schemas.

## ⚡ Quick Start

### Prerequisites
*   Node.js ≥ 20
*   npm or yarn

### Installation & Run

1.  **Clone the repository**
2.  **Navigate to the app directory:**
    ```bash
    cd app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start development server:**
    ```bash
    npm run dev
    ```

### Verify Setup
After running `npm run dev`, open your browser at the provided port (usually `http://localhost:3000`). You should see the UbuntuOS boot sequence animation followed by the login screen.

## 🛠️ Build Commands

| Command | Purpose |
| :--- | :--- |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint static analysis |
| `npm run test` | Run Vitest test suite (283 total: 233 frontend + 50 backend) |
| `npm run preview` | Local preview of the production build |
| `tsc -b` | Project-wide type checking |

## 🐳 Docker Image (Real Terminal)

A hardened custom Docker image is used for the Real Terminal feature. It is based on `ubuntu:24.04` with a non-root user (`appuser`, `uid=1000`), minimal packages, and no `sudo`.

### Build the Image

```bash
cd backend
npm run docker:build
```

### Validate

```bash
npm run docker:test
```

### Design

| Aspect | Value | Rationale |
| :--- | :--- | :--- |
| Base | `ubuntu:24.04` | Matches previous config default |
| Non-root user | `appuser:1000` | Matches `docker.ts` `User: '1000:1000'` |
| Packages | `bash`, `coreutils`, `locales`, `procps` | Minimal functional terminal |
| Removed | `sudo` | Security hardening |
| Size | ~98 MB | Minimal footprint |

## 🗂️ Documentation
| Document | Purpose |
| :--- | :--- |
| `AGENTS.md` | High-signal architectural briefing for AI agents |
| `CLAUDE.md` | Coding standards and implementation guidelines |
| `GEMINI.md` | Project context for Gemini AI interactions |
| `REMEDIATION.md` | Full security audit and remediation report |
| `plan.md` | Original project roadmap and feature checklist |
| `REMEDIATION_MIMO2.md` | Prior code review audit remediation |
| `REMEDIATION_KIMI2.md` | Latest code review audit remediation (2026-06-02) |
| `CONSISTENT.md` | Single source of truth for all audit findings and remediation status |
| `REMEDIATION_PLAN.md` | Active remediation plan with todo list and execution tracking |
| `REMEDIATION_PLAN_DPSK2.md` | dpsk-2 code review audit remediation plan and execution tracking |
| `Code_Review_Audit_xterm_VALIDATED.md` | Validation report for Real Terminal feature plan |
| `Code_Review_Audit_kimi-3.md` | Latest comprehensive code review audit (2026-06-04) |

## ⚠️ Known Issues & Recommendations

1. **VFS localStorage Limit**: The virtual file system uses `localStorage`, which has a ~5 MB limit. For large file storage, consider migrating to IndexedDB. **Status**: `saveFS` now emits typed `FileSystemSaveError` events; the OSProvider surfaces a user-visible notification on quota errors.
2. **Accessibility - Remaining Work**: Core shell components plus 24 apps now have ARIA labels (Browser, Calendar, Email, Chat, Weather, LoginScreen, Whiteboard, Drawing, MarkdownPreview, ApiTester, Contacts, ColorPicker, NetworkTools, MediaConverter, Notes, RssReader, Todo, CodeEditor, ImageGallery, PhotoEditor, FtpClient, Minesweeper, MusicPlayer, PasswordManager, VoiceRecorder, Spreadsheet, ScreenRecorder, ArchiveManager, DocumentViewer, ImageViewer, Reminders). **~17 apps still need ARIA labels** (System/Media apps and games). Run a Lighthouse accessibility audit for details.
3. **Split osReducer**: The `osReducer` is approximately 379 lines and handles window, dock, notification, context menu, icon, theme, and alt-tab logic. Now `export`ed for testing. Consider splitting into domain-specific reducers.
4. **CI/CD Pipeline**: Automated build + lint + test gates are not yet implemented.
5. **Unused Local / Import Hygiene**: The `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. Prior build broke with 43 `TS6133` errors across 16 files. Keep imports lean and remove dead code promptly to prevent build regressions.
6. **ReDoS from User-Crafted Regex**: RegexTester and TextEditor now limit iterations. Apps accepting user regex (e.g., Notes search, Email filters) use `String.includes()` and are not vulnerable. Audit any app with `new RegExp(userInput)` for missing guards.
7. **ScreenRecorder**: Now uses real `getDisplayMedia` + `MediaRecorder` API for actual screen capture with `.webm` output.
8. **Game Highscore Validation**: All 7 game apps now use zod validation for highscore localStorage reads. Pattern: `safeJsonParse(val ?? '0', HighScoreSchema, 0)`.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
