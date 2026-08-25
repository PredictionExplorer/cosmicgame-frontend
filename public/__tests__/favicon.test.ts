import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ico = readFileSync(join(process.cwd(), 'public', 'favicon.ico'));
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('favicon assets', () => {
  it('ships a valid multi-resolution ICO with PNG images', () => {
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);

    const imageCount = ico.readUInt16LE(4);
    expect(imageCount).toBe(3);

    const dimensions = Array.from({ length: imageCount }, (_, index) => {
      const entryOffset = 6 + index * 16;
      const width = ico.readUInt8(entryOffset) || 256;
      const height = ico.readUInt8(entryOffset + 1) || 256;
      const byteLength = ico.readUInt32LE(entryOffset + 8);
      const imageOffset = ico.readUInt32LE(entryOffset + 12);

      expect(imageOffset + byteLength).toBeLessThanOrEqual(ico.length);
      expect(ico.subarray(imageOffset, imageOffset + pngSignature.length)).toEqual(pngSignature);
      expect(ico.readUInt32BE(imageOffset + 16)).toBe(width);
      expect(ico.readUInt32BE(imageOffset + 20)).toBe(height);

      return `${width}x${height}`;
    });

    expect(dimensions).toEqual(['16x16', '32x32', '48x48']);
  });
});
