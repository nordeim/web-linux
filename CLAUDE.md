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

### Security
- **`eval()` / `new Function()`**: **FORBIDDEN**. Any math evaluation must use `safeEval()` from `@/utils/safeEval`. This includes spreadsheet formulas, terminal `calc` commands, and any future math features.
- **`dangerouslySetInnerHTML`**: **MANDATORY SANITIZATION**. Always wrap user-generated HTML with `sanitizeHtml()` from `@/utils/sanitizeHtml`. Never inject raw strings.
  - For markdown content, use `sanitizeMarkdownHtml()` which has a whitelist for common markdown tags.
  - For code highlighting, use `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`.
  - For regex test results, use `sanitizeHtml(..., {ADD_TAGS: ['mark']})`.

### Persistence
- **localStorage Schema Validation**: All `localStorage` reads must go through `validateDesktopIcons()` or `validateFileSystem()` from `@/utils/storageValidation`. Never trust `JSON.parse()` output without runtime validation.
- **Versioned Keys**: The VFS uses `ubuntuos_filesystem_v2`. Legacy keys are supported for migration but new code should only write to the versioned key.

## Project Structure
- `app/src/apps/`: Individual application components.
- `app/src/components/`: Core desktop environment components (Dock, Desktop, etc.).
- `app/src/hooks/`: Core state and FS logic.
- `app/src/utils/`: Utility functions (safeEval, sanitizeHtml, storageValidation).
- `app/src/types/`: Centralized type definitions.

## Development Workflow

### Build & Test Commands
(Run from the `app/` directory)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run preview` | Preview production build |
| `tsc -b` | Manual type checking |

### Adding a New App
1. Create the component in `app/src/apps/YourAppName.tsx`.
2. Register the app in `app/src/apps/registry.ts` with metadata.
3. Add the component to `app/src/apps/AppRouter.tsx`.
4. (Optional) Add a desktop icon in `app/src/hooks/useOSStore.tsx` in `defaultDesktopIcons`.

### File Operations
- Use `fs.readFile(id)` and `fs.writeFile(id, content)`.
- Files are identified by unique IDs, not just paths.
- File associations are defined in `app/src/hooks/useFileSystem.ts`.

## Lessons Learned

### Security
- **`eval()` and `new Function()` are never safe**, even with regex sanitization. A hardened parser is the only acceptable solution for math evaluation.
- **`dangerouslySetInnerHTML` without sanitization is a persistent XSS vector**, especially when combined with `localStorage` persistence (stored XSS).
- **Runtime schema validation is non-optional** for any persisted state. TypeScript types are erased at runtime; `zod` is the correct defense.

### State Management
- **Monolithic reducers are hard to maintain**. The 499-line `osReducer` works but violates separation of concerns. Consider splitting into domain-specific reducers or switching to a state management library with selectors.
- **Z-index as a number is fragile**. The `2147483647` cap is correct, but a better solution would be to recalculate z-indices periodically to avoid the cap entirely.
- **Window state transitions need explicit guards**. The `MINIMIZE_WINDOW` and `CLOSE_WINDOW` actions both need careful handling of `activeWindowId` to avoid `null` dereferences.

### Testing
- **TDD is effective for security-critical code**. The `safeEval` tests (24 cases) caught multiple edge cases during development.
- **Component-level tests are missing**. No tests exist for `WindowFrame`, `Desktop`, or `Dock`. These are high-value test targets due to their complexity.

## Recommendations

1. **Add React Error Boundaries** around `AppRouter` and `WindowManager` to prevent one app crash from taking down the shell.
2. **Migrate VFS from localStorage to IndexedDB** for larger file storage (>5 MB).
3. **Add `vitest` coverage collection** to track test coverage across all modules.
4. **Implement CI/CD pipeline** with automated `build`, `lint`, and `test` gates.
5. **Split `osReducer` into domain-specific reducers** (window management, notifications, desktop icons, etc.).
