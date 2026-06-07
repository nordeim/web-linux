# UbuntuOS Web — Mimo-6 Re-Validation & Remediation Plan

**Date:** 2026-06-07
**Auditor:** Claw Code
**Status:** Mimo-6 audit claims complete, independent re-validation in progress

---

## Phase 1: Re-Validation Results (status_27.md claims vs. actual codebase)

### 1.1 Claims Verified as Complete ✅

| # | Claim from status_27.md | Verification | Result |
|---|------------------------|-------------|--------|
| C1 | `generateId.ts` uses `crypto.randomUUID()` | Read source + grep | ✅ CONFIRMED |
| C2 | Both hooks import from `utils/generateId` | grep import statements | ✅ CONFIRMED |
| C3 | `generateId.test.ts` has 4 tests | Read file | ✅ CONFIRMED |
| C4 | endSession race guard (delete before async) | Read websocket.ts lines 158-165 | ✅ CONFIRMED |
| C5 | `endSession-race.test.ts` has 2 tests | Read file | ✅ CONFIRMED |
| C6 | verifyToken `.catch()` added to websocket.ts | Read websocket.ts lines 46-55 | ✅ CONFIRMED |
| C7 | cleanupExpired try/catch added | Read websocket.ts lines 175-188 | ✅ CONFIRMED |
| C8 | endSession try/catch added | Read websocket.ts lines 152-165 | ✅ CONFIRMED |
| C9 | Docs updated: 190 tests (150 frontend + 40 backend) | grep in README, CLAUDE, AGENTS | ✅ CONFIRMED |
| C10 | TypeScript builds clean (app + backend) | `tsc -b --noEmit` | ✅ CONFIRMED |
| C11 | All 190 tests pass | vitest run | ✅ CONFIRMED |

### 1.2 Metrics

- **Frontend tests:** 22 files / 150 tests — ALL PASS
- **Backend tests:** 13 files / 40 tests — ALL PASS
- **Total:** 190/190 (100%)
- **TypeScript strict builds:** 0 errors (app + backend)

---

## Phase 2: Independent Audit — New Issues Found

The mimo-6 audit was comprehensive but missed **three error-handling gaps** in `websocket.ts` that follow the same pattern as the issues it fixed:

### W-1: `send()` — Unhandled `ws.send()` Error ⚠️

**Location:** `backend/src/websocket.ts:195-198`
```typescript
private send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));  // Can throw if socket closes between check and send
  }
}
```

**Impact:** MEDIUM — Can throw an unhandled error if the WebSocket closes between the `readyState` check and the `ws.send()` call, causing the process to crash.

**Root Cause:** The `readyState` check is not atomic. Between the check and the send, another thread/event could close the socket.

**Fix:** Wrap `ws.send()` in a try/catch block.

---

### W-2: `handleMessage` case 'input' — Unhandled `pty.write()` Error ⚠️

**Location:** `backend/src/websocket.ts:137`
```typescript
case 'input': {
  // ... policy evaluation ...
  containerSession.pty.write(data);  // Can throw if PTY process is dead
  break;
}
```

**Impact:** MEDIUM — If the PTY process dies between the message receipt and the `write()` call, the error propagates up through the `ws.on('message')` handler. The outer try/catch in `wireWebSocket` catches `JSON.parse` errors but does **not** catch errors thrown inside `handleMessage`.

**Root Cause:** No defensive programming around PTY I/O operations.

**Fix:** Wrap `containerSession.pty.write(data)` in a try/catch block.

---

### W-3: `handleMessage` case 'close' — Unhandled Promise from `endSession()` ⚠️

**Location:** `backend/src/websocket.ts:145-146`
```typescript
case 'close': {
  this.endSession(sessionId);  // Returns Promise, not awaited
  ws.close();
  break;
}
```

**Impact:** LOW — `endSession()` now has try/catch, so it won't reject. But the pattern is inconsistent with other async calls in the codebase (which use `void` or `await`).

**Root Cause:** Inconsistent async handling pattern.

**Fix:** Add `void` keyword to be explicit, or `await` (since the WebSocket is closing anyway).

---

## Phase 3: Remediation Plan (TDD)

### ToDo List

| # | Item | Severity | TDD Step | Est. Effort |
|---|------|----------|----------|-------------|
| 1 | Fix `send()` ws.send() error handling | MEDIUM | Write test → fix code | 10 min |
| 2 | Fix `handleMessage` input pty.write() error | MEDIUM | Write test → fix code | 10 min |
| 3 | Fix `handleMessage` close endSession() pattern | LOW | Write test → fix code | 5 min |
| 4 | Run full backend test suite (40 tests) | — | Validate no regressions | 2 min |
| 5 | Run full frontend test suite (150 tests) | — | Validate no regressions | 15 min |
| 6 | Run TypeScript strict build | — | Zero errors | 2 min |
| 7 | Final validation report | — | Comprehensive | 5 min |

### TDD Execution Order

```
Step 1: W-1 — send() error handling (TDD)
  ├── Write failing test in backend/src/__tests__/send-error.test.ts
  ├── Test fails: ws.send() throws but is uncaught
  ├── Fix: Add try/catch around ws.send()
  └── Test passes

Step 2: W-2 — handleMessage input pty.write() error (TDD)
  ├── Write failing test in backend/src/__tests__/handleMessage-error.test.ts
  ├── Test fails: pty.write() throws inside handleMessage
  ├── Fix: Add try/catch around containerSession.pty.write(data)
  └── Test passes

Step 3: W-3 — handleMessage close endSession() pattern (TDD)
  ├── Write failing test (or code review fix)
  ├── Fix: Add `void` before `this.endSession(sessionId)`
  └── Verify consistency

Step 4: Validation
  ├── Run full backend tests: 13 files, 40 tests must pass
  ├── Run full frontend tests: 22 files, 150 tests must pass
  ├── TypeScript builds: zero errors
  └── Generate final report
```

---

## Phase 4: Validation Against Codebase

### Alignment Check

| Fix | Target File | Current Status | Expected After Fix |
|-----|------------|---------------|-------------------|
| W-1 | websocket.ts:195-198 | No try/catch on ws.send() | try/catch added |
| W-2 | websocket.ts:137 | No try/catch on pty.write() | try/catch added |
| W-3 | websocket.ts:145-146 | Plain `this.endSession()` | `void this.endSession()` |

### No Regressions Expected

- `send()` fix: Adds try/catch, doesn't change return type or behavior on success path
- `handleMessage` input fix: Adds try/catch, sends error to client instead of crashing
- `handleMessage` close fix: Cosmetic consistency, no behavioral change

---

## Summary

**Mimo-6 audit:** 11/11 claims verified as complete ✅
**New findings:** 3 error-handling gaps in websocket.ts (same pattern as fixed issues)
**Remediation:** TDD-based fixes for 3 issues, full test validation
**Expected outcome:** 190/190 tests pass, TypeScript zero errors, no regressions
