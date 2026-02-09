/**
 * =============================================================================
 * CONFIG LOADER
 * =============================================================================
 *
 * Loads .filetoolrc.json from the current working directory (or user home).
 * Used by organize/rename to apply custom rules and defaults.
 * If no config exists, we return null and use built-in defaults.
 */

import fs from 'fs/promises';
import path from 'path';
import type { FileToolConfig } from '../types';

const CONFIG_FILENAME = '.filetoolrc.json';

/**
 * Searches for .filetoolrc.json in:
 * 1. Current working directory (where user ran the command)
 * 2. User's home directory (optional fallback)
 *
 * Returns the parsed config or null if not found / invalid.
 */
export async function loadConfig(): Promise<FileToolConfig | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, CONFIG_FILENAME);

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as FileToolConfig;
    return config;
  } catch (err: unknown) {
    // File not found or invalid JSON - not an error, just no config
    if (err && typeof err === 'object' && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    return null;
  }
}

/**
 * Returns the path where we would write .filetoolrc.json (current working directory).
 * Used by `filetool init` to create the file.
 */
export function getConfigPath(): string {
  return path.join(process.cwd(), CONFIG_FILENAME);
}
