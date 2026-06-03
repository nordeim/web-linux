# UbuntuOS Web - Project Context

This document serves as the primary instructional context for Gemini when interacting with this codebase.

## Project Overview

UbuntuOS Web is a high-fidelity, interactive replica of the Ubuntu Linux desktop environment. It is built as a Single Page Application (SPA) that runs entirely in the browser. A comprehensive security audit and remediation was completed on **2026-05-31**, eliminating `eval()`, `new Function()`, and XSS vulnerabilities.

### Main Technologies
- **Framework**: React 19 (Functional components, Hooks)
- **Language**: TypeScript 5.9 (Strict mode enabled)
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4 (Utility-first with CSS variable design tokens)
- **UI Components**: Radix UI primitives & Shadcn UI
- **Icons**: Lucide React
- **State Management**: Centralized React Context (`useOSStore.tsx`)
- **Persistence**: LocalStorage-backed Virtual File System (VFS) with `zod` schema validation
- **Security**: DOMPurify for XSS sanitization

### Core Architecture
- **Shell**: The main UI (`App.tsx`) manages the boot sequence, login screen, and the desktop environment (Dock, TopPanel, Desktop).
- **Window Manager**: Handles window lifecycle (open, close, minimize, maximize), focus (z-index stacking), and positioning (cascading).
- **Virtual File System (VFS)**: A custom hook-based system (`useFileSystem.ts`) that manages a hierarchical node structure (files and folders) with local persistence. Data is validated with `zod` at runtime.
- **App Ecosystem**: 54 functional applications located in `src/apps/`, managed by a central `AppRouter.tsx` and `registry.ts`.

## Building and Running

Commands must be executed from the `app/` directory.

| Task | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Start Dev Server** | `npm run dev` (Runs on `http://localhost:3000`) |
| **Production Build** | `npm run build` (Runs `tsc` then `vite build`) |
| **Linting** | `npm run lint` |
| **Type Checking** | `tsc -b` |
| **Tests** | `npx vitest run` |

## Security Requirements

These are **non-negotiable** rules derived from the security audit.

### Math Evaluation
- **`eval()` / `new Function()` FORBIDDEN`. Any math evaluation must use `safeEval()` from `@/utils/safeEval`.
- **Guideline**: The `safeEval` utility uses a shunting-yard algorithm and only allows `0-9`, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, and whitespace.

### HTML Sanitization
- **`dangerouslySetInnerHTML` is restricted**. Any injection of user-generated HTML must pass through `sanitizeHtml()` from `@/utils/sanitizeHtml`.
- **Markdown**: Use `sanitizeMarkdownHtml()` which has a whitelist for common markdown tags.
- **Code Editor**: Use `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`.
- **Regex Tester**: Use `sanitizeHtml(..., {ADD_TAGS: ['mark']})`.

### localStorage Validation
- **`JSON.parse()` without validation IS ANTI-PATTERN**. All localStorage reads must use `validateDesktopIcons()` or `validateFileSystem()` from `@/utils/storageValidation`.
- **Migration**: The VFS uses the key `ubuntuos_filesystem_v2`. Legacy key `ubuntuos_filesystem` is supported but should not be used for new writes.

## Development Conventions

### Coding Style
- **Strict Typing**: Strict TypeScript is enforced. Avoid `any`; use `unknown` for unpredictable data.
- **Component Pattern**: Use functional components with `memo` for performance-critical UI (like Dock or Desktop).
- **Hooks-First**: Business logic should reside in custom hooks (`hooks/`) or centralized in the OS/FS stores.
- **Naming**: PascalCase for components and types; camelCase for utilities, hooks, and variables.

### State & Logic
- **Global State**: Use the `useOS()` hook to access system state and dispatch actions.
- **File Access**: Always use the `useFileSystem()` hook. Reference files by their unique node `id`, not by path, to ensure reliability across renames/moves.
- **Theming**: Adhere to the design tokens defined in `src/index.css`. Use CSS variables (e.g., `var(--accent-primary)`) to ensure compatibility with Light/Dark mode.

### Adding New Features
- **New Apps**:
    1. Create component in `src/apps/`.
    2. Register metadata in `src/apps/registry.ts`.
    3. Map the `appId` in `src/apps/AppRouter.tsx`.
    4. If the app evaluates math, use `safeEval()`.
    5. If the app shows user HTML, use `sanitizeHtml()`.
    6. If the app persists to localStorage, use `zod` validation.
- **UI Primitives**: Check `src/components/ui/` first before creating custom components.
