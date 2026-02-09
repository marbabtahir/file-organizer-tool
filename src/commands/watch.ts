/**
 * =============================================================================
 * WATCH COMMAND
 * =============================================================================
 *
 * Implements: filetool watch <path> [--by type|date]
 *
 * Flow:
 * 1. Resolve path (directory)
 * 2. Use fs.watch() to monitor for add/change
 * 3. On new file: run organize logic for that file (by type or date)
 * 4. Log actions; runs until process is killed (Ctrl+C)
 */

import type { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { watch } from 'fs';
import { resolvePath, pathExists, isDirectory, log, error } from '../utils';
import { loadConfig } from '../utils/configLoader';
import { planOrganize, executeOrganize } from '../core/organizeOrchestrator';
import { getExtension, joinPath } from '../utils';
import { getFolderForExtension } from '../core/categoryMap';
import { ensureDir, moveFile } from '../services/fileService';
import { formatDateISO, MONTH_NAMES } from '../utils/formatUtils';
import { getMetadata } from '../services/metadataService';
import type { OrganizeBy } from '../types';

async function organizeOneFile(
  rootPath: string,
  filePath: string,
  by: OrganizeBy,
  customRules: { extension?: string; folder: string; minSizeMB?: number; maxSizeMB?: number }[]
): Promise<void> {
  const ext = getExtension(filePath);
  const baseName = path.basename(filePath);
  let targetDir: string;

  if (by === 'date') {
    const meta = await getMetadata(filePath);
    const d = meta.createdAt;
    const year = d.getFullYear();
    const monthName = MONTH_NAMES[d.getMonth()];
    targetDir = joinPath(rootPath, String(year), monthName);
  } else {
    const stat = await fs.stat(filePath);
    const rule = customRules.find(
      (r) =>
        (!r.extension || r.extension.toLowerCase() === ext) &&
        (r.minSizeMB == null || stat.size >= r.minSizeMB! * 1024 * 1024) &&
        (r.maxSizeMB == null || stat.size <= r.maxSizeMB! * 1024 * 1024)
    );
    const folder = rule?.folder ?? getFolderForExtension(ext);
    targetDir = joinPath(rootPath, folder);
  }

  const targetPath = joinPath(targetDir, baseName);
  if (targetPath === filePath) return;
  if (path.dirname(filePath) === targetDir) return;

  await ensureDir(targetDir);
  await moveFile(filePath, targetPath);
  log(`[watch] Moved: ${baseName} -> ${targetPath}`);
}

export function registerWatchCommand(program: Command): void {
  program
    .command('watch <path>')
    .description('Watch directory and organize new files in real time')
    .option('--by <mode>', 'Organize by "type" or "date"', 'type')
    .action(async (pathArg: string, opts: { by?: string }) => {
      const targetPath = resolvePath(pathArg);
      const by = (opts.by === 'date' ? 'date' : 'type') as OrganizeBy;

      if (!(await pathExists(targetPath))) {
        error(`Path not found: ${targetPath}`);
        process.exit(1);
      }
      if (!(await isDirectory(targetPath))) {
        error(`Not a directory: ${targetPath}`);
        process.exit(1);
      }

      const config = await loadConfig();
      const customRules = config?.rules ?? [];

      log(`Watching: ${targetPath} (organize by ${by}). Press Ctrl+C to stop.`);

      watch(
        targetPath,
        { recursive: true },
        async (eventType, filename) => {
          if (!filename) return;
          const fullPath = path.join(targetPath, filename);
          try {
            const stat = await fs.stat(fullPath);
            if (!stat.isFile()) return;
            await organizeOneFile(targetPath, fullPath, by, customRules);
          } catch (err) {
            // File may have been removed or not yet written
          }
        }
      );
    });
}
