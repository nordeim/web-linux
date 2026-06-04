# UbuntuOS Web

<img width="931" height="689" alt="UbuntuOS Web Desktop" src="https://github.com/user-attachments/assets/f6d4911a-438c-4db2-9372-6e844f238e20" />

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 7.2](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, high-fidelity web-based replica of the Ubuntu Linux desktop environment. This project delivers a fully interactive experience in the browser, featuring a window manager, virtual file system, and 55 functional applications (including a real terminal).

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
- **Fixed GEMINI.md app count inconsistency**: Corrected internal inconsistency where line 7 said "55 applications" but line 22 said "54 applications". Now consistently states 55.
- **Updated osReducer line count in documentation**: Changed from "approximately 350 lines" to "approximately 375 lines" across all documentation files to match actual reducer function size.
- **Added color validation utility**: Created `src/utils/colorValidation.ts` to validate CSS color strings before injection, preventing potential CSS injection attacks. Integrated into `chart.tsx` to validate color values from `ChartConfig`.
- **Added registry completeness test**: Created `src/apps/__tests__/registry-completeness.test.ts` to automatically verify that all apps routed in `AppRouter.tsx` have corresponding entries in `registry.ts`.
- **Fixed CSS build warning from regex pattern**: Tailwind CSS content scanner was misinterpreting the regex pattern in `MarkdownPreview.tsx` as a CSS class selector. Fixed by excluding the file from Tailwind scanning in `tailwind.config.mjs`.

## 🛡️ Recent Security & Reliability Improvements

This codebase has undergone multiple comprehensive security audits and remediations. Key fixes include:

### Previous Security & Reliability Improvements

#### dpsk-2 Security & Reliability Remediation (2026-06-02)
- **Eliminated Arbitrary Code Execution**: Replaced `eval()` (Spreadsheet) and `new Function()` (Terminal) with a hardened shunting-yard math parser.
- **Fixed XSS Vulnerabilities**: All `dangerouslySetInnerHTML` instances now wrap content in `DOMPurify`-based sanitization.
- **Added localStorage Schema Validation**: Prevents data corruption by validating all persisted state with `zod` at runtime. Introduced the `safeJsonParse(raw, schema, fallback)` utility for app-specific validation.
- **Fixed Z-Index Overflow**: Added bounds checking to prevent focus stacking issues in long sessions.
- **Resolved Fragile Reduce Logic**: Fixed window state restoration logic to prevent crashes when minimizing all windows.
- **Eliminated 43 Build Errors from Dead Code**: Fixed all `TS6133` errors (unused locals/parameters) across 16 files, ensuring clean production builds.
- **Fixed ReDoS in RegexTester**: Added execution iteration limit (1000) to prevent catastrophic backtracking from freezing the browser tab.
- **Fixed Calculator Factorial Memory Crash**: Added input cap at 170 to prevent `Array.from({length: v})` from allocating massive arrays.
- **Refactored RegexTester Rendering**: Replaced `dangerouslySetInnerHTML` with React component-based match highlighting to eliminate XSS risk.
- **Fixed Misleading Recording Extensions**: Changed `.webm` to `.txt` for ScreenRecorder and VoiceRecorder simulated downloads.
- **Fixed Calculator Keyboard Stale Closures**: Added all handler functions to `useEffect` dependency array to prevent stale closure bugs.
- **Fixed WindowFrame Wildcard Import**: Replaced `import * as Icons from 'lucide-react'` with named imports (`Minus`, `Copy`, `Square`, `X`), saving ~587 KB of bundle bloat per chunk.
- **Fixed MINIMIZE_ALL Losing Window Positions**: `MINIMIZE_ALL` now captures `prevPosition` and `prevSize` before minimizing, matching the behavior of `MINIMIZE_WINDOW`.
- **Exported sanitizeMarkdownHtml from Utils**: `sanitizeMarkdownHtml()` was local to `MarkdownPreview.tsx` but is now properly exported from `@/utils/sanitizeHtml` for reuse across apps.
- **Removed Dead Commented Import from Desktop.tsx**: Cleaned up a commented `import * as Icons from 'lucide-react'` line that violated build hygiene.
- **Corrected Stale Documentation Line Counts**: Updated osReducer line count from "499-line" to "approximately 350 lines" across all documentation files.
- **Added GlobalErrorBoundary Around AppShell**: The `AppShell` component (boot, login, keyboard handlers) is now wrapped in `GlobalErrorBoundary`, preventing shell-level errors from crashing the entire OS.

### dpsk-2 Phase 1: localStorage Validation Complete (2026-06-03)
- **Replaced raw `JSON.parse` in 15 apps**: All apps (`ArchiveManager`, `Calculator`, `Calendar`, `Chat`, `Clock`, `ColorPalette`, `ColorPicker`, `Memory`, `Notes`, `Reminders`, `RssReader`, `ScreenRecorder`, `Settings`, `Spreadsheet`, `TextEditor`) now use `safeJsonParse(raw, schema, fallback)` instead of unvalidated `JSON.parse` for localStorage reads.
- **Zero remaining raw `JSON.parse` on localStorage**: Final verification confirms no apps use unvalidated localStorage reads.

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
- **Updated documentation counts**: App count corrected from 54 to 55 (real-terminal added). Test count updated to 81 tests across 13 test files.

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
| `npm run test` | Run Vitest unit test suite (98 tests, 15 test files) |
| `npm run preview` | Local preview of the production build |
| `tsc -b` | Project-wide type checking |

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

1. **VFS localStorage Limit**: The virtual file system uses `localStorage`, which has a ~5 MB limit. For large file storage, consider migrating to IndexedDB.
2. **Accessibility - Remaining Work**: Core shell components (Dock, WindowFrame, Desktop) and the Calculator and TextEditor apps now have ARIA labels. Games and media apps may still need keyboard navigation and ARIA labels. Run a Lighthouse accessibility audit for details.
3. **Split osReducer**: The `osReducer` is approximately 375 lines and handles window, dock, notification, context menu, icon, theme, and alt-tab logic. Now `export`ed for testing. Consider splitting into domain-specific reducers.
4. **CI/CD Pipeline**: Automated build + lint + test gates are not yet implemented.
5. **Unused Local / Import Hygiene**: The `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. Prior build broke with 43 `TS6133` errors across 16 files. Keep imports lean and remove dead code promptly to prevent build regressions.
6. **ReDoS from User-Crafted Regex**: RegexTester now limits iterations, but apps accepting user regex (e.g., Notes search, Email filters) should also guard against catastrophic backtracking.
7. **Simulated vs Real Recordings**: ScreenRecorder and VoiceRecorder create placeholder text downloads. Production builds should implement actual `MediaRecorder` API recording or clearly mark as simulated.
8. **Vitest @/ Alias Resolution**: Component tests using `@/` aliases fail in vitest due to module resolution issues. Currently, only utility tests (relative imports) pass consistently. Source-level tests (reading file source strings) are used as a workaround for component validation.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
