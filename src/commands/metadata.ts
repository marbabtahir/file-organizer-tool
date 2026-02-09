/**
 * =============================================================================
 * METADATA COMMAND
 * =============================================================================
 *
 * Implements: filetool metadata <file>
 *
 * Flow:
 * 1. Resolve path and check it's a file
 * 2. Call metadataService.getMetadata()
 * 3. Print formatted output (size, dates, type, dimensions, EXIF if any)
 */

import type { Command } from 'commander';
import { resolvePath, pathExists, isFile, log, error } from '../utils';
import { getMetadata } from '../services/metadataService';

export function registerMetadataCommand(program: Command): void {
  program
    .command('metadata <file>')
    .description('Extract and display file metadata (size, dates, EXIF for images)')
    .action(async (fileArg: string) => {
      const filePath = resolvePath(fileArg);
      if (!(await pathExists(filePath))) {
        error(`File not found: ${filePath}`);
        process.exit(1);
      }
      if (!(await isFile(filePath))) {
        error(`Not a file: ${filePath}`);
        process.exit(1);
      }

      const meta = await getMetadata(filePath);
      log(`Path:       ${meta.path}`);
      log(`Size:       ${meta.sizeFormatted}`);
      log(`Type:       ${meta.type}`);
      log(`Created:    ${meta.createdAt.toISOString()}`);
      log(`Modified:   ${meta.modifiedAt.toISOString()}`);
      if (meta.dimensions) log(`Dimensions: ${meta.dimensions}`);
      if (meta.exif && Object.keys(meta.exif).length > 0) {
        log('EXIF:       (present)');
      }
    });
}
