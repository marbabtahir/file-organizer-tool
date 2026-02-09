/**
 * =============================================================================
 * RENAME COMMAND
 * =============================================================================
 *
 * Implements: filetool rename <path> [--format "{date}_{index}"] [--recursive] [--dry-run]
 *
 * Flow:
 * 1. Resolve path (directory)
 * 2. Plan renames via renameOrchestrator
 * 3. If dry-run: only log; else execute renames
 * 4. Optionally write report
 */

import type { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { resolvePath, pathExists, isDirectory, log, error, verbose } from '../utils';
import { loadConfig } from '../utils/configLoader';
import { planRename } from '../core/renameOrchestrator';
import { ensureDir, renameFile } from '../services/fileService';
import { writeReport } from '../services/reportService';

export function registerRenameCommand(program: Command): void {
  program
    .command('rename <path>')
    .description('Rename files using a template (placeholders: {date}, {original}, {index}, {ext}, {size})')
    .option('-f, --format <template>', 'Rename template', '{date}_{index}')
    .option('-r, --recursive', 'Process subdirectories')
    .option('--dry-run', 'Show planned renames without executing')
    .option('-v, --verbose', 'Detailed logs')
    .action(async (pathArg: string, opts: { format?: string; recursive?: boolean; dryRun?: boolean; verbose?: boolean }) => {
      const targetPath = resolvePath(pathArg);
      const format = opts.format ?? '{date}_{index}';
      const recursive = !!opts.recursive;
      const dryRun = !!opts.dryRun;
      const isVerbose = !!opts.verbose;

      if (!(await pathExists(targetPath))) {
        error(`Path not found: ${targetPath}`);
        process.exit(1);
      }
      if (!(await isDirectory(targetPath))) {
        error(`Not a directory: ${targetPath}`);
        process.exit(1);
      }

      const config = await loadConfig();
      const template = opts.format ?? config?.renameTemplate ?? '{date}_{index}';

      const actions = await planRename(targetPath, { format: template, recursive });
      if (actions.length === 0) {
        log('No files to rename.');
        return;
      }

      if (dryRun) {
        log(`[DRY RUN] Would rename ${actions.length} file(s):`);
        actions.forEach((a) => log(`  ${a.oldName} -> ${a.newName}`));
        return;
      }

      for (const action of actions) {
        await ensureDir(path.dirname(action.newPath));
        await renameFile(action.oldPath, action.newPath);
        verbose(`Renamed: ${action.oldName} -> ${action.newName}`, isVerbose);
      }
      log(`Renamed ${actions.length} file(s).`);

      const report = {
        timestamp: new Date().toISOString(),
        operation: 'rename',
        targetPath,
        filesRenamed: actions,
        errors: []
      };
      const reportPath = await writeReport(report);
      verbose(`Report written to ${reportPath}`, isVerbose);
    });
}
