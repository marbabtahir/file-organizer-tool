/**
 * =============================================================================
 * RENAME ORCHESTRATOR
 * =============================================================================
 *
 * Applies a template like "{date}_{index}" to files and produces RenameActions.
 * Placeholders: {date}, {original}, {index}, {ext}, {size}
 */

import path from 'path';
import fs from 'fs/promises';
import type { RenameAction } from '../types';
import { listFiles } from '../services/fileService';
import { getMetadata } from '../services/metadataService';
import { getExtension, getNameWithoutExtension, joinPath } from '../utils';
import { formatBytes, formatDateISO } from '../utils/formatUtils';

const PLACEHOLDERS = ['date', 'original', 'index', 'ext', 'size'] as const;

/**
 * Replaces placeholders in template with values for one file.
 */
function applyTemplate(
  template: string,
  values: { date: string; original: string; index: number; ext: string; size: string }
): string {
  let result = template;
  result = result.replace(/\{date\}/g, values.date);
  result = result.replace(/\{original\}/g, values.original);
  result = result.replace(/\{index\}/g, String(values.index));
  result = result.replace(/\{ext\}/g, values.ext);
  result = result.replace(/\{size\}/g, values.size);
  return result;
}

/**
 * Plans renames for all files in path. Does not execute.
 */
export async function planRename(
  rootPath: string,
  options: {
    format: string;
    recursive: boolean;
  }
): Promise<RenameAction[]> {
  const files = await listFiles(rootPath, options.recursive);
  const actions: RenameAction[] = [];
  let index = 0;

  for (const filePath of files) {
    index++;
    const meta = await getMetadata(filePath);
    const ext = getExtension(filePath);
    const originalName = getNameWithoutExtension(filePath);
    const dir = path.dirname(filePath);

    const newNameWithoutExt = applyTemplate(options.format, {
      date: formatDateISO(meta.createdAt),
      original: originalName,
      index,
      ext: ext.replace(/^\./, ''),
      size: String(meta.size)
    });
    const newName = newNameWithoutExt + ext;
    const newPath = joinPath(dir, newName);

    if (newPath === filePath) continue;

    actions.push({
      oldPath: filePath,
      newPath,
      oldName: path.basename(filePath),
      newName
    });
  }

  return actions;
}
