// ============================================================
// generateId — Unified collision-resistant ID generator
// Replaces ad-hoc Math.random() + Date.now() implementations
// with a single shared utility.
// ============================================================

/**
 * Generate a collision-resistant unique ID string.
 * Uses `crypto.randomUUID()` where available; falls back to
 * a timestamp + random component.
 *
 * This replaces the two separate (and inconsistent) inline
 * implementations that were previously in useOSStore.tsx and
 * useFileSystem.ts.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
