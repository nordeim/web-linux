// ============================================================
// storageValidation — Schema validation for localStorage persistence
// Uses zod for runtime validation of stored data
// ============================================================

import { z } from 'zod';
import type { DesktopIcon, FileSystemState } from '@/types';

// ---- Desktop Icon Schema ----
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const DesktopIconSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  appId: z.string().optional(),
  fileSystemNodeId: z.string().optional(),
  position: PositionSchema,
  isSelected: z.boolean(),
});

// ---- File System Schema ----
const FileSystemNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['file', 'folder']),
  parentId: z.string().nullable(),
  createdAt: z.number(),
  modifiedAt: z.number(),
  content: z.string().optional(),
  size: z.number().optional(),
  isHidden: z.boolean().optional(),
});

const TrashItemMetadataSchema = z.object({
  originalPath: z.string(),
  deletedAt: z.number(),
});

const FileSystemStateSchema = z.object({
  nodes: z.record(z.string(), FileSystemNodeSchema),
  trashMetadata: z.record(z.string(), TrashItemMetadataSchema),
});

// ---- Storage Keys ----
const DESKTOP_ICONS_KEY = 'ubuntuos_desktop_icons';
const FILESYSTEM_KEY = 'ubuntuos_filesystem_v2';
const LEGACY_FILESYSTEM_KEY = 'ubuntuos_filesystem';

/**
 * Validate and load desktop icons from localStorage.
 * Falls back to the provided defaults if validation fails.
 */
export function validateDesktopIcons(defaultIcons: DesktopIcon[]): DesktopIcon[] {
  try {
    const saved = localStorage.getItem(DESKTOP_ICONS_KEY);
    if (!saved) return defaultIcons;
    const parsed = JSON.parse(saved);
    const result = z.array(DesktopIconSchema).safeParse(parsed);
    return result.success ? result.data : defaultIcons;
  } catch {
    return defaultIcons;
  }
}

/** Persist validated desktop icons to localStorage */
export function saveDesktopIcons(icons: DesktopIcon[]): void {
  try {
    localStorage.setItem(DESKTOP_ICONS_KEY, JSON.stringify(icons));
  } catch { /* ignore */ }
}

/**
 * Validate and load the file system from localStorage.
 * Falls back to the provided defaults if validation fails.
 * Supports migration from the legacy key.
 */
export function validateFileSystem(defaultFS: FileSystemState): FileSystemState {
  try {
    // Try the new v2 key first
    let saved = localStorage.getItem(FILESYSTEM_KEY);
    if (!saved) {
      // Fallback to legacy key
      saved = localStorage.getItem(LEGACY_FILESYSTEM_KEY);
    }
    if (!saved) return defaultFS;
    const parsed = JSON.parse(saved);
    const result = FileSystemStateSchema.safeParse(parsed);
    if (result.success) {
      // On successful validation with legacy key, save to new key
      if (!localStorage.getItem(FILESYSTEM_KEY)) {
        localStorage.setItem(FILESYSTEM_KEY, saved);
      }
      return result.data;
    }
    return defaultFS;
  } catch {
    return defaultFS;
  }
}

/** Persist validated file system to localStorage */
export function saveFileSystem(fs: FileSystemState): void {
  try {
    localStorage.setItem(FILESYSTEM_KEY, JSON.stringify(fs));
  } catch { /* ignore */ }
}
