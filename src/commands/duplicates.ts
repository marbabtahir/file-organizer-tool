/**
 * =============================================================================
 * DUPLICATES COMMAND
 * =============================================================================
 *
 * Implements: filetool duplicates <path> [--recursive] [--dry-run] [--delete]
 *
 * Flow:
 * 1. Resolve path (directory)
 * 2. Find duplicate groups via duplicateFinder (SHA-256)
 * 3. Print groups
 * 4. If --delete: prompt and delete duplicates (keep one per group)
 */

import type { Command } from 'commander';
import * as readline from 'readline';
import { resolvePath, pathExists, isDirectory, log, error } from '../utils';
import { findDuplicates } from '../core/duplicateFinder';
import { deleteFile } from '../services/fileService';
import { writeReport } from '../services/reportService';
import { formatBytes } from '../utils/formatUtils';

function createReadline(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(question: string): Promise<boolean> {
  const rl = createReadline();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y|yes$/i.test(answer.trim()));
    });
  });
}

export function registerDuplicatesCommand(program: Command): void {
  program
    .command('duplicates <path>')
    .description('Find duplicate files by content (SHA-256 hash)')
    .option('-r, --recursive', 'Scan subdirectories')
    .option('--dry-run', 'Only list duplicates, do not delete')
    .option('--delete', 'Delete duplicates after confirmation (keeps one per group)')
    .action(async (pathArg: string, opts: { recursive?: boolean; dryRun?: boolean; delete?: boolean }) => {
      const targetPath = resolvePath(pathArg);
      const recursive = !!opts.recursive;
      const dryRun = !!opts.dryRun;
      const doDelete = !!opts.delete;

      if (!(await pathExists(targetPath))) {
        error(`Path not found: ${targetPath}`);
        process.exit(1);
      }
      if (!(await isDirectory(targetPath))) {
        error(`Not a directory: ${targetPath}`);
        process.exit(1);
      }

      const groups = await findDuplicates(targetPath, recursive);
      if (groups.length === 0) {
        log('No duplicate groups found.');
        return;
      }

      let totalWasted = 0;
      groups.forEach((g, i) => {
        totalWasted += (g.files.length - 1) * g.sizeBytes;
        log(`Duplicate Group ${i + 1}:`);
        g.files.forEach((f) => log(`  - ${f}`));
      });
      log(`\nTotal space that could be saved: ${formatBytes(totalWasted)}`);

      const report = {
        timestamp: new Date().toISOString(),
        operation: 'duplicates',
        targetPath,
        duplicateGroups: groups,
        spaceSavedBytes: totalWasted,
        errors: []
      };
      await writeReport(report);

      if (doDelete && !dryRun) {
        const confirmed = await ask('Delete duplicate files (keep one per group)? [y/N] ');
        if (!confirmed) {
          log('Aborted.');
          return;
        }
        let deleted = 0;
        for (const group of groups) {
          for (let i = 1; i < group.files.length; i++) {
            await deleteFile(group.files[i]);
            deleted++;
          }
        }
        log(`Deleted ${deleted} duplicate file(s).`);
      }
    });
}
