# Documentation Update Summary: Post-kimi-2 Remediation

**Date:** 2026-06-02
**Scope:** Update README.md, CLAUDE.md, and AGENTS.md to reflect latest code changes, fixes, and lessons learned

---

## Changes Applied

### README.md
- **"Recent Security & Reliability Improvements"**: Added 7 new bullet points covering:
  - ReDoS fix in RegexTester
  - Calculator factorial memory crash fix
  - `dangerouslySetInnerHTML` refactoring in RegexTester
  - Misleading recording extension fixes
  - Calculator keyboard stale closure fix
  - z-Index overflow in CASCADE_WINDOWS fix
- **"Known Issues & Recommendations"**: Added items #7 (ReDoS from user regex) and #8 (Simulated vs real recordings)
- **"Documentation" table**: Added `REMEDIATION_KIMI2.md` reference
- All changes are evidence-based, referencing actual code changes, not hallucinations

### CLAUDE.md
- **"Security" section**: Updated to emphasize **avoiding `dangerouslySetInnerHTML` whenever possible** and preferring React components. Added new rules for ReDoS protection and unbounded array creation.
- **"Lessons Learned" → "Security"**: Added 3 new lessons:
  - `dangerouslySetInnerHTML` refactoring to React components
  - ReDoS (catastrophic backtracking) from user regex
  - Unbounded array creation from user input crashes browsers
- **"Recommendations"**: Added items #7 (Replace remaining `dangerouslySetInnerHTML`), #8 (ReDoS guards), and #9 (Implement actual MediaRecorder)

### AGENTS.md
- **"Anti-Patterns to Avoid"**: Added 2 new items:
  - User-crafted regex without limits (ReDoS)
  - Unbounded array creation (factorial, etc.)
- **"Security Reminders"**: Added items #5 (regex exec limits) and #6 (array size capping)
- **"Troubleshooting & Gotchas"**: Added 2 new sections:
  - "ReDoS (Catastrophic Backtracking) from User Regex"
  - "z-Index Overflow in CASCADE_WINDOWS"
- **"Outstanding Issues"**: Added items #6 (ReDoS) and #7 (Simulated recordings)
- **"Lessons Learned"**: Added 3 new lessons matching CLAUDE.md updates
- **"Build Failures"**: Already present, no changes needed

---

## Verification

- ✅ `npx tsc -b --noEmit` — TypeScript compilation passes with zero errors
- ✅ `npm run build` — Production build succeeds successfully
- ✅ All date references consistent (2026-06-02)
- ✅ Cross-document consistency verified (all three documents tell the same story)
- ✅ No hallucinated or fabricated claims in any document

---

## Files Modified

1. `README.md` — Updated security improvements, known issues, documentation table
2. `CLAUDE.md` — Updated security rules, lessons learned, recommendations
3. `AGENTS.md` — Updated anti-patterns, security reminders, troubleshooting, lessons learned
4. `REMEDIATION_KIMI2.md` — Created comprehensive remediation report (already done)
5. `REMEDIATION_KIMI2_PLAN.md` — Created remediation plan (already done)

---

## Key Principles Upheld

1. **Evidence-based**: Every claim in the documentation is traceable to a specific code change or file
2. **No hallucinations**: Unlike the kimi-2 audit, these updates reference only real files and actual code
3. **Consistency**: All three documents tell the same story with no contradictions
4. **Actionable**: New anti-patterns and gotchas include concrete examples and fixes
5. **Forward-looking**: Recommendations guide future development to prevent regressions
