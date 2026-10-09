import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BRAND_ICON_PATHS } from '../lib/og/brandIcons';

/**
 * The brand icon set's version (`BRAND_ICON_VERSION`): a hash of every file
 * in BRAND_ICON_PATHS under `publicDir`. scripts/build-brand-icons.ts writes
 * it after the files; lib/og/__tests__/brandIcons.test.ts recomputes it, so
 * an icon replaced without a new version fails the suite.
 *
 * The SVG is hashed with LF line endings, so a checkout that converts them
 * (core.autocrlf) computes the same version.
 */
export function brandIconDigest(publicDir: string): string {
  const hash = createHash('sha256');
  for (const path of Object.values(BRAND_ICON_PATHS)) {
    const bytes = readFileSync(join(publicDir, path));
    const content = path.endsWith('.svg')
      ? Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'))
      : bytes;
    hash.update(`${path}\0${content.length}\0`).update(content);
  }
  return hash.digest('hex').slice(0, 10);
}
