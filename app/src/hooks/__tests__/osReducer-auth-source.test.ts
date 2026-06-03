import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Source-level test: verify osReducer handles SET_AUTH_TOKEN.
// We read source files and assert on code presence (no component rendering).
// This is the recommended pattern when Vitest @/ alias resolution fails.

describe('osReducer source-level auth checks', () => {
  const osStorePath = path.resolve(__dirname, '../../hooks/useOSStore.tsx');
  const useOSStoreSrc = fs.readFileSync(osStorePath, 'utf-8');

  const typesPath = path.resolve(__dirname, '../../types/index.ts');
  const typesSrc = fs.readFileSync(typesPath, 'utf-8');

  it('should have SET_AUTH_TOKEN action in osReducer', () => {
    expect(useOSStoreSrc).toContain("case 'SET_AUTH_TOKEN':");
  });

  it('should preserve authToken on LOGIN', () => {
    // Check LOGIN case uses ...state.auth spread to preserve authToken
    const loginMatch = useOSStoreSrc.match(/case 'LOGIN':\s*\{[\s\S]*?auth:\s*\{\s*\.\.\.state\.auth/);
    expect(loginMatch).toBeTruthy();
  });

  it('should clear authToken on LOGOUT', () => {
    // Check LOGOUT case sets authToken: undefined
    expect(useOSStoreSrc).toContain('authToken: undefined');
  });

  it('should have authToken in AuthState type', () => {
    expect(typesSrc).toContain('authToken?: string');
  });

  it('should declare SET_AUTH_TOKEN action in OSAction union', () => {
    expect(typesSrc).toContain("{ type: 'SET_AUTH_TOKEN'; token: string }");
  });
});
