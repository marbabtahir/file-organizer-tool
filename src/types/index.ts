/**
 * =============================================================================
 * FILE TOOL - TYPE DEFINITIONS
 * =============================================================================
 *
 * This file defines all shared TypeScript interfaces and types used across
 * the application. Centralizing types here keeps the codebase consistent
 * and makes it easy to change data shapes in one place.
 *
 * WHY TYPES MATTER:
 * - TypeScript uses these to catch bugs at compile time
 * - Your IDE gets autocomplete and inline docs
 * - New developers (or you later) understand what data each function expects
 */

// -----------------------------------------------------------------------------
// CONFIGURATION TYPES
// -----------------------------------------------------------------------------

/**
 * A single custom rule from .filetoolrc.json.
 * Rules are applied in order; first match wins (unless we support priority later).
 */
export interface CustomRule {
  /** File extension to match, e.g. ".pdf" */
  extension?: string;
  /** Target folder name for matching files */
  folder: string;
  /** Optional: minimum file size in MB to match */
  minSizeMB?: number;
  /** Optional: maximum file size in MB to match */
  maxSizeMB?: number;
}

/**
 * User config loaded from .filetoolrc.json (created by `filetool init`).
 */
export interface FileToolConfig {
  /** Custom organization rules (override default by-type mapping) */
  rules?: CustomRule[];
  /** Default folder mapping: extension or category -> folder name */
  folderMapping?: Record<string, string>;
  /** Default rename template, e.g. "{date}_{index}" */
  renameTemplate?: string;
  /** Whether to run in dry-run by default */
  defaultDryRun?: boolean;
}

// -----------------------------------------------------------------------------
// ORGANIZE TYPES
// -----------------------------------------------------------------------------

/** How to organize: by file type (images, docs, etc.) or by date (year/month). */
export type OrganizeBy = 'type' | 'date';

/** One planned move: from path -> to path. Used in dry-run and reports. */
export interface MoveAction {
  from: string;
  to: string;
  fileName: string;
}

// -----------------------------------------------------------------------------
// METADATA TYPES
// -----------------------------------------------------------------------------

/**
 * Enriched file metadata we expose to the user.
 * Built from fs.Stats + optional EXIF (for images).
 */
export interface FileMetadata {
  path: string;
  size: number;
  sizeFormatted: string;
  createdAt: Date;
  modifiedAt: Date;
  extension: string;
  type: string;
  /** Only for images: width x height */
  dimensions?: string;
  /** Only when EXIF is available */
  exif?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// RENAME TYPES
// -----------------------------------------------------------------------------

/** One planned rename: old name -> new name. */
export interface RenameAction {
  oldPath: string;
  newPath: string;
  oldName: string;
  newName: string;
}

/** Placeholders we support in rename format: {date}, {original}, {index}, {ext}, {size} */
export type RenamePlaceholder = 'date' | 'original' | 'index' | 'ext' | 'size';

// -----------------------------------------------------------------------------
// DUPLICATES TYPES
// -----------------------------------------------------------------------------

/**
 * A group of files that have the same content (same SHA-256 hash).
 * We keep one as "original" and list the rest as duplicates.
 */
export interface DuplicateGroup {
  /** SHA-256 hash of the file content */
  hash: string;
  /** Full paths of all duplicate files in this group */
  files: string[];
  /** Size in bytes (same for all in group) */
  sizeBytes: number;
}

// -----------------------------------------------------------------------------
// REPORT TYPES
// -----------------------------------------------------------------------------

/**
 * Report generated after operations (organize, rename, duplicates).
 * Can be written to report.json for auditing.
 */
export interface OperationReport {
  /** When the operation was run */
  timestamp: string;
  /** Type of operation: organize | rename | duplicates */
  operation: string;
  /** Path that was processed */
  targetPath: string;
  /** Files moved (for organize) */
  filesMoved?: MoveAction[];
  /** Files renamed (for rename) */
  filesRenamed?: RenameAction[];
  /** Duplicate groups (for duplicates) */
  duplicateGroups?: DuplicateGroup[];
  /** Total bytes that could be saved by deleting duplicates */
  spaceSavedBytes?: number;
  /** Any errors encountered (path + message) */
  errors: Array<{ path: string; message: string }>;
}

// -----------------------------------------------------------------------------
// GLOBAL OPTIONS (passed through CLI to services)
// -----------------------------------------------------------------------------

/**
 * Common options that multiple commands use.
 * Avoids repeating the same flags in every command.
 */
export interface GlobalOptions {
  /** If true, only log what would be done; don't modify files */
  dryRun?: boolean;
  /** If true, log detailed progress */
  verbose?: boolean;
  /** If true, process subdirectories recursively */
  recursive?: boolean;
  /** If true, prompt before each destructive action */
  interactive?: boolean;
}
