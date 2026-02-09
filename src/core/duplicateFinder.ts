/**
 * =============================================================================
 * DUPLICATE FINDER
 * =============================================================================
 *
 * Scans files, computes SHA-256 hash for each, groups by hash.
 * Files with the same hash are duplicates (identical content).
 */

import type { DuplicateGroup } from '../types';
import { listFiles } from '../services/fileService';
import { getFileHash } from '../services/hashService';
import fs from 'fs/promises';

/**
 * Finds all duplicate groups under path. Returns groups of file paths with same hash.
 */
export async function findDuplicates(
  rootPath: string,
  recursive: boolean
): Promise<DuplicateGroup[]> {
  const files = await listFiles(rootPath, recursive);
  const hashToPaths: Record<string, string[]> = {};
  const hashToSize: Record<string, number> = {};

  for (const filePath of files) {
    try {
      const hash = await getFileHash(filePath);
      const stat = await fs.stat(filePath);
      if (!hashToPaths[hash]) hashToPaths[hash] = [];
      hashToPaths[hash].push(filePath);
      hashToSize[hash] = stat.size;
    } catch (err) {
      // Skip files we can't read (permission, etc.)
    }
  }

  const groups: DuplicateGroup[] = [];
  for (const [hash, paths] of Object.entries(hashToPaths)) {
    if (paths.length > 1) {
      groups.push({
        hash,
        files: paths,
        sizeBytes: hashToSize[hash] ?? 0
      });
    }
  }
  return groups;
}
