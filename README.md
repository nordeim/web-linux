# UbuntuOS Web

<img width="931" height="689" alt="UbuntuOS Web Desktop" src="https://github.com/user-attachments/assets/f6d4911a-438c-4db2-9372-6e844f238e20" />

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 7.2](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, high-fidelity web-based replica of the Ubuntu Linux desktop environment. This project delivers a fully interactive experience in the browser, featuring a window manager, virtual file system, and 54 functional applications.

## 🌟 Overview

UbuntuOS Web solves the challenge of creating a complex, component-based desktop experience in a web environment. It demonstrates the power of modern React by managing a multi-windowed UI with a custom z-index stacking system and a virtualized file system (VFS) that persists data locally.

Built for developers as a showcase of architectural patterns and for users as a portable, web-accessible toolset.

## 🚀 Key Features

| Category | Apps | Highlights |
| :--- | :--- | :--- |
| **📁 System** | 7 Apps | Terminal with bash commands, File Manager, System Monitor, Settings |
| **📝 Productivity** | 10 Apps | Calendar, Spreadsheet, Todo List, Password Manager, Whiteboard |
| **🌐 Internet** | 7 Apps | Tabbed Browser, Email Client, Chat, RSS Reader, Network Tools |
| **🎬 Media** | 7 Apps | Video/Music Players, Photo Editor, Screen/Voice Recorders |
| **🎮 Games** | 11 Apps | Chess (AI), Tetris, Minesweeper, Solitaire, 2048, Sudoku |
| **🛠️ DevTools** | 8 Apps | Code Editor, Git Client, JSON Formatter, Regex Tester, API Tester |
| **🎨 Creative** | 4 Apps | Drawing, Image Gallery, Color Picker, ASCII Art |

## 🛡️ Recent Security & Reliability Improvements

This codebase has undergone a comprehensive security audit and remediation. Key fixes include:

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
- **Fixed MINIMIZE_ALL Losing Window Positions**: `MINIMIZE_ALL` now captures `prevPosition` and `prevSize` before minimizing, matching the拨付r behavior of `MINIMIZE_WINDOW`.
- **Exported sanitizeMarkdownHtml from Utils**: `sanitizeMarkdownHtml()` was local to `MarkdownPreview.tsx` but is now properly exported from `@/utils/sanitizeHtml` for reuse across apps.
- **Removed Dead Commented Import from Desktop.tsx**: Cleaned up a commented `import * as Icons from 'lucide-react'` line that violated build hygiene.
- **Corrected Stale Documentation Line Counts**: Updated osReducer line count from "499-line" to "approximately 350 lines" across all documentation files.
- **Added GlobalErrorBoundary Around AppShell**: The `AppShell` component (boot, login, keyboard handlers) is now wrapped in `GlobalErrorBoundary`, preventing shell-level errors from crashing the entire OS.

See [REMEDIATION.md](REMEDIATION.md) for the full security audit report, [REMEDIATION_MIMO2.md](REMEDIATION_MIMO2.md) for the prior code review audit remediation, and [REMEDIATION_KIMI2.md](REMEDIATION_KIMI2.md) for the latest code review audit.

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
| `npm run test` | Run Vitest unit test suite (41 tests) |
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
| `STATUS_AUDIT_REPORT.md` | Validation report for status_5.md and status_6.md accuracy |

## ⚠️ Known Issues & Recommendations

1. **VFS localStorage Limit**: The virtual file system uses `localStorage`, which has a ~5 MB limit. For large file storage, consider migrating to IndexedDB.
2. **Remaining JSON.parse in ~17 Apps**: While `storageValidation.ts` (desktop icons, VFS) and `safeJsonParse.ts` (PasswordManager, Contacts, Browser) now validate localStorage with zod, many individual apps still use raw `JSON.parse`. Review each app and apply the `safeJsonParse` utility with an app-specific zod schema.
3. **Accessibility**: Some games and media apps lack full keyboard navigation and ARIA labels. Run a Lighthouse accessibility audit for details.
4. **Split osReducer**: The `osReducer` is approximately 350 lines and handles window, dock, notification, context menu, icon, theme, and alt-tab logic. Now `export`ed for testing (see `src/hooks/__tests__/osReducer-zindex.test.tsx`). Consider splitting into domain-specific reducers.
5. **CI/CD Pipeline**: Automated build + lint + test gates are not yet implemented.
6. **Unused Local / Import Hygiene**: The `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. Prior build broke with 43 `TS6133` errors across 16 files. Keep imports lean and remove dead code promptly to prevent build regressions.
7. **ReDoS from User-Crafted Regex**: RegexTester now limits iterations, but apps accepting user regex (e.g., Notes search, Email filters) should also guard against catastrophic backtracking.
8. **Simulated vs Real Recordings**: ScreenRecorder and VoiceRecorder create placeholder text downloads. Production builds should implement actual `MediaRecorder` API recording or clearly mark as simulated.
9. **GlobalErrorBoundary Around AppShell**: The `AppShell` component (boot, login, keyboard handlers) was not wrapped in `GlobalErrorBoundary`. A shell-level error could crash the entire OS. **Fixed**: `AppShell` is now wrapped with `GlobalErrorBoundary` in `App.tsx`.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
