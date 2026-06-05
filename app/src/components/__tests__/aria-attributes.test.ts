/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Accessibility (ARIA) Source Code Validation Tests
 * 
 * These tests validate that ARIA attributes exist in the source code
 * for critical components. This approach avoids infra issues (missing jsdom,
 * @/ alias resolution) while still providing automated verification.
 */

describe('Accessibility - ARIA Attributes in Source', () => {
  const readSource = (filePath: string): string => {
    return readFileSync(resolve(__dirname, filePath), 'utf-8');
  };

  describe('Dock.tsx', () => {
    const source = readSource('../Dock.tsx');

    it('has aria-label on Show Applications button', () => {
      expect(source).toContain('aria-label="Show Applications"');
    });

    it('has aria-pressed on Show Applications button', () => {
      expect(source).toContain('aria-pressed={state.appLauncherOpen}');
    });

    it('has dynamic aria-label on dock item buttons', () => {
      expect(source).toContain('aria-label={isTrash');
      expect(source).toContain('app?.name || appId}');
    });

    it('has aria-hidden on icon elements', () => {
      expect(source).toContain('aria-hidden="true"');
    });
  });

  describe('WindowFrame.tsx', () => {
    const source = readSource('../WindowFrame.tsx');

    it('has aria-label on Minimize button', () => {
      expect(source).toContain('aria-label="Minimize"');
    });

    it('has dynamic aria-label on Maximize/Restore button', () => {
      expect(source).toContain('aria-label={isMaximized');
    });

    it('has aria-label on Close button', () => {
      expect(source).toContain('aria-label="Close"');
    });
  });

  describe('Desktop.tsx', () => {
    const source = readSource('../Desktop.tsx');

    it('has role="list" on desktop container', () => {
      expect(source).toContain('role="list"');
    });

    it('has aria-label on desktop container', () => {
      expect(source).toContain('aria-label="Desktop"');
    });

    it('has role="listitem" on desktop icons', () => {
      expect(source).toContain('role="listitem"');
    });

    it('has tabIndex on desktop icons', () => {
      expect(source).toContain('tabIndex={0}');
    });

    it('has keyboard handler for Enter and Space', () => {
      expect(source).toContain("e.key === 'Enter' || e.key === ' '")
    });
  });

  describe('Calculator.tsx', () => {
    const source = readSource('../../apps/Calculator.tsx');

    it('has aria-label on history toggle button', () => {
      expect(source).toContain('aria-label="Toggle history"');
    });

    it('has aria-label on backspace action button', () => {
      expect(source).toContain('ariaLabel="Backspace"');
    });

    it('has aria-label on delete action button', () => {
      expect(source).toContain('ariaLabel="Delete"');
    });
  });

  describe('TextEditor.tsx', () => {
    const source = readSource('../../apps/TextEditor.tsx');

    it('has aria-label on zoom out button', () => {
      expect(source).toContain('aria-label="Zoom out"');
    });

    it('has aria-label on zoom in button', () => {
      expect(source).toContain('aria-label="Zoom in"');
    });

    it('has aria-label on close find button', () => {
      expect(source).toContain('aria-label="Close find"');
    });

    it('has aria-label on close tab button', () => {
      expect(source).toContain('aria-label="Close tab"');
    });
  });

  describe('FileManager.tsx', () => {
    const source = readSource('../../apps/FileManager.tsx');

    it('has aria-label on navigate up button', () => {
      expect(source).toContain('aria-label="Go to parent folder"');
    });

    it('has aria-label on grid view button', () => {
      expect(source).toContain('aria-label="Grid view"');
    });

    it('has aria-label on list view button', () => {
      expect(source).toContain('aria-label="List view"');
    });

    it('has aria-label on new folder button', () => {
      expect(source).toContain('aria-label="New Folder"');
    });

    it('has aria-label on new file button', () => {
      expect(source).toContain('aria-label="New File"');
    });
  });

  describe('Settings.tsx', () => {
    const source = readSource('../../apps/Settings.tsx');

    it('has aria-label on Toggle component', () => {
      expect(source).toContain('aria-label={ariaLabel || (value ?');
    });

    it('has aria-pressed on Toggle component', () => {
      expect(source).toContain('aria-pressed={value}');
    });

    it('has aria-label on accent color buttons', () => {
      expect(source).toContain('aria-label={`Accent color: ${c.name}`}');
    });

    it('has aria-pressed on accent color buttons', () => {
      expect(source).toContain('aria-pressed={state.theme.accent === c.value}');
    });
  });
});

describe('Accessibility - Focus Visible Styles', () => {
  const readCssSource = (filePath: string): string => {
    return readFileSync(resolve(__dirname, filePath), 'utf-8');
  };

  it('has :focus-visible styles in index.css', () => {
    const cssSource = readCssSource('../../index.css');
    expect(cssSource).toContain(':focus-visible');
    expect(cssSource).toContain('outline:');
    expect(cssSource).toContain('var(--border-focus)');
  });

  it('removes default outline for mouse users', () => {
    const cssSource = readCssSource('../../index.css');
    expect(cssSource).toContain(':focus:not(:focus-visible)');
    expect(cssSource).toContain('outline: none;');
  });
});
