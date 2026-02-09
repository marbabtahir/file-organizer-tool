#!/usr/bin/env node
/**
 * =============================================================================
 * FILE TOOL - CLI ENTRY POINT
 * =============================================================================
 *
 * This file is the single entry point when you run `filetool` or `node dist/bin/cli.js`.
 *
 * Flow:
 * 1. Create a Commander program (name, version, description)
 * 2. Register all subcommands (organize, metadata, rename, duplicates, watch, init)
 * 3. Parse process.argv and run the matching command
 *
 * Commander handles: filetool organize ./path --dry-run
 *   -> program.command('organize') receives <path>, and .option() defines flags.
 */

import { Command } from 'commander';
import { registerCommands } from '../src/commands/index';

const program = new Command();

program
  .name('filetool')
  .description('CLI for organizing files, metadata, duplicates, and batch operations')
  .version('1.0.0');

registerCommands(program);

program.parse();
