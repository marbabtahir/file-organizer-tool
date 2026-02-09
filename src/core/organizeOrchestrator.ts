/**
 * =============================================================================
 * ORGANIZE ORCHESTRATOR
 * =============================================================================
 *
 * Decides where each file should go (by type or by date), builds the list
 * of MoveActions, and optionally executes them. Used by the organize command.
 */

import path from 'path';
import fs from 'fs/promises';
import type { MoveAction, OrganizeBy, CustomRule } from '../types';
import { listFiles, ensureDir, moveFile } from '../services/fileService';
import { getMetadata } from '../services/metadataService';
import { getFolderForExtension } from './categoryMap';
import { getExtension, joinPath } from '../utils';
import { formatDateISO, MONTH_NAMES } from '../utils/formatUtils';

/**
 * Applies custom rules from config. First matching rule wins.
 * Returns folder name or null if no rule matched.
 */
function matchCustomRules(
  filePath: string,
  ext: string,
  sizeBytes: number,
  rules: CustomRule[]
): string | null {
  for (const rule of rules) {
    if (rule.extension && rule.extension.toLowerCase() !== ext) continue;
    if (rule.minSizeMB != null && sizeBytes < rule.minSizeMB * 1024 * 1024) continue;
    if (rule.maxSizeMB != null && sizeBytes > rule.maxSizeMB * 1024 * 1024) continue;
    return rule.folder;
  }
  return null;
}

/**
 * Gets the "date" for a file: creation time, or EXIF date for images.
 */
async function getFileDate(filePath: string): Promise<{ year: number; month: number }> {
  const meta = await getMetadata(filePath);
  const d = meta.createdAt;
  // If we have EXIF DateTimeOriginal, we could use that for images; for now use birthtime
  return { year: d.getFullYear(), month: d.getMonth() };
}

/**
 * Builds the target folder path when organizing by date: e.g. "2026/February"
 */
async function getTargetFolderByDate(
  rootPath: string,
  filePath: string
): Promise<string> {
  const { year, month } = await getFileDate(filePath);
  const monthName = MONTH_NAMES[month];
  return joinPath(rootPath, String(year), monthName);
}

/**
 * Builds the target folder path when organizing by type (and optional custom rules).
 */
function getTargetFolderByType(
  rootPath: string,
  ext: string,
  sizeBytes: number,
  customRules: CustomRule[]
): string {
  const customFolder = matchCustomRules('', ext, sizeBytes, customRules);
  const folder = customFolder ?? getFolderForExtension(ext);
  return joinPath(rootPath, folder);
}

/**
 * Plans all moves for the given directory: list files, decide destination for each.
 */
export async function planOrganize(
  rootPath: string,
  options: {
    by: OrganizeBy;
    recursive: boolean;
    customRules?: CustomRule[];
  }
): Promise<MoveAction[]> {
  const files = await listFiles(rootPath, options.recursive);
  const actions: MoveAction[] = [];

  for (const filePath of files) {
    const ext = getExtension(filePath);
    const baseName = path.basename(filePath);
    let targetDir: string;

    if (options.by === 'date') {
      targetDir = await getTargetFolderByDate(rootPath, filePath);
    } else {
      const stat = await fs.stat(filePath);
      targetDir = getTargetFolderByType(
        rootPath,
        ext,
        stat.size,
        options.customRules ?? []
      );
    }

    const targetPath = joinPath(targetDir, baseName);
    if (targetPath === filePath) continue; // already in place
    if (path.dirname(filePath) === targetDir) continue; // same folder

    actions.push({
      from: filePath,
      to: targetPath,
      fileName: baseName
    });
  }

  return actions;
}

/**
 * Executes a list of move actions (creates dirs and moves files).
 */
export async function executeOrganize(actions: MoveAction[]): Promise<void> {
  for (const action of actions) {
    await ensureDir(path.dirname(action.to));
    await moveFile(action.from, action.to);
  }
}
