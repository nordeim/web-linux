# UbuntuOS Web — Real Terminal Feature Plan (xterm)

## Independent Validation Report (2026-06-04)

### Executive Summary

Two planning documents (`plan_xterm.md` draft and `Validated_Implementation_Plan_Real_Terminal.md`) were evaluated against the current codebase to determine if a real bash terminal (via `node-pty` + Docker) can be integrated into UbuntuOS Web.

**Verdict:** The Validated Plan is architecturally sound, but **one critical blocker** makes immediate implementation infeasible without first building a JWT issuance system. Multiple high-severity discrepancies in package names, category casing, and `windowId` propagation were confirmed. All have been corrected in the Validated Plan.

### CRITICAL: No JWT Authentication System Exists (V1 — Confirmed)

The draft plan assumed BitcoinOS Web had an existing JWT login system. **It does not.**

- **AuthState** (`app/src/types/index.ts`): Pure in-memory state with no `token` field.
- **LOGIN reducer** (`app/src/hooks/useOSStore.tsx`): Simply sets `isAuthenticated: true` with no token generation.
- **LoginScreen** (`app/src/components/LoginScreen.tsx`): Accepts any password after an 800ms delay, no validation, no API call.
- **No JWT libraries**: No `jsonwebtoken`, `jose`, or similar package in the App.

**Impact:** Phase 1.6 (`src/auth.ts`) has nothing to verify WebSocket tokens against. Phase 0 (JWT issuance) must be implemented first, adding **2–3 days**.

**Recommended approach**: Expose a minimal `/auth/token` HTTP endpoint in the backend to sign tokens, keeping the secret server-side.

### HIGH — Confirmed & Fixed in Validated Plan

| ID | Draft Issue | Actual Codebase | Validated Plan Fix |
|----|-------------|-----------------|-------------------|
| **V2** | `category: 'system'` (lowercase) | `AppCategory` type requires PascalCase: `'System'` | Fixed to `'System'` |
| **V3** | Packages: `xterm`, `xterm-addon-fit`, `xterm-addon-web-links` | xterm.js v5 uses scoped packages: `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links` | Fixed to scoped names |
| **V4** | `windowId` not passed to children | `AppRouterProps` has `windowId: string`, but `AppRouter` only destructures `appId` | Fixed — now destructures and passes `windowId` prop |

### MEDIUM — Confirmed

| ID | Issue | Status |
|----|-------|--------|
| **V5** | No `server.proxy` for `/ws` in `vite.config.ts` | True — must add `proxy: { '/ws': { target: 'ws://localhost:3001', ws: true } }` |
| **V6** | Backend `tsconfig.json` must match `erasableSyntaxOnly: true` | True — frontend has this set; backend must use `const` objects + unions instead of `enum` |

### Confirmed Correct Assumptions (VC)

All 11 confirmed-correct assumptions from the Validated Plan were independently verified:

- **VC1–VC2**: React 19, TypeScript 5.9, `strict: true`, `noUnusedLocals`, `noUnusedParameters` — all confirmed.
- **VC3–VC4**: No existing backend or Docker infrastructure — confirmed.
- **VC5**: `safeJsonParse` + zod pattern exists — confirmed.
- **VC6**: xterm.js renders to `<canvas>`, no `dangerouslySetInnerHTML` needed — confirmed.
- **VC7**: `safeEval` not applicable to terminal (backend PTY, not browser eval) — confirmed.
- **VC8**: `AppRouter.tsx` uses `lazy(() => import(...))` — confirmed.
- **VC9**: Existing `Terminal.tsx` is purely client-side (simulated bash, no WebSocket) — confirmed.
- **VC10**: Build commands (`npm run dev`, `npm run build`, `npm run test`) — confirmed.
- **VC11**: `WindowFrame` does not pass resize info — confirmed; `ResizeObserver` inside RealTerminal is correct.

### Revised Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| **0: JWT Auth Foundation** *(NEW)* | **2–3 days** | **Day 3** |
| 1: Backend Foundation | 2–3 days | Day 6 |
| 2: Session Persistence | 1–2 days | Day 8 |
| 3: Security Hardening | 2–3 days | Day 11 |
| 4: PTY Protocol | 2 days | Day 13 |
| 5: Frontend Integration | 2–3 days | Day 16 |
| 6: Testing & Deploy | 2–3 days | Day 19 |
| **Total** | **13–19 days** | — |

### Pre-Implementation Decisions Required

| # | Decision | Options | Recommendation |
|----|----------|---------|----------------|
| D1 | JWT issuance approach | A: Browser-side (`jose`)<br>B: Backend `/auth/token` endpoint | **B** — keeps secret server-side |
| D2 | Backend location | `backend/` (project root) vs `app/backend/` | **`backend/`** — isolates concerns |
| D3 | Container network access | `--network=none` vs `--network=bridge` | **Configurable**, default `none` |
| D4 | Warm pool for fast startup | Pre-spawn vs on-demand | **On-demand for v1** |
| D5 | Multi-window terminal | Each window = own container vs shared | **Each window = own container** |
| D6 | Existing Terminal.tsx | Keep / Replace / Coexist | **Keep both** — simulated + PTY coexist |

### Key Files Affected (if implemented)

**New Backend Files (at project root):**
```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
├── nginx.conf
└── src/
    ├── index.ts
    ├── config.ts
    ├── types.ts
    ├── auth.ts
    ├── docker.ts
    ├── websocket.ts
    ├── sessionStore.ts
    ├── policy.ts
    └── logger.ts
```

**New Frontend Files:**
```
app/src/
├── utils/authToken.ts
├── hooks/useAuthToken.tsx
└── apps/RealTerminal.tsx
```

**Modified Frontend Files:**
```
app/src/types/index.ts           (add authToken to OSState)
app/src/hooks/useOSStore.tsx     (integrate token in LOGIN/LOGOUT)
app/src/apps/registry.ts         (add 'real-terminal' entry)
app/src/apps/AppRouter.tsx       (add lazy import + pass windowId)
app/vite.config.ts              (add server.proxy for /ws)
```

### Lessons from This Validation

1. **Never assume existing auth infrastructure**: The draft plan cost itself 2–3 days by assuming a JWT system already existed. Always verify login/auth state before designing token-dependent features.
2. **Package naming changes across major versions**: xterm.js v4 → v5 moved to scoped packages (`@xterm/*`). `npm install xterm` on a fresh project would install v4 with incompatible APIs.
3. **Props declared but not destructured**: `AppRouterProps` had `windowId: string`, but `AppRouter({ appId })` only destructured `appId`. This pattern is a common source of "missing prop" bugs.
4. **Consistency across tsconfig boundaries**: If frontend has `erasableSyntaxOnly: true`, any new backend must match — enums become `const` objects + union types.

### Recommendation

✅ **Approved to proceed** with the Validated Implementation Plan after confirming the 6 pre-implementation decisions above.

> Note: This validation was performed independently by reading the actual source code, not by trusting the Validated Plan's claims. Every finding was cross-referenced against a specific file and line number.
