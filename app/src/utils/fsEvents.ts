/**
 * Tiny typed event bus for cross-cutting errors that originate from
 * non-React modules (e.g. localStorage quota errors thrown by
 * `useFileSystem.saveFS`).
 *
 * The OS provider subscribes once at mount and dispatches a user-visible
 * notification on every event, so filesystems can signal persistence
 * failures without depending on React context.
 *
 * This avoids the prior anti-pattern of `try { save() } catch { /* ignore *\/ }`
 * which silently dropped data.
 */

export type FileSystemSaveError = {
  kind: 'quota-exceeded' | 'unknown';
  message: string;
  cause?: unknown;
};

type Listener = (err: FileSystemSaveError) => void;

const listeners = new Set<Listener>();

export function emitFileSystemSaveError(err: FileSystemSaveError): void {
  for (const l of listeners) {
    try {
      l(err);
    } catch {
      // Never let a listener crash the emitter.
    }
  }
}

export function subscribeFileSystemSaveError(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isQuotaExceededError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // DOMException name in browsers; fall back to message inspection.
  if ((err as DOMException).name === 'QuotaExceededError') return true;
  if ((err as DOMException).code === 22) return true; // legacy code
  return /quota/i.test(err.message);
}
