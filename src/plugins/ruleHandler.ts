/**
 * =============================================================================
 * RULE HANDLER (Plugin-style)
 * =============================================================================
 *
 * Applies custom rules from .filetoolrc.json. Rules are applied in order;
 * first match wins. Used by organizeOrchestrator when config has rules.
 * This module is the "plugin" entry point for future extensions (e.g. regex,
 * MIME type, or external scripts).
 */

import type { CustomRule } from '../types';
import path from 'path';

export interface FileContext {
  filePath: string;
  extension: string;
  sizeBytes: number;
}

/**
 * Returns the folder name from the first matching rule, or null.
 */
export function applyRules(context: FileContext, rules: CustomRule[]): string | null {
  for (const rule of rules) {
    if (rule.extension != null && rule.extension.toLowerCase() !== context.extension) {
      continue;
    }
    if (rule.minSizeMB != null && context.sizeBytes < rule.minSizeMB * 1024 * 1024) {
      continue;
    }
    if (rule.maxSizeMB != null && context.sizeBytes > rule.maxSizeMB * 1024 * 1024) {
      continue;
    }
    return rule.folder;
  }
  return null;
}
