/**
 * VFS traversal helpers — extracted from inline closures to keep code DRY.
 *
 * - `walkAndDelete`  : deletes awitcha node and all descendants (used in deleteNode, emptyTrash)
 * - `recurseMoveNode`: moves node to a new parent and rewrites child paths (used in moveToTrash)
 *
 * @module vfsHelpers
 */
export type VFSHelperNode = Partial<FileSystemNode> & { id: string; parentId: string | null };

import type { FileSystemNode } from '@/types';

/** Delete a node and all its descendants from the `nodes` record. Returns the IDs deleted. */
export function walkAndDelete(
  nodes: Record<string, FileSystemNode>,
  nodeId: string
): string[] {
  const deleted: string[] = [];
  const node = nodes[nodeId];
  if (!node) return deleted;
  if (node.type === 'folder') {
    Object.values(nodes)
      .filter((n) => n.parentId === nodeId)
      .forEach((n) => deleted.push(...walkAndDelete(nodes, n.id)));
  }
  delete nodes[nodeId];
  deleted.push(nodeId);
  return deleted;
}

/** Move a node to a new parent and bump modifiedAt on the entire subtree. */
export function recurseMoveNode(
  nodes: Record<string, FileSystemNode>,
  nodeId: string,
  newParentId: string
): void {
  const node = nodes[nodeId];
  if (!node) return;
  nodes[nodeId] = { ...node, parentId: newParentId, modifiedAt: Date.now() };
  if (node.type === 'folder') {
    Object.values(nodes)
      .filter((n) => n.parentId === nodeId)
      .forEach((n) => recurseMoveNode(nodes, n.id, nodeId));
  }
}
