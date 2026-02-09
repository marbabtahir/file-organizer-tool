/**
 * =============================================================================
 * LOGGER
 * =============================================================================
 *
 * Simple console logger with optional verbose mode.
 * All user-facing messages go through here so we can later add --quiet or
 * log-to-file without changing every file.
 */

/**
 * Logs a normal message to stdout (always shown).
 */
export function log(message: string): void {
  console.log(message);
}

/**
 * Logs only when --verbose is set. Use for detailed progress (e.g. "Processing file X").
 */
export function verbose(message: string, isVerbose: boolean): void {
  if (isVerbose) {
    console.log(message);
  }
}

/**
 * Logs an error to stderr. Use for real errors (permission denied, not found, etc.).
 */
export function error(message: string): void {
  console.error(message);
}
