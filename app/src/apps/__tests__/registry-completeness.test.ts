/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Registry Completeness Tests
 * 
 * These tests verify that all apps routed in AppRouter.tsx
 * have corresponding entries in registry.ts for app discovery.
 */

describe('Registry Completeness', () => {
  const readSource = (filePath: string): string => {
    return readFileSync(resolve(__dirname, filePath), 'utf-8');
  };

  it('should have registry entries for all apps routed in AppRouter', () => {
    const appRouterSource = readSource('../AppRouter.tsx');
    const registrySource = readSource('../registry.ts');

    // Extract all case statements from AppRouter (excluding 'default')
    const caseRegex = /case '([^']+)':/g;
    const routedApps: string[] = [];
    let match;
    while ((match = caseRegex.exec(appRouterSource)) !== null) {
      if (match[1] !== 'default') {
        routedApps.push(match[1]);
      }
    }

    // Extract all id entries from registry
    const idRegex = /id: '([^']+)'/g;
    const registeredApps: string[] = [];
    while ((match = idRegex.exec(registrySource)) !== null) {
      registeredApps.push(match[1]);
    }

    // Verify all routed apps are registered
    const missingApps = routedApps.filter(
      (app) => !registeredApps.includes(app)
    );
    
    expect(missingApps).toEqual([]);
  });

  it('should not have duplicate app IDs in registry', () => {
    const registrySource = readSource('../registry.ts');
    
    const idRegex = /id: '([^']+)'/g;
    const appIds: string[] = [];
    let match;
    while ((match = idRegex.exec(registrySource)) !== null) {
      appIds.push(match[1]);
    }

    const uniqueIds = [...new Set(appIds)];
    expect(appIds.length).toBe(uniqueIds.length);
  });
});
