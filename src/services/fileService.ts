/**
 * =============================================================================
 * FILE SERVICE
 * =============================================================================
 *
 * Low-level file operations: list files, move, rename, ensure directory.
 * Uses Node.js fs.promises for async, non-blocking I/O. All paths go through
 * path.join/path.resolve for cross-platform support.
 */

import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';
import type { MoveAction } from '../types';
import { joinPath, isFile, isDirectory } from '../utils';

/**
 * Recursively collects all file paths under dirPath (not directories).
 * If recursive is false, only returns files directly in dirPath.
 */
export async function listFiles(
  dirPath: string,
  recursive: boolean
): Promise<string[]> {
  const results: string[] = [];

  async function walk(current: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (err) {
      // Permission denied or not a directory - skip
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isFile()) {
        results.push(fullPath);
      } else if (entry.isDirectory() && recursive) {
        await walk(fullPath);
      }
    }
  }

  await walk(dirPath);
  return results;
}

/**
 * Ensures a directory exists; creates it (and parents) if not.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Moves a file from source to destination.
 * If destination directory doesn't exist, creates it.
 */
export async function moveFile(from: string, to: string): Promise<void> {
  const toDir = path.dirname(to);
  await ensureDir(toDir);
  await fs.rename(from, to);
}

/**
 * Executes a list of move actions (used after dry-run or when user confirms).
 */
export async function executeMoves(actions: MoveAction[]): Promise<void> {
  for (const action of actions) {
    await moveFile(action.from, action.to);
  }
}

/**
 * Renames (moves) a file to a new path in the same directory or another.
 */
export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  const toDir = path.dirname(newPath);
  await ensureDir(toDir);
  await fs.rename(oldPath, newPath);
}

/**
 * Deletes a file. Used for duplicate cleanup (with confirmation).
 */
export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}
