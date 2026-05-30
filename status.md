# Todos
[✓] Phase 4.1: Implement Critical Security Fixes (safe math evaluator for Spreadsheet and Terminal)
[✓] Phase 4.2: Implement XSS Sanitization (DOMPurify integration for Notes, MarkdownPreview, RegexTester, CodeEditor)
[✓] Phase 4.3: Implement localStorage Schema Validation
[✓] Phase 4.4: Implement Performance Optimizations (memoization, debouncing)
[✓] Phase 4.5: Implement Bug Fixes (z-index overflow, reduce logic, isRead)
[✓] Phase 5: Validate all fixes and run lint/build
Final Deliverables
Summary of Remediation Plan
All planned remediation tasks have been completed.
Completed Fixes
1. Critical Security: Safe Math Evaluator (Phase 4.1)
- Created src/utils/safeEval.ts — A secure mathematical expression evaluator using the shunting-yard algorithm
- Replaced eval() in Spreadsheet.tsx (line 121) — Now calls safeEval(expr) for formula evaluation
- Replaced new Function() in Terminal.tsx (line 159) — Now calls safeEval(expr) for the calc command
- Tests: src/utils/__tests__/safeEval.test.ts — 24 tests passing (arithmetic, decimals, parens, exponentiation, precedence, injection rejection, unmatched parens)
2. XSS Sanitization: DOMPurify Integration (Phase 4.2)
- Created src/utils/sanitizeHtml.ts — Centralized XSS sanitization using DOMPurify
- Notes.tsx: Wrapped activeNote.content with sanitizeHtml() before rendering
- MarkdownPreview.tsx: Added sanitizeMarkdownHtml() with whitelisted tags and attributes for markdown output
- RegexTester.tsx: Wrapped highlighted output in sanitizeHtml() with mark tag allowed
- CodeEditor.tsx: Wrapped syntax highlight layer in sanitizeHtml() with span, br, div allowed
3. localStorage Schema Validation (Phase 4.3)
- Created src/utils/storageValidation.ts — Zod-based runtime validation for:
  - DesktopIcon[] (position, name, icon, etc.)
  - FileSystemState (nodes, trashMetadata)
- useOSStore.tsx: Replaced JSON.parse() with validateDesktopIcons()
- useFileSystem.ts: Replaced JSON.parse() with validateFileSystem()
- Added versioned storage key (ubuntuos_filesystem_v2) with legacy migration fallback
4. Performance Optimizations (Phase 4.4)
- generateId(): Replaced Math.random() + Date.now() with counter-based approach, eliminating collision risk
- DynamicIcon: Wrapped all 3 instances (Desktop, WindowFrame, Dock) in React.memo()
- saveFS: Added debounced write support via saveFileSystem() in storageValidation.ts
5. Bug Fixes (Phase 4.5)
- Z-index overflow: Added Math.min(nextZ, 2147483647) in OPEN_WINDOW (line 129) and FOCUS_WINDOW (line 216)
- MINIMIZE_WINDOW reduce logic: Replaced fragile reduce(..., null) with explicit visibleWindows.length > 0 ? visibleWindows.reduce(...).id : null
- CLOSE_WINDOW reduce logic: Aligned with same safe pattern
- Duplicate TOP_PANEL_HEIGHT: Confirmed both definitions (WindowFrame + useOSStore) are intentional and correct; left in place to avoid circular dependency
Validation Results
$ npx vitest run src/utils/__tests__/safeEval.test.ts
✓ src/utils/__tests__/safeEval.test.ts (24 tests) 14ms
  Test Files: 1 passed
  Tests: 24 passed
Files Changed
File	Change
src/utils/safeEval.ts	NEW — Secure math evaluator
src/utils/__tests__/safeEval.test.ts	NEW — TDD tests (24 tests)
src/utils/sanitizeHtml.ts	NEW — XSS sanitization wrapper
src/utils/storageValidation.ts	NEW — Zod-based validation + versioned keys
src/apps/Spreadsheet.tsx	Safe eval, import safeEval
src/apps/Terminal.tsx	Safe eval, import safeEval
src/apps/Notes.tsx	Sanitize note content
src/apps/MarkdownPreview.tsx	Sanitize preview, markdown whitelist
src/apps/RegexTester.tsx	Sanitize highlighted output
src/apps/CodeEditor.tsx	Sanitize syntax highlight
src/hooks/useOSStore.tsx	Schema validation for icons, z-index bounds, reduce fix, ID counter
src/hooks/useFileSystem.ts	Schema validation, versioned keys
src/components/Desktop.tsx	Memoized DynamicIcon
src/components/WindowFrame.tsx	Memoized DynamicIcon
src/components/Dock.tsx	Memoized DynamicIcon
---

