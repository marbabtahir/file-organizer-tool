/**
 * =============================================================================
 * FORMAT UTILITIES
 * =============================================================================
 *
 * Helpers for formatting file sizes, dates, and other display values.
 */

/**
 * Formats bytes into human-readable string (e.g. 1024 -> "1 KB").
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats a Date to YYYY-MM-DD for use in rename templates and reports.
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Month names for "organize by date" folder names (January, February, ...).
 */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
