# Comprehensive Remediation Plan: Post-Audit Fixes & Documentation Alignment

**Date:** 2026-06-02
**Scope:** Address all issues and gaps identified during validation of `status_5.md` and `status_6.md`
**Status:** Planning Phase

---

## Executive Summary

This remediation plan addresses **5 categories** of issues discovered during the validation of `status_5.md` (mimo-2 remediation) and `status_6.md` (kimi-2 remediation):

1. **🔴 Critical Fixes** (1 item): Missing `GlobalErrorBoundary` around `AppShell`
2. **🟡 Documentation Inconsistencies** (3 items): CONSISTENT.md, AGENTS.md, README.md misalignment
3. **🟡 Cross-Document Gaps** (4 items): Missing security rules, recommendations, lessons learned
4. **🟡 Mischaracterization Corrections** (2 items): osReducer.test.ts, Calculator stale closure
5. **🟢 Deferred Items** (2 items): useOS() optimization, handleMenuAction refactor

**Total Items:** 12
**Estimated Effort:** 2-3 hours
**Risk Level:** Low (all changes are localized, no architecture changes)

---

## Phase 1: Critical Fixes

### C1: Add GlobalErrorBoundary Around AppShell

**Priority:** 🔴 Critical
**File:** `app/src/App.tsx`
**Problem:** The `AppShell` component (lines 19-203) is NOT wrapped in `GlobalErrorBoundary`. If any error occurs during boot, login, or shell rendering, the entire OS crashes. The existing `GlobalErrorBoundary` only wraps `AppRouter` inside `WindowManager` (individual app level), not the shell level.
**Impact:** A single error in `BootSequence`, `LoginScreen`, or any shell-level component crashes the entire UbuntuOS web app with a white screen.
**Fix:**
```tsx
// In App.tsx, wrap AppShell with GlobalErrorBoundary
function App() {
  return (
    <OSProvider>
      <GlobalErrorBoundary>
        <AppShell />
      </GlobalErrorBoundary>
    </OSProvider>
  );
}
```
**Verification:**
- Build passes (`npm run build`)
- TypeScript compiles (`npx tsc -b --noEmit`)
- Simulate an error in BootSequence (e.g., `throw new Error('test')`) and verify the error boundary catches it

---

## Phase 2: Documentation Inconsistencies

### D1: Create CONSISTENT.md — Single Source of Truth

**Priority:** 🟡 High
**File:** `CONSISTENT.md` (new)
**Problem:** Findings, fixes, and recommendations are scattered across `CLAUDE.md`, `AGENTS.md`, `README.md`, `REMEDIATION.md`, `REMEDIATION_MIMO2.md`, `REMEDIATION_KIMI2.md`, `status_5.md`, `status_6.md`, and `STATUS_AUDIT_REPORT.md`. Future agents cannot determine which document to trust.
**Fix:** Create `CONSISTENT.md` that:
1. Lists ALL findings from all audits with their current status
2. Links to the exact line in source code
3. Notes which document claimed what (for traceability)
4. Is updated atomically with each change

### D2: Fix AGENTS.md — Remove or Correct status_5.md Claims

**Priority:** 🟡 High
**File:** `AGENTS.md`
**Problems:**
1. **Missing security rules:** No mention of ReDoS protection, unbounded array creation
2. **Missing gotchas:** No mention of CASCADE_WINDOWS z-index issue, Calculator keyboard stale closures
3. **Missing lessons:** No mention of `eval()` lesson, `dangerouslySetInnerHTML` lesson
4. **Inconsistent with CLAUDE.md:** AGENTS.md doesn't reference the same security improvements as CLAUDE.md

**Fix:**
- Add ReDoS and unbounded array rules to "Anti-Patterns to Avoid"
- Add CASCADE_WINDOWS and keyboard stale closure to "Troubleshooting & Gotchas"
- Add `eval()` and `dangerouslySetInnerHTML` lessons to "Lessons Learned"
- Ensure all items in AGENTS.md have exact matches in CLAUDE.md

### D3: Fix README.md — Add Missing Documentation Links

**Priority:** 🟡 High
**File:** `README.md`
**Problems:**
1. Missing links to `REMEDIATION_KIMI2.md` and `STATUS_AUDIT_REPORT.md`
2. "Known Issues & Recommendations" only has 6 items, should have 8
3. Missing mention of `CONSISTENT.md` when created

**Fix:**
- Add `REMEDIATION_KIMI2.md` and `STATUS_AUDIT_REPORT.md` to Documentation table
- Add items #7 (ReDoS) and #8 (Simulated recordings) to Known Issues
- Reference `CONSISTENT.md` as the authoritative audit status document

---

## Phase 3: Cross-Document Gaps

### G1: Missing Security Rules in All Documents

**Priority:** 🟡 High
**Affected:** `CLAUDE.md`, `AGENTS.md`, `README.md`
**Problem:** The ReDoS fix and unbounded array fix are only mentioned in REMEDIATION files, not in the main documentation.
**Fix:** Add to all three:
- **ReDoS:** "Any app accepting user-supplied regex must limit `exec()` iterations to prevent catastrophic backtracking (e.g., 1000 iterations)."
- **Unbounded Arrays:** "Any function creating arrays from user input (e.g., factorial) must cap input size (e.g., 170 for factorial)."

### G2: Missing Recommendations

**Priority:** 🟡 Medium
**Affected:** `CLAUDE.md`
**Problem:** Recommendations #7-9 (ReDoS guards, replace remaining dangerouslySetInnerHTML, MediaRecorder implementation) are only in CLAUDE.md, not in AGENTS.md or README.md.
**Fix:** Add to AGENTS.md "Outstanding Issues" and README.md "Known Issues & Recommendations"

### G3: Missing Lessons Learned

**Priority:** 🟡 Medium
**Affected:** `AGENTS.md`
**Problem:** Lessons from kimi-2 remediation (ReDoS, unbounded arrays, `dangerouslySetInnerHTML` refactor) are not in AGENTS.md.
**Fix:** Add to AGENTS.md "Lessons Learned" section

### G4: Missing Troubleshooting Tips

**Priority:** 🟡 Medium
**Affected:** `AGENTS.md`
**Problem:** Troubleshooting tips for ReDoS, unbounded arrays, and CASCADE_WINDOWS z-index are not in AGENTS.md.
**Fix:** Add to AGENTS.md "Troubleshooting & Gotchas" section

---

## Phase 4: Mischaracterization Corrections

### M1: Fix osReducer.test.ts Mischaracterization in status_6.md

**Priority:** 🟡 Medium
**File:** `app/src/hooks/__tests__/osReducer.test.ts` (no code change needed, but document the correction)
**Problem:** `status_6.md` claims `osReducer.test.ts` says `osReducer` is "not exported" but the file literally says "exported directly."
**Fix:** Document in `CONSISTENT.md` that this was a misread. No code changes needed.

### M2: Fix Calculator "Stale Closure" Fix Characterization

**Priority:** 🟡 Medium
**File:** `app/src/apps/Calculator.tsx`
**Problem:** The dependency array in Calculator.tsx (`[inputDigit, inputDecimal, performOp, calculate, clear, backspace, percentage]`) already includes all handler functions. The "fix" claimed in `status_6.md` (Fix 6) is actually a no-op because there was no bug.
**Fix:** Document in `CONSISTENT.md` that the dependency array was already correct. No code changes needed.

---

## Phase 5: Deferred Items (No Action Needed, Document Only)

### DF1: useOS() Broad Subscription Optimization

**Status:** Deferred (not a bug, architectural improvement)
**Reason:** `AppShell` subscribes to full OS state. Fixing this requires splitting the monolithic reducer, creating selectors, and updating all consumers. Significant refactor beyond scope.
**Documentation:** Note in `CONSISTENT.md` as "deferred architectural improvement"

### DF2: handleMenuAction Refactor

**Status:** Deferred (not a bug, architectural improvement)
**Reason:** Functionally correct. Moving to hook/reducer would be cleaner but doesn't fix a bug.
**Documentation:** Note in `CONSISTENT.md` as "deferred architectural improvement"

---

## Execution Order

```
Phase 1 (Critical):
  1.1 C1: Add GlobalErrorBoundary around AppShell in App.tsx
  1.2 Verify: Build passes, TypeScript compiles

Phase 2 (Documentation):  
  2.1 D1: Create CONSISTENT.md
  2.2 D2: Update AGENTS.md with missing rules, gotchas, lessons
  2.3 D3: Update README.md with missing links and issues
  2.4 Verify: Cross-document consistency

Phase 3 (Cross-Document Gaps):
  3.1 G1: Add ReDoS and unbounded array rules to all docs
  3.2 G2: Propagate recommendations #7-9 to all docs
  3.3 G3: Add lessons learned to AGENTS.md
  3.4 G4: Add troubleshooting tips to AGENTS.md
  3.5 Verify: All docs tell the same story

Phase 4 (Corrections):
  4.1 M1: Document osReducer.test.ts misread in CONSISTENT.md
  4.2 M2: Document Calculator "fix" was no-op in CONSISTENT.md

Phase 5 (Deferred):
  5.1 Document DF1 and DF2 in CONSISTENT.md

Phase 6 (Final Verification):
  6.1 Run `npx tsc -b --noEmit`
  6.2 Run `npm run build`
  6.3 Verify all documents are consistent
  6.4 Commit all changes
```

---

## Verification Checklist

Before marking this plan complete, verify:

- [ ] `App.tsx` has `GlobalErrorBoundary` wrapping `AppShell`
- [ ] TypeScript compiles (`npx tsc -b --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] `CONSISTENT.md` exists and lists all findings
- [ ] `AGENTS.md` has ReDoS, unbounded array rules
- [ ] `AGENTS.md` has CASCADE_WINDOWS, keyboard stale closure gotchas
- [ ] `AGENTS.md` has `eval()`, `dangerouslySetInnerHTML`, ReDoS, unbounded array lessons
- [ ] `README.md` has all 8 known issues
- [ ] `README.md` links to `REMEDIATION_KIMI2.md` and `STATUS_AUDIT_REPORT.md`
- [ ] All three docs have identical security rules
- [ ] No contradictions between any two documents
