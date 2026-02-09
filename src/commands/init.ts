/**
 * =============================================================================
 * INIT COMMAND
 * =============================================================================
 *
 * Implements: filetool init
 *
 * Flow:
 * 1. Create .filetoolrc.json in current working directory with default
 *    structure (rules, folderMapping, renameTemplate, defaultDryRun).
 * 2. If file exists, do not overwrite (or prompt - we skip overwrite for safety).
 */

import type { Command } from 'commander';
import fs from 'fs/promises';
import { getConfigPath } from '../utils/configLoader';
import { log, error } from '../utils';
import { pathExists } from '../utils/pathUtils';

const DEFAULT_CONFIG = {
  rules: [
    { extension: '.pdf', folder: 'documents' },
    { minSizeMB: 100, folder: 'large-files' }
  ],
  folderMapping: {},
  renameTemplate: '{date}_{index}',
  defaultDryRun: false
};

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Create .filetoolrc.json in current directory with default config')
    .action(async () => {
      const configPath = getConfigPath();
      if (await pathExists(configPath)) {
        log('.filetoolrc.json already exists. Edit it to customize rules.');
        return;
      }
      await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
      log(`Created ${configPath}`);
    });
}
