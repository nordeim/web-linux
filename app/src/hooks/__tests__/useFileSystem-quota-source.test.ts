/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Source-level regression test for the localStorage quota-error path.
 *
 * The old `useFileSystem.saveFS` used `catch { /* ignore *\/ }` and
 * silently lost data. After remediation it must:
 * 1. Import the fsEvents module
 * 2. Call `emitFileSystemSaveError` on save failure
 * 3. Classify the error kind (quota-exceeded vs unknown)
 *
 * OSProvider must:
 * 1. Import subscribeFileSystemSaveError
 * 2. Register a listener that dispatches ADD_NOTIFICATION
 */
describe('useFileSystem quota-error source contracts', () => {
  const useFileSystemSrc = readFileSync(
    resolve(__dirname, '../useFileSystem.ts'),
    'utf-8'
  );
  const useOSStoreSrc = readFileSync(
    resolve(__dirname, '../useOSStore.tsx'),
    'utf-8'
  );

  describe('useFileSystem.ts', () => {
    it('imports the fsEvents module', () => {
      expect(useFileSystemSrc).toMatch(/from\s+['"]@\/utils\/fsEvents['"]/);
    });

    it('saveFS no longer silently ignores errors', () => {
      const saveFSMatch = useFileSystemSrc.match(/function\s+saveFS\s*\([^)]*\)\s*\{[\s\S]*?\n\}/);
      expect(saveFSMatch, 'expected a saveFS function').not.toBeNull();
      const body = saveFSMatch![0];
      expect(body).not.toMatch(/catch\s*\{\s*\/\*\s*ignore\s*\*\/\s*\}/);
      expect(body).toMatch(/emitFileSystemSaveError/);
    });

    it('classifies the error kind (quota-exceeded vs unknown)', () => {
      const saveFSMatch = useFileSystemSrc.match(/function\s+saveFS\s*\([^)]*\)\s*\{[\s\S]*?\n\}/);
      const body = saveFSMatch![0];
      expect(body).toMatch(/isQuotaExceededError/);
      expect(body).toMatch(/quota-exceeded/);
    });
  });

  describe('useOSStore.tsx', () => {
    it('imports the fsEvents module', () => {
      expect(useOSStoreSrc).toMatch(/from\s+['"]@\/utils\/fsEvents['"]/);
    });

    it('OSProvider subscribes to fsEvents and dispatches a notification', () => {
      const providerMatch = useOSStoreSrc.match(/export const OSProvider[\s\S]*?^\};/m);
      expect(providerMatch, 'expected to find OSProvider body').not.toBeNull();
      const body = providerMatch![0];
      expect(body).toMatch(/subscribeFileSystemSaveError/);
      expect(body).toMatch(/ADD_NOTIFICATION/);
      expect(body).toMatch(/['"]Storage full['"]/);
    });
  });
});
