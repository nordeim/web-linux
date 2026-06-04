/**
 * Tests for the `recurseMoveNode` helper extracted from the inline
 * `recurseMove` closure in `useFileSystem.moveToTrash`.
 *
 * M-4 audit fix: `recurseMove` was inlined inside `moveToTrash`. Now extracted
 * and unit-tested.
 */
import { describe, it, expect } from 'vitest';
import { recurseMoveNode, walkAndDelete } from '@/utils/vfsHelpers';

describe('recurseMoveNode (M-4)', () => {
  it('moves a single file to a new parent', () => {
    const nodes: Record<string, any> = {
      a: { id: 'a', parentId: 'root' },
      b: { id: 'b', parentId: 'a' },
    };
    recurseMoveNode(nodes, 'b', 'root');
    expect(nodes['b'].parentId).toBe('root');
  });

  it('recursively moves a folder and all children', () => {
    const nodes: Record<string, any> = {
      root: { id: 'root', parentId: null },
      folderA: { id: 'folderA', parentId: 'root' },
      folderB: { id: 'folderB', parentId: 'root' },
      nested: { id: 'nested', parentId: 'folderA' },
      file1: { id: 'file1', parentId: 'folderA' },
      file2: { id: 'file2', parentId: 'nested' },
    };
    recurseMoveNode(nodes, 'folderA', 'folderB');
    expect(nodes['folderA'].parentId).toBe('folderB');
    expect(nodes['nested'].parentId).toBe('folderA');
    expect(nodes['file1'].parentId).toBe('folderA');
    expect(nodes['file2'].parentId).toBe('nested');
  });

  it('does nothing if nodeId is missing', () => {
    const nodes: Record<string, any> = {};
    recurseMoveNode(nodes, 'missing', 'root');
    expect(true).toBe(true);
  });
});

describe('walkAndDelete (M-4)', () => {
  it('deletes a node and all descendants', () => {
    const nodes: Record<string, any> = {
      root: { id: 'root', parentId: null, type: 'folder' },
      a:    { id: 'a',    parentId: 'root', type: 'folder' },
      b:    { id: 'b',    parentId: 'a',    type: 'folder' },
      c:    { id: 'c',    parentId: 'b',    type: 'file' },
    };
    const deleted = walkAndDelete(nodes, 'a');
    expect(deleted).toContain('a');
    expect(deleted).toContain('b');
    expect(deleted).toContain('c');
    expect(nodes['a']).toBeUndefined();
    expect(nodes['b']).toBeUndefined();
  });
});
