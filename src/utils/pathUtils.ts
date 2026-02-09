/**
 * =============================================================================
 * PATH UTILITIES
 * =============================================================================
 *
 * All path operations go through path.join() and path.resolve() so the tool
 * works on Windows, macOS, and Linux (cross-platform). We never use raw
 * slashes or OS-specific logic.
 */

import path from 'path';
import fs from 'fs/promises';

/**
 * Safely joins path segments. Use this instead of string concatenation.
 * Example: joinPath('/home/user', 'downloads', 'file.pdf') => /home/user/downloads/file.pdf
 */
export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * Resolves a path to an absolute path. Handles . and .. and current working directory.
 * Example: resolvePath('./downloads') => /absolute/path/to/downloads
 */
export function resolvePath(inputPath: string): string {
  return path.resolve(inputPath);
}

/**
 * Returns the file extension including the dot, e.g. ".jpg"
 * Returns empty string if no extension.
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Returns the base name of the file (name + extension), e.g. "photo.jpg"
 */
export function getBasename(filePath: string): string {
  return path.basename(filePath);
}

/**
 * Returns the file name without extension, e.g. "photo" from "photo.jpg"
 */
export function getNameWithoutExtension(filePath: string): string {
  const base = path.basename(filePath);
  const ext = path.extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}

/**
 * Returns the directory part of a path, e.g. "/home/user/downloads" from "/home/user/downloads/file.pdf"
 */
export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Checks if a path exists (file or directory). Uses fs.access to avoid throwing.
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the path is a directory (must exist).
 */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Checks if the path is a file (must exist).
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
