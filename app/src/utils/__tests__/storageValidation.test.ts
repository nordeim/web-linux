// ============================================================
// storageValidation tests — localStorage schema validation
// (TDD approach: test written first, source code already correct)
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { validateDesktopIcons, validateFileSystem, saveDesktopIcons, saveFileSystem } from '../storageValidation';
import type { DesktopIcon, FileSystemState } from '@/types';

describe('validateDesktopIcons', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when localStorage empty', () => {
    const defaults: DesktopIcon[] = [
      { id: 'test-icon-1', name: 'Test', icon: 'Home', position: { x: 0, y: 0 }, isSelected: false },
    ];
    const result = validateDesktopIcons(defaults);
    expect(result).toEqual(defaults);
  });

  it('returns parsed data when localStorage has valid data', () => {
    const stored: DesktopIcon[] = [
      { id: 'stored-icon-1', name: 'Store Icon', icon: 'Settings', position: { x: 10, y: 20 }, isSelected: true },
    ];
    localStorage.setItem('ubuntuos_desktop_icons', JSON.stringify(stored));
    const defaults: DesktopIcon[] = [
      { id: 'default-icon-1', name: 'Default Icon', icon: 'Home', position: { x: 0, y: 0 }, isSelected: false },
    ];
    const result = validateDesktopIcons(defaults);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('stored-icon-1');
    expect(result[0].name).toBe('Store Icon');
  });

  it('returns defaults when localStorage has corrupted data', () => {
    const defaults: DesktopIcon[] = [
      { id: 'default-icon-1', name: 'Default Icon', icon: 'Home', position: { x: 0, y: 0 }, isSelected: false },
    ];
    localStorage.setItem('ubuntuos_desktop_icons', 'not-valid-json');
    const result = validateDesktopIcons(defaults);
    expect(result).toEqual(defaults);
  });

  it('returns defaults when localStorage has invalid schema', () => {
    const defaults: DesktopIcon[] = [
      { id: 'default-icon-1', name: 'Default Icon', icon: 'Home', position: { x: 0, y: 0 }, isSelected: false },
    ];
    localStorage.setItem('ubuntuos_desktop_icons', JSON.stringify([{ id: 'bad', name: 'Bad' /* missing icon, position, isSelected */ }]));
    const result = validateDesktopIcons(defaults);
    expect(result).toEqual(defaults);
  });
});

describe('validateFileSystem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createDefaultFS = (): FileSystemState => ({
    nodes: {
      node1: { id: 'node1', name: 'root', type: 'folder', parentId: null, createdAt: 0, modifiedAt: 0 },
    },
    trashMetadata: {},
  });

  it('returns defaults when localStorage empty', () => {
    const defaults = createDefaultFS();
    const result = validateFileSystem(defaults);
    expect(result).toEqual(defaults);
  });

  it('returns parsed data when localStorage has valid data', () => {
    const stored: FileSystemState = {
      nodes: {
        node1: { id: 'node1', name: 'root', type: 'folder', parentId: null, createdAt: Date.now(), modifiedAt: Date.now() },
      },
      trashMetadata: {},
    };
    localStorage.setItem('ubuntuos_filesystem_v2', JSON.stringify(stored));
    const result = validateFileSystem(createDefaultFS());
    expect(result.nodes?.node1).toBeDefined();
    expect(result.nodes?.node1.name).toBe('root');
  });

  it('returns defaults when localStorage has corrupted data', () => {
    localStorage.setItem('ubuntuos_filesystem_v2', 'not-valid-json');
    const defaults = createDefaultFS();
    const result = validateFileSystem(defaults);
    expect(result).toEqual(defaults);
  });

  it('returns defaults when localStorage has invalid schema', () => {
    localStorage.setItem('ubuntuos_filesystem_v2', JSON.stringify({ bad: 'data' }));
    const defaults = createDefaultFS();
    const result = validateFileSystem(defaults);
    expect(result).toEqual(defaults);
  });
});

describe('saveDesktopIcons', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes desktop icons to localStorage', () => {
    const icons: DesktopIcon[] = [
      { id: 'test-icon-1', name: 'Test Icon', icon: 'Home', position: { x: 10, y: 20 }, isSelected: true },
    ];
    expect(localStorage.getItem('ubuntuos_desktop_icons')).toBeNull();
    saveDesktopIcons(icons);
    const stored = localStorage.getItem('ubuntuos_desktop_icons');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(icons);
  });
});

describe('saveFileSystem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes file system to localStorage', () => {
    const fs: FileSystemState = {
      nodes: {
        node1: { id: 'node1', name: 'root', type: 'folder', parentId: null, createdAt: 0, modifiedAt: 0 },
      },
      trashMetadata: {},
    };
    expect(localStorage.getItem('ubuntuos_filesystem_v2')).toBeNull();
    saveFileSystem(fs);
    const stored = localStorage.getItem('ubuntuos_filesystem_v2');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(fs);
  });
});
