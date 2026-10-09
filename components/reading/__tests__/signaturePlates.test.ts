import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SIGNATURE_PLATES, shortSeed } from '@/components/reading/signaturePlates';

const ROOT = join(__dirname, '..', '..', '..');

describe('bundled Signature plates', () => {
  const plates = Object.entries(SIGNATURE_PLATES);

  it.each(plates)('#%s ships its preview and a full seed', (id, plate) => {
    expect(plate.tokenId).toBe(Number(id));
    expect(plate.seed).toMatch(/^[0-9a-f]{64}$/);
    expect(existsSync(join(ROOT, 'public', plate.src))).toBe(true);
  });

  it('documents the provenance of every preview it adds', () => {
    const readme = readFileSync(join(ROOT, 'public/images/learn/README.md'), 'utf8');
    for (const [, plate] of plates) {
      if (plate.src.startsWith('/images/learn/')) {
        expect(readme).toContain(`signature-${plate.tokenId}.webp`);
      }
    }
  });

  it('prints a short seed that never breaks across lines', () => {
    expect(shortSeed(SIGNATURE_PLATES[23].seed)).toBe('17d61f…⁠ffcc');
  });

  it('prints one short form on every surface, whatever the seed looks like', () => {
    // The landing's Art plate and the white paper's figure caption #24 alike.
    expect(shortSeed(`0x${SIGNATURE_PLATES[24].seed.toUpperCase()}`)).toBe('5084a8…⁠33ad');
    expect(shortSeed('abc')).toBe('abc');
  });
});
