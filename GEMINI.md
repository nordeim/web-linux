# UbuntuOS Web — Gemini CLI Context

Comprehensive, high-fidelity web-based replica of the Ubuntu Linux desktop environment.

## Project Overview

**UbuntuOS Web** is a multi-windowed desktop experience built for the browser. It implements a custom window manager, a virtual file system (VFS), and 54 functional applications.

### Core Technologies
- **Framework**: React 19.2 (Functional Components, Hooks, Context API)
- **Language**: TypeScript 5.9 (Strict mode enabled)
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4 + Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React (Named imports mandatory for performance)
- **Security**: DOMPurify (XSS protection), Custom Shunting-Yard Parser (Math evaluation)
- **Validation**: Zod (Runtime schema validation for persistence)
- **Testing**: Vitest 4.x

### Architectural Pillars
- **OS Store (`src/hooks/useOSStore.tsx`)**: Centralized state management using `useReducer` and React Context. Handles window stacking (z-index), focus, notifications, and desktop state.
- **Virtual File System (`src/hooks/useFileSystem.ts`)**: ID-based file management with `localStorage` persistence. Supports associations, trash, and directory traversal.
- **Application Routing (`src/apps/AppRouter.tsx`)**: Implements `React.lazy()` and `Suspense` to code-split 54 applications, significantly reducing initial bundle size (~360 KB initial).
- **Security Utilities (`src/utils/`)**:
  - `safeEval.ts`: Hardened math parser replacing `eval()` for Spreadsheet and Terminal.
  - `sanitizeHtml.ts`: DOMPurify wrappers for safe HTML injection.
  - `storageValidation.ts`: Zod-based schema validation for all `localStorage` reads.

---

## Building and Running

Commands must be executed from the `app/` directory.

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start Vite development server (usually at `localhost:3000`) |
| `npm run build` | Run `tsc -b` and `vite build` for production |
| `npm run lint` | Execute ESLint static analysis |
| `npm run test` | Run Vitest unit tests |
| `npm run preview` | Preview the production build locally |

---

## Development Conventions

### 🛡️ Security & Reliability
- **No Arbitrary Execution**: `eval()` and `new Function()` are strictly **forbidden**. Use `safeEval()` for math evaluation.
- **Mandatory Sanitization**: Always wrap `dangerouslySetInnerHTML` content in `sanitizeHtml()` or `sanitizeMarkdownHtml()`.
- **Schema Validation**: Never use unvalidated `JSON.parse` on `localStorage` data. Use `safeJsonParse(raw, schema, fallback)` or the `validate*` utilities in `storageValidation.ts`.
- **ReDoS Protection**: Any app accepting user-supplied regex must limit `exec()` iterations (cap at 1000).

### 🏗️ Code Quality & Performance
- **TypeScript Strictness**: Avoid `any`. Define explicit interfaces for all props and state.
- **Import Hygiene**: Use named imports for Lucide icons (`import { Minus } from 'lucide-react'`). Wildcard imports are only permitted in `DynamicIcon.tsx`.
- **Build Hygiene**: `noUnusedLocals` and `noUnusedParameters` are enforced. Unused imports or variables will cause hard build failures.
- **Lazy Loading**: New applications must be added to `AppRouter.tsx` using `lazy()` to maintain performance.

### 🔄 Workflow: The Meticulous Approach
Adhere to this six-phase procedure for all implementation tasks:
1. **ANALYZE**: Deep requirement mining.
2. **PLAN**: Structured roadmap with verification criteria.
3. **VALIDATE**: Explicit confirmation before coding.
4. **IMPLEMENT**: Modular, tested builds following project patterns.
5. **VERIFY**: Rigorous QA including edge cases and accessibility.
6. **DELIVER**: Complete handoff with documentation.
