/**
 * Minimal ICO container: PNG-compressed frames (supported by every browser
 * that reads `favicon.ico`), no BMP payloads. Used by
 * scripts/build-brand-icons.ts to write public/favicon.ico and by its test to
 * read it back.
 */

export interface IcoFrame {
  /** Side in pixels, 1–256. */
  size: number;
  png: Buffer;
}

const HEADER_BYTES = 6;
const ENTRY_BYTES = 16;

export function encodeIco(frames: readonly IcoFrame[]): Buffer {
  const header = Buffer.alloc(HEADER_BYTES);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  let offset = HEADER_BYTES + ENTRY_BYTES * frames.length;
  const entries = frames.map(({ size, png }) => {
    if (size < 1 || size > 256) throw new Error(`ICO frames are 1–256px, got ${size}`);
    const entry = Buffer.alloc(ENTRY_BYTES);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...frames.map(({ png }) => png)]);
}

export function decodeIco(ico: Buffer): IcoFrame[] {
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) throw new Error('not an ICO file');
  const count = ico.readUInt16LE(4);
  return Array.from({ length: count }, (_, index) => {
    const entry = HEADER_BYTES + index * ENTRY_BYTES;
    const width = ico.readUInt8(entry) || 256;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    return { size: width, png: ico.subarray(offset, offset + length) };
  });
}
