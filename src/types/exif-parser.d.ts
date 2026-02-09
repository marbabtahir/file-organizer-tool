/**
 * Type declaration for exif-parser (no official @types package).
 */
declare module 'exif-parser' {
  function create(buffer: Buffer): {
    parse(): unknown;
  };
}
