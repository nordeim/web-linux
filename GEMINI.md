# UbuntuOS Web - Project Context

This document serves as the primary instructional context for Gemini when interacting with this codebase.

## Project Overview
UbuntuOS Web is a high-fidelity, interactive replica of the Ubuntu Linux desktop environment. It is built as a Single Page Application (SPA) that runs entirely in the browser.

### Main Technologies
- **Framework**: React 19 (Functional components, Hooks)
- **Language**: TypeScript 5.9 (Strict mode enabled)
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4 (Utility-first with CSS variable design tokens)
- **UI Components**: Radix UI primitives & Shadcn UI
- **Icons**: Lucide React
- **State Management**: Centralized React Context (`useOSStore.tsx`)
- **Persistence**: LocalStorage-backed Virtual File System (VFS)

### Core Architecture
- **Shell**: The main UI (`App.tsx`) manages the boot sequence, login screen, and the desktop environment (Dock, TopPanel, Desktop).
- **Window Manager**: Handles window lifecycle (open, close, minimize, maximize), focus (z-index stacking), and positioning (cascading).
- **Virtual File System (VFS)**: A custom hook-based system (`useFileSystem.ts`) that manages a hierarchical node structure (files and folders) with local persistence.
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
- **UI Primitives**: Check `src/components/ui/` first before creating custom components.
