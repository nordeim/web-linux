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
- **Build Hygiene**: `tsconfig.app.json` enforces `"noUnusedLocals": true` and `"noUnusedParameters": true`. Any unused import, variable, or parameter will break the build. Remove dead code immediately; do not leave it commented out.

### UI & Styling
- **Tailwind CSS 3.4**: Use utility classes, following the design tokens in `index.css`.
- **Shadcn UI**: Base components are in `src/components/ui`. Use them instead of custom ones.
- **Lucide React**: Primary icon library. Use named imports (`import { IconName } from 'lucide-react'`) only. Do not use `import * as Icons from 'lucide-react'` (imports the entire ~587 KB library).
- **Responsive Design**: Ensure apps handle window resizing correctly.

### Security
- **`eval()` / `new Function()`**: **FORBIDDEN**. Any math evaluation must use `safeEval()` from `@/utils/safeEval`. This includes spreadsheet formulas, terminal `calc` commands, and any future math features.
- **`dangerouslySetInnerHTML`**: **MANDATORY SANITIZATION**. Always wrap user-generated HTML with `sanitizeHtml()` from `@/utils/sanitizeHtml`. Never inject raw strings.
  - For markdown content, use `sanitizeMarkdownHtml()` which has a whitelist for common markdown tags.
  - For code highlighting, use `sanitizeHtml(..., {ALLOWED_TAGS: ['span', 'br', 'div']})`.
  - For regex test results, use `sanitizeHtml(..., {ADD_TAGS: ['mark']})`.

### Persistence
- **localStorage Schema Validation**: All `localStorage` reads must go through `validateDesktopIcons()` or `validateFileSystem()` from `@/utils/storageValidation`. For ad-hoc app-specific reads, use `safeJsonParse(raw, schema, fallback)` from `@/utils/safeJsonParse`. Never trust `JSON.parse()` output without runtime validation.
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

## Performance

### Code Splitting
- **React.lazy() + Suspense** reduced initial bundle from ~1 MB to ~360 KB by splitting 54 apps into individual chunks.
- **Shared DynamicIcon** eliminates ~8× code duplication across Dock, WindowFrame, Desktop, AppLauncher, and other components.
- **Lucide monolithic import** (`import * as Icons from 'lucide-react'`) still imports the entire library (~587 KB). Use named imports when possible.

### Build Hygiene
- **"noUnusedLocals": true** and **"noUnusedParameters": true** are enforced in `tsconfig.app.json`. A single unused import or variable will break the production build (`npm run build`).
- **Remediation (2026-06-02)**: 43 `TS6133` errors were fixed across 16 files. Root causes: dead imports (Lucide icons, React hooks), unused state variables, and unread function parameters.
- **Prevention**: Clean up imports immediately when removing features. Use `npx tsc -b --noEmit` to catch errors before committing.

## Lessons Learned

### Security
- **`eval()` and `new Function()` are never safe**, even with regex sanitization. A hardened parser is the only acceptable solution for math evaluation.
- **`dangerouslySetInnerHTML` without sanitization is a persistent XSS vector**, especially when combined with `localStorage` persistence (stored XSS).
- **Runtime schema validation is non-optional** for any persisted state. TypeScript types are erased at runtime; `zod` is the correct defense. The new `safeJsonParse(raw, schema, fallback)` utility in `src/utils/safeJsonParse.ts` provides a reusable pattern for ad-hoc localStorage reads.

### State Management
- **Monolithic reducers are hard to maintain**. The 499-line `osReducer` works but violates separation of concerns. Consider splitting into domain-specific reducers or switching to a state management library with selectors.
- **Z-index as a number is fragile**. The `2147483647` cap is correct, but a better solution would be to recalculate z-indices periodically to avoid the cap entirely.
- **Window state transitions need explicit guards**. The `MINIMIZE_WINDOW` and `CLOSE_WINDOW` actions both need careful handling of `activeWindowId` to avoid `null` dereferences.

### Testing
- **TDD is effective for security-critical code**. The `safeEval` tests (24 cases) caught multiple edge cases during development.
- **Component-level tests are missing**. No tests exist for `WindowFrame`, `Desktop`, or `Dock`. These are high-value test targets due to their complexity.

## Recommendations

1. **Migrate VFS from localStorage to IndexedDB** for larger file storage (>5 MB).
2. **Add `vitest` coverage collection** to track test coverage across all modules.
3. **Implement CI/CD pipeline** with automated `build`, `lint`, and `test` gates.
4. **Split `osReducer` into domain-specific reducers** (window management, notifications, desktop icons, etc.).
5. **Fix remaining ~17 apps using raw `JSON.parse`** on localStorage without zod validation (Clock, Todo, ColorPalette, ColorPicker, TextEditor, Calendar, Reminders, Memory, Spreadsheet, Chat, RssReader, Settings, Notes, ArchiveManager, ScreenRecorder, Calculator, VoiceRecorder). Apply the `safeJsonParse` + zod schema pattern demonstrated in PasswordManager, Contacts, and Browser.
6. **Enforce import hygiene during code review**: The `noUnusedLocals`/`noUnusedParameters` TypeScript checks catch dead code at build time, but IDE auto-imports can silently add unused imports. Add a pre-commit hook or lint rule to block commits with unused identifiers.
