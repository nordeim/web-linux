# UbuntuOS Web

Web-based Linux desktop environment (Ubuntu-style) built with React 19, TypeScript, and Tailwind CSS. Features 54 interactive applications and a virtual file system with localStorage persistence.

## Foundational Principles

### Meticulous Approach
Follow this six-phase workflow for all implementation tasks:
1. **ANALYZE** - Deep requirement mining.
2. **PLAN** - Structured roadmap with validation.
3. **VALIDATE** - Explicit user confirmation.
4. **IMPLEMENT** - Modular, tested builds.
5. **VERIFY** - Rigorous QA (edge cases, accessibility).
6. **DELIVER** - Complete handoff.

## Implementation Standards

### React & TypeScript
- **React 19**: Use functional components and hooks.
- **Strict TypeScript**: No `any`, use explicit interfaces for props and state.
- **State Management**: Use `useOS` hook (React Context + useReducer) for system-wide state.
- **File System**: Use `useFileSystem` hook for all file operations (VFS).

### UI & Styling
- **Tailwind CSS 3.4**: Use utility classes, following the design tokens in `index.css`.
- **Shadcn UI**: Base components are in `src/components/ui`. Use them instead of custom ones.
- **Lucide React**: Primary icon library.
- **Responsive Design**: Ensure apps handle window resizing correctly.

### Project Structure
- `app/src/apps/`: Individual application components.
- `app/src/components/`: Core desktop environment components (Dock, Desktop, etc.).
- `app/src/hooks/`: Core state and FS logic.
- `app/src/types/`: Centralized type definitions.

## Development Workflow

### Build & Test Commands
(Run from the `app/` directory)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `tsc -b` | Manual type checking |

## Project Conventions

### Adding a New App
1. Create the component in `app/src/apps/YourAppName.tsx`.
2. Register the app in `app/src/apps/registry.ts` with metadata.
3. Add the component to `app/src/apps/AppRouter.tsx`.
4. (Optional) Add a desktop icon in `app/src/hooks/useOSStore.tsx` in `defaultDesktopIcons`.

### File Operations
- Use `fs.readFile(id)` and `fs.writeFile(id, content)`.
- Files are identified by unique IDs, not just paths.
- File associations are defined in `app/src/hooks/useFileSystem.ts`.
