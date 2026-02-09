/**
 * Commands barrel: register all CLI commands with the Commander program.
 */

import type { Command } from 'commander';
import { registerOrganizeCommand } from './organize';
import { registerMetadataCommand } from './metadata';
import { registerRenameCommand } from './rename';
import { registerDuplicatesCommand } from './duplicates';
import { registerWatchCommand } from './watch';
import { registerInitCommand } from './init';

export function registerCommands(program: Command): void {
  registerOrganizeCommand(program);
  registerMetadataCommand(program);
  registerRenameCommand(program);
  registerDuplicatesCommand(program);
  registerWatchCommand(program);
  registerInitCommand(program);
}
