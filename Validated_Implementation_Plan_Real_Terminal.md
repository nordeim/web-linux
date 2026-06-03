# Validated Implementation Plan: Real Bash Terminal Integration for UbuntuOS Web

**Date:** 2026-06-03  
**Status:** Validated — ready for approval  
**Source Plan:** `plan_xterm.md` (draft)  
**Validation Method:** Full 5-phase codebase audit against `codebase_fileset_bundle.md` (32,918 lines)

---

## Executive Summary of Validation

The draft plan is **architecturally sound** but contains **1 critical, 3 high, and 2 medium discrepancies** when measured against the actual codebase. This document corrects those issues, fills gaps, and produces a fully validated, implementation-ready plan with a granular todo list.

### Critical Finding: No JWT Exists

The draft plan assumes "JWT auth integration piggybacking on UbuntuOS Web's existing login." **This is impossible.** UbuntuOS Web's login is a trivial, unauthenticated mock (`LoginScreen.tsx` line 1438): it accepts any password, sets `isAuthenticated: true` in the reducer, and never generates a token. There is no JWT, no cookie, no sessionStorage token — nothing to piggyback on. A JWT issuance system must be designed and built from scratch, adding **2–3 days** of unscoped work.

---

## Validation Findings

### Critical Issues

| # | Severity | Draft Claim | Actual Codebase | Impact |
|---|----------|-------------|-----------------|--------|
| V1 | **CRITICAL** | "JWT auth integration piggybacking on UbuntuOS Web's existing login" | No JWT/auth mechanism exists. `LoginScreen.tsx` accepts any password, dispatches `{ type: 'LOGIN' }` with no token. Auth state is purely in-memory: `{ isAuthenticated: boolean; isGuest: boolean; userName: string }`. | Entire Phase 1.6 (`src/auth.ts`) has nothing to verify against. A JWT issuance system must be built from scratch. +2–3 days. |

### High-Severity Issues

| # | Severity | Draft Claim | Actual Codebase | Impact |
|---|----------|-------------|-----------------|--------|
| V2 | **HIGH** | `category: 'system'` in registry | `AppCategory` type requires PascalCase: `'System'` (line 32696). All 54 entries use PascalCase categories. | TypeScript build error if lowercase used |
| V3 | **HIGH** | Install `xterm`, `xterm-addon-fit`, `xterm-addon-web-links` | xterm.js v5+ uses scoped packages: `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links`. The unscoped `xterm` package is v4 (deprecated). | `npm install` installs wrong/v4 version; API incompatibility |
| V4 | **HIGH** | Plan doesn't address `windowId` propagation for cleanup/focus | `AppRouterProps` includes `windowId` (line 19731) but it is currently destructured away: `{ appId }`. Child components don't receive `windowId`. RealTerminal needs it for: (a) sending `close` message on unmount, (b) detecting focus via `useOS().windows.find(w => w.id === windowId).isFocused`. | Cannot clean up backend session on window close; cannot focus xterm when window activated |

### Medium-Severity Issues

| # | Severity | Draft Claim | Actual Codebase | Impact |
|---|----------|-------------|-----------------|--------|
| V5 | **MEDIUM** | Configure vite proxy for `/ws` | No `server.proxy` key exists in `vite.config.ts`. Must be added from scratch. Draft acknowledges this but doesn't specify exact config format. | Dev environment won't work without it |
| V6 | **MEDIUM** | Backend `tsconfig.json` with strict mode | Frontend `tsconfig.app.json` has `erasableSyntaxOnly: true` (TS 5.9+ feature). Backend tsconfig must match this constraint. Enums are forbidden; must use `const` objects or union types. | Backend build errors if enums used |

### Low-Severity Issues

| # | Severity | Draft Claim | Actual Codebase | Impact |
|---|----------|-------------|-----------------|--------|
| V7 | **LOW** | "sessionId localStorage (zod validated)" | Existing `Terminal.tsx` uses zero localStorage. The pattern is novel for Terminal but follows the established `safeJsonParse` convention from PasswordManager/Contacts/Browser. | No issue — just first Terminal app to use localStorage |
| V8 | **LOW** | ResizeObserver in RealTerminal | No `ResizeObserver` usage exists anywhere in the codebase. RealTerminal would be the first component to use it. | No issue — correct approach for xterm.js |

### Confirmed Correct Assumptions

| # | Draft Claim | Codebase Evidence |
|---|-------------|-------------------|
| VC1 | React 19 + TypeScript strict | `react: ^19.2.0`, `typescript: ~5.9.3`, `strict: true` confirmed |
| VC2 | `noUnusedLocals` / `noUnusedParameters` | Both `true` in `tsconfig.app.json` (line 912-913) |
| VC3 | Separate `backend/` at project root | Project root is parent of `app/`. Backend would live alongside, not inside. |
| VC4 | No existing Docker/backend infra | 100% client-side SPA. Zero backend code, zero Dockerfiles, zero WebSocket servers. |
| VC5 | `safeJsonParse` + zod pattern for sessionId | Clear pattern from PasswordManager, Contacts, Browser (line 10546, 24098, 16050). |
| VC6 | No `dangerouslySetInnerHTML` needed | xterm.js renders to `<canvas>` or manages its own DOM. No HTML injection. |
| VC7 | `safeEval` not applicable | RealTerminal sends commands to backend PTY, not evaluating in-browser. |
| VC8 | Lazy-load pattern in AppRouter | Confirmed: `const Terminal = lazy(() => import('./Terminal'))` (line 19673). |
| VC9 | Existing Terminal is purely client-side | `Terminal.tsx` (line 26012) is a simulated bash with `COMMANDS` record. Uses `safeEval` for `calc` command. No WebSocket, no PTY. |
| VC10 | Build commands from `app/` directory | `npm run dev`, `npm run build`, `tsc -b`, `npm run test` all confirmed in `package.json` scripts. |
| VC11 | WindowFrame does NOT pass resize info | WindowFrame renders `{children}` in a flex container with no resize callback or context. `ResizeObserver` inside RealTerminal is correct. |

---

## Revised Architecture

The architecture diagram from the draft is **validated and correct** with one critical addition: a **JWT Issuance** step in the UbuntuOS Web frontend that generates a token on login and stores it for the WebSocket handshake.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Ubuntu 24.04 Host (Same Host as Frontend)                          │
│                                                                     │
│  ┌─────────────────────┐      ┌─────────────────────────────────┐ │
│  │  Nginx (Production) │      │  Vite Dev Server (Development)    │ │
│  │  /      → static    │      │  /      → React app (port 3000)   │ │
│  │  /ws    → backend   │      │  /ws    → proxy to port 3001      │ │
│  └──────────┬──────────┘      └─────────────────────────────────┘ │
│             │                                                       │
│  ┌──────────┴──────────────────────────────────────────────────────┐ │
│  │  Node.js Backend (port 3001)                                   │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │  WebSocket Server (ws library)                           │   │ │
│  │  │  ├─ JWT Verification Middleware  ← VALIDATES tokens      │   │ │
│  │  │  ├─ Session Manager (in-memory Map + TTL)              │   │ │
│  │  │  ├─ Container Lifecycle (dockerode)                    │   │ │
│  │  │  ├─ PTY Bridge (node-pty)                              │   │ │
│  │  │  ├─ Command Audit Logger                               │   │ │
│  │  │  └─ Input Policy Filter (blocklist/allowlist)          │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                           │                                      │ │
│  │              ┌────────────┴────────────┐                       │ │
│  │              │ Docker Daemon             │                       │ │
│  │              │  ├─ Session A (container) │                       │ │
│  │              │  │   ubuntu:24.04, PTY   │                       │ │
│  │              │  │   --read-only         │                       │ │
│  │              │  │   --cap-drop=ALL      │                       │ │
│  │              └──────────────────────────┘                       │ │
│  │              └─────────────────────────┘                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                           ↑ WebSocket (WSS in prod)                  │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────────────┐
│  Browser                  │                                             │
│  ┌────────────────────────┴────────────────────────────────────────┐   │
│  │  UbuntuOS Web (React 19, Vite, Static)                          │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  WindowFrame (title="Real Terminal")                     │   │   │
│  │  │  ┌──────────────────────────────────────────────────┐   │   │   │
│  │  │  │  RealTerminal.tsx                                  │   │   │   │
│  │  │  │  ├─ @xterm/xterm Terminal (Canvas)               │   │   │   │
│  │  │  │  ├─ @xterm/addon-fit (auto-resize via RO)       │   │   │   │
│  │  │  │  ├─ @xterm/addon-web-links (clickable URLs)     │   │   │   │
│  │  │  │  ├─ WebSocket client (auto-reconnect)            │   │   │   │
│  │  │  │  ├─ sessionId localStorage (safeJsonParse+zod)  │   │   │   │
│  │  │  │  └─ windowId prop (for cleanup & focus)         │   │   │   │
│  │  │  └──────────────────────────────────────────────────┘   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  ★ NEW: Auth Token Module (useAuthToken hook)           │   │   │
│  │  │  ├─ On LOGIN dispatch: generate JWT (jsonwebtoken)      │   │   │
│  │  │  ├─ Store JWT in memory (React Context or module var)   │   │   │
│  │  │  └─ Expose token for WebSocket handshake query param    │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Revised Phase Plan

### Phase 0: JWT Auth Foundation *(NEW — not in draft)*
**Objective:** Build the missing JWT issuance system that the draft plan assumed already existed.  
**Duration:** 2–3 days

| # | Task | Success Criteria | Validation Notes |
|---|------|------------------|------------------|
| 0.1 | Install `jsonwebtoken` in `app/` (frontend) for token generation | `npm install jsonwebtoken` succeeds | Note: this is a server-oriented lib. For browser use, consider a lightweight JWT encoder or move issuance to a minimal backend endpoint. Alternative: use `jose` library (browser-native). | 
| 0.2 | Create `src/utils/authToken.ts` — generates JWT on login with `{ userId, iat, exp }` payload | Token contains verifiable claims; `jwt.verify()` on backend succeeds | **Decision needed:** JWT generated in browser (expose secret to client?) or by a minimal backend `/auth/token` endpoint? The latter is more secure. |
| 0.3 | Create `src/hooks/useAuthToken.ts` — React Context/hook that provides the current JWT token | Components call `const token = useAuthToken()` and receive a valid JWT string or `null` | Must integrate with existing `LOGIN`/`LOGOUT` actions in `osReducer` |
| 0.4 | Integrate token generation into LOGIN reducer or OSProvider's useEffect | After `LOGIN` action, a JWT is available via `useAuthToken()` | Must NOT break existing `isAuthenticated` flow |
| 0.5 | On LOGOUT, clear token from memory | Token is `null` after logout | |
| 0.6 | Write unit tests for token generation and verification | `authToken.test.ts` passes | |

**Validation Checkpoint:**  
→ Call `useAuthToken()` after login → receive non-null JWT → verify it with `jwt.verify(token, secret)` on a test script.

**⚠️ Design Decision Required Before Implementation:**

There are two approaches for JWT issuance, each with trade-offs:

| Approach | Pros | Cons |
|----------|------|------|
| **A: Browser-side generation** (using `jose` library) | No backend needed for token creation; simpler architecture | JWT secret exposed to client; anyone can forge tokens by reading source code |
| **B: Minimal backend `/auth/token` endpoint** | Secret stays server-side; proper security | Requires a backend HTTP endpoint (in addition to WebSocket server); slightly more complex |

**Recommendation:** Approach B — even though it adds a small HTTP endpoint to the backend, it keeps the JWT secret server-side. The alternative (exposing the secret to the browser) defeats the purpose of JWT verification.

---

### Phase 1: Backend Foundation & Docker Infrastructure *(revised from draft)*
**Objective:** Create the Node.js backend with WebSocket support, JWT verification, and Docker container spawning.  
**Duration:** 2–3 days

| # | Task | Success Criteria | Validated Against |
|---|------|------------------|-------------------|
| 1.1 | Create `backend/` directory with `package.json`, `tsconfig.json` (strict mode, no `any`, `erasableSyntaxOnly: true`) | `tsc -b --noEmit` passes | TS 5.9 `erasableSyntaxOnly` constraint (V6) |
| 1.2 | Install dependencies: `ws`, `node-pty`, `dockerode`, `uuid`, `jsonwebtoken`, `zod`, `dotenv` | All packages resolve | |
| 1.3 | Create `src/config.ts` — env vars: `PORT`, `JWT_SECRET`, `DOCKER_IMAGE`, `SESSION_TTL`, `GRACE_PERIOD` | Typed config with zod validation | |
| 1.4 | Create `src/docker.ts` — spawn container with hardened flags: `--read-only`, `--tmpfs /tmp`, `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `-u 1000:1000`, `--cpus`, `--memory`, `--pids-limit` | Container spawns and `docker inspect` shows correct config | |
| 1.5 | Create `src/websocket.ts` — WebSocket server with connection upgrade handling | Can connect via `wscat` | |
| 1.6 | Create `src/auth.ts` — JWT verification middleware + `/auth/token` HTTP endpoint for token issuance | Rejects invalid tokens; accepts valid ones; issues tokens on POST with user credentials | **Revised from draft** — now includes token issuance endpoint (V1 fix) |
| 1.7 | Create `src/types.ts` — shared WebSocket message protocol types (shared with frontend) | All message types defined; use `const` objects + union types instead of `enum` | `erasableSyntaxOnly: true` forbids enums (V6) |
| 1.8 | Create `src/logger.ts` — structured audit logger (stdout + optional file) | Logs in JSON format | |

**Validation Checkpoint:**  
→ `wscat -c ws://localhost:3001?token=VALID_JWT` → receive bash prompt from Docker container.

---

### Phase 2: Session Persistence & Reconnection *(validated, unchanged from draft)*
**Objective:** Implement session ID mapping, disconnect grace periods, and seamless reconnection.  
**Duration:** 1–2 days

| # | Task | Success Criteria |
|---|------|------------------|
| 2.1 | Define `SessionSchema` with zod: `{sessionId, containerId, ptyPid, userId, createdAt, lastActivity, status}` | Schema validates correctly |
| 2.2 | Create `src/sessionStore.ts` — in-memory Map with CRUD operations | Thread-safe operations (Node.js single-threaded, but guard against race conditions) |
| 2.3 | Implement `sessionId` generation (UUID v4) on new connection | Unique IDs generated |
| 2.4 | Implement disconnect detection: on `ws.close` → mark session `disconnected`, start grace timer (default: 5 min) | Session status updates correctly |
| 2.5 | Implement reconnection: on new WebSocket with existing `sessionId` → reattach to existing container/PTY | `echo $$` returns same PID after refresh |
| 2.6 | Implement heartbeat: client ping every 30s, server expects pong within 60s | Abandoned sessions detected |
| 2.7 | Implement cleanup cron: every 60s, destroy containers with `status='disconnected'` and `lastActivity > GRACE_PERIOD` | No orphaned containers after grace period |
| 2.8 | Implement explicit close: on `close` message → immediate cleanup (no grace period) | Container destroyed within 5s |

**Validation Checkpoint:**  
→ Open terminal, run `echo $$` → note PID → refresh browser → verify same PID in reconnected terminal.

---

### Phase 3: Command Restriction & Security Hardening *(validated, unchanged from draft)*
**Objective:** Implement layered command policy and container hardening.  
**Duration:** 2–3 days

| # | Task | Success Criteria |
|---|------|------------------|
| 3.1 | Define `CommandPolicySchema` with zod: `{mode: 'blocklist'|'allowlist', commands, patterns, allowSudo, action}` | Config validates |
| 3.2 | Implement `src/policy.ts` — input scanner that checks commands against policy | `rm -rf /` triggers policy action |
| 3.3 | Implement audit stream: every stdin line is logged with `{timestamp, userId, sessionId, command, policyAction}` | Immutable audit trail |
| 3.4 | Harden Docker container image: create custom `Dockerfile` based on `ubuntu:24.04` with non-root user, minimal packages, no `sudo` | Image builds; container runs as uid 1000 |
| 3.5 | Add filesystem restrictions: no volume mounts to host paths; only explicit read-only config mounts if needed | `docker inspect` shows no binds |
| 3.6 | Add network policy: `--network=none` for isolated mode, or restricted bridge for internet access | Configurable per deployment |
| 3.7 | Document security model: what container isolation provides vs. what input filtering provides | Security runbook written |

**Validation Checkpoint:**  
→ Security review: attempt `rm -rf /`, `mkfs.ext4`, `dd if=/dev/zero` → verify blocked or sandboxed; verify audit log captures attempts.

---

### Phase 4: WebSocket PTY Protocol & Bridge *(validated, unchanged from draft)*
**Objective:** Implement bidirectional PTY I/O with proper encoding, resize, and error handling.  
**Duration:** 2 days

| # | Task | Success Criteria |
|---|------|------------------|
| 4.1 | Implement message protocol handler: `init`, `input`, `output`, `resize`, `error`, `close`, `exit`, `heartbeat` | All types handled |
| 4.2 | Implement PTY data bridge: `node-pty` `onData` → WebSocket `output` message; WebSocket `input` → `pty.write()` | Bidirectional streaming works |
| 4.3 | Implement resize propagation: WebSocket `resize` → `pty.resize(cols, rows)` → SIGWINCH sent to bash | `stty size` reports correct dimensions |
| 4.4 | Handle binary/ANSI encoding: ensure UTF-8 streaming, handle special characters | Colors render; unicode works |
| 4.5 | Implement backpressure handling: if WebSocket buffer full, pause PTY stream | No memory buildup |
| 4.6 | Implement error boundaries: container crash, PTY exit, Docker daemon errors → send `error`/`exit` message | Client shows friendly error |
| 4.7 | Test interactive programs: `vim`, `nano`, `htop`, `less` | All render and respond to keys |

**Validation Checkpoint:**  
→ Run `vim`, `nano`, `htop` successfully in browser; colors and arrow keys work.

---

### Phase 5: Frontend Integration *(revised from draft — fixes V2, V3, V4, V5)*
**Objective:** Build `RealTerminal.tsx` and integrate seamlessly with UbuntuOS Web's existing framework.  
**Duration:** 2–3 days

| # | Task | Success Criteria | Validated Against |
|---|------|------------------|-------------------|
| 5.1 | Install frontend deps: **`@xterm/xterm`**, **`@xterm/addon-fit`**, **`@xterm/addon-web-links`** | `npm install` succeeds | **Fixed V3** — scoped package names |
| 5.2 | Create `src/apps/RealTerminal.tsx` — functional component with strict TypeScript, no `any`. Props: `{ windowId: string }` | `tsc -b --noEmit` passes | **Fixed V4** — windowId prop required |
| 5.3 | Implement xterm.js lifecycle: `useEffect` init → `terminal.open(ref)` → `terminal.loadAddon()` | Terminal renders in window | Uses `@xterm/xterm` API (not `xterm` v4 API) |
| 5.4 | Implement WebSocket client: connect with `?token=${jwt}&sessionId=${id}`; handle reconnect with exponential backoff | Auto-reconnects on disconnect | Token from `useAuthToken()` hook (Phase 0) |
| 5.5 | Implement `sessionId` management: read from localStorage on mount using `safeJsonParse(raw, SessionIdSchema, null)`; generate new if missing; validate with zod | Survives refresh; validated schema | **Follows PasswordManager/Contacts/Browser pattern** (V7, VC5) |
| 5.6 | Implement ResizeObserver on container div: on resize → `fitAddon.fit()` → send `resize` message | Terminal fills window; no dead space | First ResizeObserver in project (V8); correct approach |
| 5.7 | Implement focus handling: subscribe to `useOS().windows`, find window by `windowId`, watch `isFocused` → `terminal.focus()` | Terminal focuses when window clicked | **Fixed V4** — requires windowId prop |
| 5.8 | Implement cleanup: `useEffect` return → send `close` message → `terminal.dispose()` | No memory leaks; container cleaned | **Fixed V4** — cleanup via unmount, not CLOSE_WINDOW dispatch (VC11) |
| 5.9 | Register in `src/apps/registry.ts`: `id: 'real-terminal'`, `category: 'System'`, `icon: 'Terminal'` | Registry entry valid; no TS errors | **Fixed V2** — PascalCase 'System' |
| 5.10 | Register in `src/apps/AppRouter.tsx`: lazy load `RealTerminal`, pass `windowId` prop | Lazy chunk generated; windowId available in child | **Fixed V4** — must destructure and pass windowId |
| 5.11 | Configure `vite.config.ts`: add `server.proxy` for `/ws` → `ws://localhost:3001` with `ws: true` | Dev proxy works | **Fixed V5** — exact config specified |
| 5.12 | Ensure no `dangerouslySetInnerHTML` (xterm.js manages its own DOM) | No sanitization needed | VC6 — confirmed correct |
| 5.13 | Ensure no unused imports/variables | `tsc -b --noEmit` passes | VC2 — `noUnusedLocals`/`noUnusedParameters` |
| 5.14 | Explicitly acknowledge mandatory security rules in code comments: (a) no eval/new Function — N/A, (b) no dangerouslySetInnerHTML — N/A, (c) localStorage zod validation — implemented | Code comments present | Addresses AGENTS.md/CLAUDE.md non-negotiable rules |

**Validation Checkpoint:**  
→ Full integration: click Real Terminal icon → window opens → bash prompt appears → run commands → close window → container destroyed.

---

### Phase 6: Deployment, Testing & Documentation *(validated, unchanged from draft)*
**Objective:** Production-ready deployment, comprehensive testing, and knowledge transfer.  
**Duration:** 2–3 days

| # | Task | Success Criteria |
|---|------|------------------|
| 6.1 | Create production nginx config: static files + WebSocket proxy + TLS | `nginx -t` passes |
| 6.2 | Create `backend/.env.example` and deployment README | Clear setup instructions |
| 6.3 | Write unit tests: `policy.test.ts` (command filter), `sessionStore.test.ts` (TTL/cleanup), `auth.test.ts` (JWT) | All tests pass |
| 6.4 | Write integration tests: WebSocket lifecycle, container spawn/kill, reconnection | All tests pass |
| 6.5 | Write frontend tests: `RealTerminal.test.tsx` (mount, resize, cleanup) | Vitest tests pass |
| 6.6 | End-to-end validation: open terminal → run `ls`, `vim`, `ps` → refresh → verify persistence → close → verify cleanup | Manual demo successful |
| 6.7 | Verify `npm run build` in `app/` passes | Zero build errors |
| 6.8 | Verify backend builds and starts | `npm run build` + `npm start` works |
| 6.9 | Document security runbook: hardening steps, audit log location, incident response | Doc complete |

---

## Revised Timeline

| Phase | Duration | Cumulative | Change from Draft |
|-------|----------|------------|-------------------|
| **0: JWT Auth Foundation** | **2–3 days** | **Day 3** | **NEW** |
| 1: Backend Foundation | 2–3 days | Day 6 | Unchanged |
| 2: Session Persistence | 1–2 days | Day 8 | Unchanged |
| 3: Security Hardening | 2–3 days | Day 11 | Unchanged |
| 4: PTY Protocol | 2 days | Day 13 | Unchanged |
| 5: Frontend Integration | 2–3 days | Day 16 | Unchanged |
| 6: Testing & Deploy | 2–3 days | Day 19 | Unchanged |

**Wedge Demo (Phase 0 + Phase 1 + minimal Phase 5):** 6–8 days.  
**Production Ready:** 13–19 days.

---

## Detailed Implementation Todo List

### Phase 0: JWT Auth Foundation

- [ ] **0.1** Decide JWT issuance approach (browser-side `jose` vs. backend `/auth/token` endpoint) — **blocker for 0.2**
- [ ] **0.2** Install JWT library: `jose` (if browser-side) or add `/auth/token` endpoint to backend Phase 1
- [ ] **0.3** Create `app/src/utils/authToken.ts` — JWT generation/management utility
- [ ] **0.4** Create `app/src/hooks/useAuthToken.ts` — React Context + hook for token access
- [ ] **0.5** Integrate with `osReducer` LOGIN/LOGOUT actions — dispatch token generation on login, clear on logout
- [ ] **0.6** Add `authToken` field to OSState type definition in `types/index.ts`
- [ ] **0.7** Write `app/src/utils/__tests__/authToken.test.ts` — token generation/verification tests
- [ ] **0.8** Verify: after login, `useAuthToken()` returns valid JWT; after logout, returns `null`

### Phase 1: Backend Foundation & Docker Infrastructure

- [ ] **1.1** Create `backend/` directory at project root (sibling to `app/`)
- [ ] **1.2** Create `backend/package.json` with dependencies: `ws`, `node-pty`, `dockerode`, `uuid`, `jsonwebtoken`, `zod`, `dotenv`, `typescript`, `@types/node`, `tsx` (dev)
- [ ] **1.3** Create `backend/tsconfig.json` with `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `erasableSyntaxOnly: true`
- [ ] **1.4** Run `npm install` in `backend/`
- [ ] **1.5** Create `backend/src/config.ts` — env vars with zod validation: `PORT` (default 3001), `JWT_SECRET`, `DOCKER_IMAGE` (default `ubuntu:24.04`), `SESSION_TTL`, `GRACE_PERIOD` (default 300000ms)
- [ ] **1.6** Create `backend/src/types.ts` — WebSocket message protocol types using `as const` objects + union types (NOT enums)
  - Message types: `init`, `input`, `output`, `resize`, `error`, `close`, `exit`, `heartbeat`
  - Shared with frontend via copy or future shared package
- [ ] **1.7** Create `backend/src/docker.ts` — container spawn/kill with hardened flags
  - `--read-only`, `--tmpfs /tmp:size=100m`, `--cap-drop=ALL`, `--security-opt=no-new-privileges`
  - `-u 1000:1000`, `--cpus=1`, `--memory=512m`, `--pids-limit=100`
  - Return container ID and PTY socket info
- [ ] **1.8** Create `backend/src/auth.ts` — JWT verification middleware for WebSocket + `/auth/token` HTTP endpoint
  - `verifyToken(token: string)` → decoded payload or rejection
  - `POST /auth/token` → accepts `{ userName }` → returns `{ token }` (signed with JWT_SECRET)
- [ ] **1.9** Create `backend/src/websocket.ts` — WebSocket server with connection upgrade
  - On upgrade: extract `token` from query string → verify → accept/reject
  - On connection: spawn container → create PTY → begin I/O bridge
- [ ] **1.10** Create `backend/src/logger.ts` — structured JSON audit logger
- [ ] **1.11** Create `backend/src/index.ts` — entry point: HTTP server + WebSocket server
- [ ] **1.12** Test: `wscat -c ws://localhost:3001?token=VALID_JWT` → bash prompt appears

### Phase 2: Session Persistence & Reconnection

- [ ] **2.1** Create `backend/src/sessionStore.ts` — in-memory `Map<sessionId, Session>` with CRUD
- [ ] **2.2** Define `SessionSchema` with zod: `{ sessionId, containerId, ptyPid, userId, createdAt, lastActivity, status }`
- [ ] **2.3** Implement sessionId generation (UUID v4) on new WebSocket connection
- [ ] **2.4** Implement disconnect detection: `ws.close` → mark `disconnected`, start grace timer
- [ ] **2.5** Implement reconnection: new WebSocket with `sessionId` query param → reattach to existing PTY/container
- [ ] **2.6** Implement heartbeat: client ping/pong every 30s/60s
- [ ] **2.7** Implement cleanup cron: `setInterval` every 60s → destroy expired containers
- [ ] **2.8** Implement explicit close: `close` message → immediate container kill
- [ ] **2.9** Test: open terminal → `echo $$` → refresh browser → same PID → close → container gone

### Phase 3: Command Restriction & Security Hardening

- [ ] **3.1** Create `backend/src/policy.ts` — command filter with blocklist/allowlist modes
- [ ] **3.2** Define `CommandPolicySchema` with zod
- [ ] **3.3** Implement audit stream: log every stdin line with timestamp, userId, sessionId, command, policyAction
- [ ] **3.4** Create `backend/Dockerfile` — hardened `ubuntu:24.04` with non-root user, minimal packages, no sudo
- [ ] **3.5** Add filesystem restrictions: no host volume mounts
- [ ] **3.6** Add network policy: configurable `--network=none` or restricted bridge
- [ ] **3.7** Write security model documentation
- [ ] **3.8** Test: attempt `rm -rf /`, `mkfs.ext4`, `dd if=/dev/zero` → verify blocked/sandboxed

### Phase 4: WebSocket PTY Protocol & Bridge

- [ ] **4.1** Implement full message protocol handler for all 8 message types
- [ ] **4.2** Implement PTY data bridge: `node-pty onData` ↔ WebSocket `output`/`input`
- [ ] **4.3** Implement resize propagation: WebSocket `resize` → `pty.resize(cols, rows)`
- [ ] **4.4** Handle UTF-8/ANSI encoding for colors and unicode
- [ ] **4.5** Implement backpressure: pause PTY stream when WebSocket buffer full
- [ ] **4.6** Implement error handling: container crash, PTY exit, Docker errors → `error`/`exit` messages
- [ ] **4.7** Test interactive programs: `vim`, `nano`, `htop`, `less`

### Phase 5: Frontend Integration

- [ ] **5.1** Install frontend deps in `app/`: `npm install @xterm/xterm @xterm/addon-fit @xterm/addon-web-links`
- [ ] **5.2** Create `app/src/apps/RealTerminal.tsx` — functional component with props `{ windowId: string }`
- [ ] **5.3** Define `SessionIdSchema` with zod in `RealTerminal.tsx` or a shared types file
- [ ] **5.4** Implement sessionId localStorage: `safeJsonParse(raw, SessionIdSchema, null)` on mount; generate UUID if null
- [ ] **5.5** Implement xterm.js lifecycle in `useEffect`:
  - `new Terminal()` → `terminal.open(ref)` → `terminal.loadAddon(fitAddon)` → `terminal.loadAddon(webLinksAddon)`
  - Return cleanup: `terminal.dispose()`
- [ ] **5.6** Implement WebSocket client in `useEffect`:
  - Connect: `ws://localhost:3001/ws?token=${token}&sessionId=${sessionId}`
  - On message: `terminal.write(data)` for `output` messages
  - On `terminal.onData`: send `input` message
  - Auto-reconnect with exponential backoff (1s → 2s → 4s → max 30s)
  - Return cleanup: `ws.close()`
- [ ] **5.7** Implement ResizeObserver on container div:
  - `new ResizeObserver(() => { fitAddon.fit(); ws.send(JSON.stringify({ type: 'resize', cols, rows })); })`
  - Observe on mount; disconnect on unmount
- [ ] **5.8** Implement focus handling:
  - Subscribe to `useOS()` state; find window by `windowId` prop; watch `isFocused`
  - When `isFocused` transitions to `true`: `terminal.focus()`
- [ ] **5.9** Implement cleanup on unmount:
  - `useEffect` return: send `{ type: 'close' }` via WebSocket → `terminal.dispose()`
- [ ] **5.10** Register in `app/src/apps/registry.ts`:
  ```ts
  { id: 'real-terminal', name: 'Real Terminal', icon: 'Terminal', category: 'System',
    description: 'Full bash terminal with PTY support via Docker',
    defaultSize: { width: 800, height: 500 }, minSize: { width: 400, height: 250 } }
  ```
- [ ] **5.11** Register in `app/src/apps/AppRouter.tsx`:
  ```ts
  const RealTerminal = lazy(() => import('./RealTerminal'));
  // In switch:
  case 'real-terminal': return <RealTerminal windowId={windowId} />;
  ```
  **Note:** Must now destructure `windowId` from `AppRouterProps` (currently unused)
- [ ] **5.12** Configure `app/vite.config.ts` proxy:
  ```ts
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  ```
- [ ] **5.13** Add code comments acknowledging mandatory security rules (no eval, no dangerouslySetInnerHTML, localStorage zod-validated)
- [ ] **5.14** Run `tsc -b --noEmit` → zero errors; run `npm run build` → zero errors
- [ ] **5.15** Integration test: click Real Terminal → bash prompt → run `ls` → close → container destroyed

### Phase 6: Deployment, Testing & Documentation

- [ ] **6.1** Create `backend/nginx.conf` for production: static files + WebSocket proxy + TLS
- [ ] **6.2** Create `backend/.env.example` with all required env vars documented
- [ ] **6.3** Create deployment README with step-by-step setup instructions
- [ ] **6.4** Write `backend/src/__tests__/policy.test.ts` — command filter unit tests
- [ ] **6.5** Write `backend/src/__tests__/sessionStore.test.ts` — TTL/cleanup unit tests
- [ ] **6.6** Write `backend/src/__tests__/auth.test.ts` — JWT verification unit tests
- [ ] **6.7** Write integration tests: WebSocket lifecycle, container spawn/kill, reconnection
- [ ] **6.8** Write `app/src/apps/__tests__/RealTerminal.test.tsx` — mount, resize, cleanup
- [ ] **6.9** End-to-end validation: full manual test of all scenarios
- [ ] **6.10** Verify `npm run build` in `app/` passes with zero errors
- [ ] **6.11** Verify `npm run build` + `npm start` in `backend/` works
- [ ] **6.12** Document security runbook

---

## Risk Register (Revised)

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| **No existing JWT — must build from scratch** | **Certain** | **High** | Added Phase 0; +2–3 days | **Mitigated** |
| `node-pty` native compilation fails on host | Medium | High | Use pre-built Docker image; fallback to `docker exec` stream if `node-pty` fails | Unchanged |
| Container startup latency >3s | Medium | Medium | Accept for security; or implement warm pool (pre-spawned containers) | Unchanged |
| ~~JWT secret mismatch with UbuntuOS Web~~ | ~~Low~~ | ~~High~~ | ~~Audit existing auth hook first~~ | **Eliminated** — no existing JWT to mismatch with |
| xterm.js resize conflicts with WindowFrame | Low | Medium | ResizeObserver inside RealTerminal (self-contained); no WindowFrame changes needed | Unchanged — validated correct |
| Orphaned containers accumulate | Medium | High | Aggressive heartbeat + cleanup cron; monitor with `docker system df` | Unchanged |
| `noUnusedLocals`/`noUnusedParameters` build failures | High | Low | Run `tsc -b --noEmit` after every file; clean imports immediately | Unchanged — validated constraint |
| Session ID collision or localStorage corruption | Low | Medium | Validate with zod; fallback to new session on validation failure | Unchanged |
| **AppRouter `windowId` not passed to children** | **Certain** | **High** | Destructure and pass `windowId` as prop to RealTerminal | **Mitigated** |
| **Wrong xterm package names (v4 vs v5)** | **Certain** | **High** | Use `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links` | **Mitigated** |
| **Category casing `'system'` vs `'System'`** | **Certain** | **Medium** | Use `'System'` (PascalCase) per AppCategory type | **Mitigated** |
| `erasableSyntaxOnly` forbids enums in backend TS | Certain | Medium | Use `as const` objects + union types instead of `enum` | **Mitigated** |
| **JWT secret exposed if browser-side generation** | Medium | High | Use backend `/auth/token` endpoint; keep secret server-side | **Mitigated by design decision** |

---

## Pre-Implementation Decisions Required

Before writing any code, the following decisions must be confirmed:

| # | Decision | Options | Recommendation | Blocking |
|---|----------|---------|----------------|----------|
| D1 | **JWT issuance approach** | A: Browser-side (`jose`), B: Backend endpoint (`/auth/token`) | **B** — keeps secret server-side | Phase 0.2, 0.3, 1.6 |
| D2 | **Backend location** | `backend/` (project root) or `app/backend/` | **`backend/` at project root** — isolates concerns | Phase 1.1 |
| D3 | **Container network access** | `--network=none` (isolated) or `--network=bridge` (internet) | **Configurable** with default `none` | Phase 3.6 |
| D4 | **Warm pool for fast startup** | Pre-spawn containers vs. on-demand | **On-demand for v1**; add warm pool as optimization later | Phase 1.7 |
| D5 | **Multi-window terminal** | Each window = own container vs. one container per user | **Each window = own container** — simplest isolation model | Phase 2.3 |
| D6 | **Existing Terminal.tsx** | Keep both, replace, or make Real Terminal opt-in | **Keep both** — `terminal` (simulated) + `real-terminal` (PTY) coexist | Phase 5.9, 5.10 |

---

## Files to Create/Modify

### New Files (Backend)

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
├── nginx.conf
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── types.ts
│   ├── auth.ts
│   ├── docker.ts
│   ├── websocket.ts
│   ├── sessionStore.ts
│   ├── policy.ts
│   ├── logger.ts
│   └── __tests__/
│       ├── auth.test.ts
│       ├── policy.test.ts
│       ├── sessionStore.test.ts
│       └── integration.test.ts
```

### New Files (Frontend)

```
app/src/
├── utils/
│   └── authToken.ts                    (Phase 0)
├── hooks/
│   └── useAuthToken.tsx                (Phase 0)
├── apps/
│   └── RealTerminal.tsx                (Phase 5)
├── apps/__tests__/
│   └── RealTerminal.test.tsx           (Phase 6)
├── utils/__tests__/
│   └── authToken.test.ts               (Phase 0)
```

### Modified Files (Frontend)

| File | Change | Phase |
|------|--------|-------|
| `app/src/types/index.ts` | Add `authToken` to OSState | 0 |
| `app/src/hooks/useOSStore.tsx` | Integrate token generation into LOGIN/LOGOUT reducer + OSProvider | 0 |
| `app/src/apps/registry.ts` | Add `real-terminal` entry | 5 |
| `app/src/apps/AppRouter.tsx` | Add lazy import + switch case + pass `windowId` prop | 5 |
| `app/vite.config.ts` | Add `server.proxy` for `/ws` | 5 |
| `app/package.json` | Add `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links`, `jose` or remove if backend-issued | 0/5 |

---

*This validated plan was produced by cross-referencing the draft `plan_xterm.md` against the complete codebase bundle (`codebase_fileset_bundle.md`, 32,918 lines), including all documentation files (AGENTS.md, CLAUDE.md, GEMINI.md, README.md), all configuration files (package.json, tsconfig.json, tsconfig.app.json, vite.config.ts), and all relevant source files (useOSStore.tsx, Terminal.tsx, AppRouter.tsx, registry.ts, WindowFrame.tsx, LoginScreen.tsx, types/index.ts, and 17+ additional files). Every finding is grounded in specific line numbers and code evidence.*
