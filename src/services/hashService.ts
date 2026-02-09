/**
 * =============================================================================
 * HASH SERVICE
 * =============================================================================
 *
 * Computes SHA-256 hash of file content using Node.js crypto module.
 * Uses streaming (createReadStream + pipe to Hash) so large files don't
 * load entirely into memory. Used for duplicate detection.
 */

import crypto from 'crypto';
import fs from 'fs';
import { createReadStream } from 'fs';

/**
 * Returns a promise that resolves with the SHA-256 hex hash of the file.
 * Reads the file in chunks (streaming) for memory efficiency.
 */
export function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk: Buffer | string) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
