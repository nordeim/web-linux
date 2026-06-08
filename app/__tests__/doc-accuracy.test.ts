/// <reference types="node" />
/**
 * Documentation accuracy tests.
 *
 * These tests assert that the high-level docs in the repo root
 * (README.md, CLAUDE.md, AGENTS.md, GEMINI.md, Project_Architecture_Document.md)
 * are consistent with the actual codebase. They catch drift between docs
 * and reality before it accumulates.
 *
 * When the codebase changes (apps added, tests added, etc.), update the
 * docs first or in lockstep, then update the counts below.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const repoRoot = resolve(__dirname, '../..');
const readDoc = (relPath: string) =>
  readFileSync(resolve(repoRoot, relPath), 'utf-8');

describe('Documentation accuracy - app and test counts', () => {
  describe('App count', () => {
    it('README mentions 56 apps', () => {
      const readme = readDoc('README.md');
      expect(readme).toMatch(/56\s+(functional|pre-installed|apps)/);
    });

    it('AGENTS.md mentions 56 apps', () => {
      const agents = readDoc('AGENTS.md');
      expect(agents).toMatch(/56\s+(pre-installed|functional|apps)/);
    });

    it('GEMINI.md mentions 56 applications (not 55)', () => {
      const gemini = readDoc('GEMINI.md');
      expect(gemini).toContain('56 functional applications');
      // The bug we are fixing: the architectural-pillars section still says 55
      expect(gemini).not.toMatch(/code-split\s+55\s+applications/);
    });

    it('Project_Architecture_Document.md says 56 applications', () => {
      const arch = readDoc('Project_Architecture_Document.md');
      expect(arch).toMatch(/Total Applications\s*\|\s*56/);
    });
  });

  describe('Test counts (current: 283 total = 233 frontend + 50 backend)', () => {
    it('Project_Architecture_Document.md says 29 frontend test files', () => {
      const arch = readDoc('Project_Architecture_Document.md');
      expect(arch).toMatch(/Frontend Test Files\s*\|\s*29/);
    });

    it('Project_Architecture_Document.md says 16 backend test files', () => {
      const arch = readDoc('Project_Architecture_Document.md');
      expect(arch).toMatch(/Backend Test Files\s*\|\s*16/);
    });

    it('Project_Architecture_Document.md says 283 total tests', () => {
      const arch = readDoc('Project_Architecture_Document.md');
      expect(arch).toMatch(/Total Tests\s*\|\s*283/);
    });

    it('README.md mentions 233 frontend + 50 backend tests', () => {
      const readme = readDoc('README.md');
      expect(readme).toMatch(/233\s+frontend\s*\+\s*50\s+backend/);
    });

    it('CLAUDE.md says 233 frontend + 50 backend tests (283 total)', () => {
      const claude = readDoc('CLAUDE.md');
      expect(claude).toMatch(/233\s+tests\s+frontend\s*\+\s*50\s+backend\s+tests/);
    });
  });
});
