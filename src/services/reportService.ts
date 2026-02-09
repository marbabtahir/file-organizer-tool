/**
 * =============================================================================
 * REPORT SERVICE
 * =============================================================================
 *
 * Writes operation reports to report.json (or a given path) after
 * organize, rename, or duplicates runs. Used for auditing and debugging.
 */

import fs from 'fs/promises';
import path from 'path';
import type { OperationReport } from '../types';

const DEFAULT_REPORT_FILE = 'report.json';

/**
 * Writes the report as JSON to the current working directory (or custom path).
 */
export async function writeReport(
  report: OperationReport,
  outputPath?: string
): Promise<string> {
  const filePath = outputPath ?? path.join(process.cwd(), DEFAULT_REPORT_FILE);
  const content = JSON.stringify(report, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}
