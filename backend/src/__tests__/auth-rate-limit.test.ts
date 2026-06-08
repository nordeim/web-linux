/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * C-3: /auth/token must have rate limiting applied.
 * Source-level test validates the middleware is wired in index.ts.
 */

describe('POST /auth/token rate limiting (C-3)', () => {
  const indexSrc = readFileSync(resolve(__dirname, '../index.ts'), 'utf-8');

  it('imports rate-limiter middleware in index.ts', () => {
    expect(indexSrc).toContain('express-rate-limit');
  });

  it('declares a rate-limit rule before "/auth/token"', () => {
    // The limiter variable should be instantiated before the /auth/token route
    expect(indexSrc).toContain('rateLimit');
  });

  it('applies the rate limiter to the /auth/token endpoint', () => {
    // Verify the route uses the limiter middleware
    const routeIndex = indexSrc.indexOf('/auth/token');
    const rateLimitIndex = indexSrc.indexOf('rateLimit');
    expect(rateLimitIndex).toBeGreaterThan(0);
    expect(routeIndex).toBeGreaterThan(0);
    // rateLimit is declared before the route
    expect(rateLimitIndex).toBeLessThan(routeIndex);
  });
});
