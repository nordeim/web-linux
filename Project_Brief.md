✦ I have completed a meticulous review of the core documentation (CLAUDE.md, README.md, AGENTS.md, and plan.md) and verified key architectural claims against the source code.

Project Synthesis: UbuntuOS Web

WHAT: Project Scope
UbuntuOS Web is a high-fidelity, web-based replica of the Ubuntu Linux desktop environment. It delivers a multi-windowed experience directly in the browser, featuring:
 - 54 Interactive Applications: Spanning system utilities, productivity tools, media players, games, and developer tools.
 - Custom Window Manager: Handles dragging, resizing, and z-index stacking with a focus-management engine.
 - Virtual File System (VFS): An ID-based file management layer with localStorage persistence, directory traversal, and file associations.
 - Modern Tech Stack: Built with React 19.2, TypeScript 5.9, Vite 7.2, and Tailwind CSS 3.4.

WHY: Strategic Purpose
 - Architectural Showcase: Demonstrates managing complex state and UI in a web environment using modern React patterns (Context, useReducer, React.lazy).
 - Security & Reliability: Serves as a benchmark for implementing hardened web features, such as safe math evaluation and XSS sanitization, after undergoing multiple rigorous audits.
 - Portability: Provides a functional, zero-install desktop environment accessible from any modern browser.

HOW: Architecture & Implementation Standards
 - State Management: The system state is centralized in a monolithic osReducer within /home/project/web-linux/app/src/hooks/useOSStore.tsx, managed via the useOS hook.
 - Security Mandates:
     - Safe Math: All math evaluation (e.g., in Spreadsheets or Terminal) must use the hardened shunting-yard parser in /home/project/web-linux/app/src/utils/safeEval.ts.
     - XSS Prevention: Any dangerouslySetInnerHTML usage requires mandatory sanitization via utilities in /home/project/web-linux/app/src/utils/sanitizeHtml.ts.
     - Schema Validation: Persisted data is validated at runtime using Zod schemas defined in /home/project/web-linux/app/src/utils/storageValidation.ts.
 - Performance Optimization:
     - Code Splitting: 54 applications are lazy-loaded on demand via React.lazy() in /home/project/web-linux/app/src/apps/AppRouter.tsx, reducing the initial bundle size from ~1 MB to ~360 KB.
     - Tree Shaking: Strict adherence to named imports for Lucide React to prevent library bloat.
 - Development Workflow: Implementation follows the Meticulous Approach (Analyze, Plan, Validate, Implement, Verify, Deliver), ensuring technical rigor and high-fidelity output.

Key File Paths (Absolute)
 - /home/project/web-linux/CLAUDE.md (Coding Standards & Principles)
 - /home/project/web-linux/README.md (Project Overview & Features)
 - /home/project/web-linux/AGENTS.md (Technical Briefing for AI Agents)
 - /home/project/web-linux/plan.md (Original Roadmap & App Checklist)
 - /home/project/web-linux/app/src/hooks/useOSStore.tsx (Core OS State)
 - /home/project/web-linux/app/src/hooks/useFileSystem.ts (VFS Logic)
 - /home/project/web-linux/app/src/apps/AppRouter.tsx (Lazy-loaded App Routing)
 - /home/project/web-linux/app/src/utils/safeEval.ts (Secure Math Parser)
 - /home/project/web-linux/app/src/utils/sanitizeHtml.ts (XSS Sanitization)
 - /home/project/web-linux/app/src/utils/storageValidation.ts (Schema Validation)

Analysis Summary
 - Project Type: A high-fidelity, web-based replica of the Ubuntu Linux desktop environment (Code Project).
 - Tech Stack: React 19.2, TypeScript 5.9, Vite 7.2, and Tailwind CSS 3.4.
 - Key Findings:
     - Architecture: Features a custom window manager with a stacking engine, a virtual file system (VFS) with localStorage persistence, and 54 lazy-loaded applications.
     - Security: Hardened against XSS and arbitrary code execution through custom math parsers (safeEval.ts) and sanitization layers (sanitizeHtml.ts).
     - Performance: Optimized via code-splitting (React Lazy) and strict import hygiene for iconography.

GEMINI.md Content
The generated GEMINI.md file located at /home/project/web-linux/GEMINI.md provides:
 1. Project Overview: Deep dive into the mission, tech stack, and architectural pillars.
 2. Building and Running: Explicit commands for development, testing, and production builds.
 3. Development Conventions: Guidelines on security (No eval()), performance (named imports), and the Meticulous Approach workflow mandated for the codebase.

This file will serve as the primary instructional context for all future interactions within this workspace.

