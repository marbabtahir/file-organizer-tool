/**
 * =============================================================================
 * METADATA SERVICE
 * =============================================================================
 *
 * Extracts file metadata using fs.stat() and, for images, exif-parser.
 * Produces the FileMetadata object shown by `filetool metadata <file>`.
 */

import fs from 'fs/promises';
import path from 'path';
import exifParser from 'exif-parser';
import type { FileMetadata } from '../types';
import { getExtension } from '../utils';
import { formatBytes } from '../utils/formatUtils';

/** Image extensions we try to read EXIF from */
const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.tif', '.bmp'
]);

/**
 * Maps extension to a human-readable type label (for display).
 */
function getTypeLabel(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'Image', '.jpeg': 'Image', '.png': 'Image', '.gif': 'Image',
    '.webp': 'Image', '.pdf': 'Document', '.doc': 'Document', '.docx': 'Document',
    '.mp4': 'Video', '.mov': 'Video', '.avi': 'Video', '.zip': 'Archive',
    '.rar': 'Archive', '.7z': 'Archive'
  };
  return map[ext] ?? 'File';
}

/**
 * Tries to parse EXIF from image buffer. Returns null if not an image or parse fails.
 */
function parseExif(buffer: Buffer): Record<string, unknown> | null {
  try {
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    return (result as unknown) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Gets image dimensions from EXIF or from buffer (basic PNG/JPEG parsing would go here).
 * For simplicity we use EXIF when present; otherwise dimensions stay undefined.
 */
function getDimensionsFromExif(exif: Record<string, unknown>): string | undefined {
  const width = exif['ImageWidth'] ?? exif['imageWidth'];
  const height = exif['ImageHeight'] ?? exif['imageHeight'];
  if (typeof width === 'number' && typeof height === 'number') {
    return `${width} x ${height}`;
  }
  return undefined;
}

/**
 * Extracts full metadata for one file: stats + optional EXIF for images.
 */
export async function getMetadata(filePath: string): Promise<FileMetadata> {
  const stat = await fs.stat(filePath);
  const ext = getExtension(filePath);
  const sizeFormatted = formatBytes(stat.size);

  const metadata: FileMetadata = {
    path: filePath,
    size: stat.size,
    sizeFormatted,
    createdAt: stat.birthtime,
    modifiedAt: stat.mtime,
    extension: ext,
    type: getTypeLabel(ext)
  };

  if (IMAGE_EXTENSIONS.has(ext)) {
    try {
      const buffer = await fs.readFile(filePath);
      const exif = parseExif(buffer);
      if (exif) {
        metadata.exif = exif;
        const dims = getDimensionsFromExif(exif);
        if (dims) metadata.dimensions = dims;
      }
    } catch {
      // Ignore read/parse errors for EXIF
    }
  }

  return metadata;
}
