/**
 * =============================================================================
 * ORGANIZE COMMAND
 * =============================================================================
 *
 * Implements: filetool organize <path> [--by type|date] [--recursive] [--dry-run] [--verbose] [--interactive]
 *
 * Flow:
 * 1. Resolve and validate path
 * 2. Load config (custom rules)
 * 3. Plan moves via organizeOrchestrator
 * 4. If dry-run: only log actions
 * 5. If interactive: prompt before each move
 * 6. Otherwise: execute moves
 * 7. Optionally write report
 */

import path from 'path';
import type { Command } from 'commander';
import type { OrganizeBy } from '../types';
import { resolvePath, pathExists, isDirectory, log, error, verbose } from '../utils';
import { loadConfig } from '../utils/configLoader';
import { planOrganize, executeOrganize } from '../core/organizeOrchestrator';
import { writeReport } from '../services/reportService';
import { ensureDir, moveFile } from '../services/fileService';
import * as readline from 'readline';

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

export function registerOrganizeCommand(program: Command): void {
  program
    .command('organize <path>')
    .description('Organize files by type (default) or by date into subfolders')
    .option('-r, --recursive', 'Scan subdirectories')
    .option('--dry-run', 'Show planned actions without executing')
    .option('-v, --verbose', 'Detailed logs')
    .option('-i, --interactive', 'Prompt before each move')
    .option('--by <mode>', 'Organize by "type" or "date"', 'type')
    .action(async (pathArg: string, opts: { recursive?: boolean; dryRun?: boolean; verbose?: boolean; interactive?: boolean; by?: string }) => {
      const targetPath = resolvePath(pathArg);
      const recursive = !!opts.recursive;
      const dryRun = !!opts.dryRun;
      const isVerbose = !!opts.verbose;
      const interactive = !!opts.interactive;
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

      const actions = await planOrganize(targetPath, { by, recursive, customRules });
      if (actions.length === 0) {
        log('No files to organize.');
        return;
      }

      if (dryRun) {
        log(`[DRY RUN] Would move ${actions.length} file(s):`);
        actions.forEach((a) => log(`  ${a.fileName} -> ${a.to}`));
        return;
      }

      if (interactive) {
        for (const action of actions) {
          const yes = await ask(`Move "${action.fileName}" to ${action.to}? [y/N] `);
          if (yes) {
            await ensureDir(path.dirname(action.to));
            await moveFile(action.from, action.to);
            verbose(`Moved: ${action.fileName}`, isVerbose);
          }
        }
        return;
      }

      await executeOrganize(actions);
      log(`Organized ${actions.length} file(s).`);

      const report = {
        timestamp: new Date().toISOString(),
        operation: 'organize',
        targetPath,
        filesMoved: actions,
        errors: []
      };
      const reportPath = await writeReport(report);
      verbose(`Report written to ${reportPath}`, isVerbose);
    });
}
