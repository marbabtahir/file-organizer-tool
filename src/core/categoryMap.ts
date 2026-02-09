/**
 * =============================================================================
 * DEFAULT CATEGORY MAPPING (Organize by type)
 * =============================================================================
 *
 * Maps file extensions to folder names. Used when organizing by type.
 * Custom rules from .filetoolrc.json override this (see plugins).
 */

/** Extension (lowercase with dot) -> folder name */
export const DEFAULT_EXTENSION_TO_FOLDER: Record<string, string> = {
  // Images
  '.jpg': 'images', '.jpeg': 'images', '.png': 'images', '.gif': 'images',
  '.webp': 'images', '.bmp': 'images', '.tiff': 'images', '.tif': 'images',
  '.svg': 'images', '.ico': 'images',
  // Videos
  '.mp4': 'videos', '.mov': 'videos', '.avi': 'videos', '.mkv': 'videos',
  '.webm': 'videos', '.wmv': 'videos', '.flv': 'videos', '.m4v': 'videos',
  // Documents
  '.pdf': 'documents', '.doc': 'documents', '.docx': 'documents',
  '.xls': 'documents', '.xlsx': 'documents', '.ppt': 'documents', '.pptx': 'documents',
  '.txt': 'documents', '.rtf': 'documents', '.odt': 'documents', '.ods': 'documents',
  // Archives
  '.zip': 'archives', '.rar': 'archives', '.7z': 'archives', '.tar': 'archives',
  '.gz': 'archives', '.bz2': 'archives',
  // Audio
  '.mp3': 'audio', '.wav': 'audio', '.flac': 'audio', '.aac': 'audio', '.ogg': 'audio',
};

/** Default folder for unknown extensions */
export const DEFAULT_OTHER_FOLDER = 'others';

/**
 * Returns the folder name for a given extension using the default map.
 */
export function getFolderForExtension(ext: string): string {
  return DEFAULT_EXTENSION_TO_FOLDER[ext] ?? DEFAULT_OTHER_FOLDER;
}
