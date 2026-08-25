import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Font payload policy: body text must ship as build-time-subsetted variable
 * WOFF2 slices, display text as a single variable WOFF2. The previous
 * self-hosted `InterVariable.woff2` carried every script Inter supports at
 * 352 KB and was preloaded on every page — regressing to a full-range file
 * (or static TTF weights at ~150 KB each) silently undoes one of the largest
 * page-weight wins on mobile.
 */
describe('font configuration policy', () => {
  const fontsConfigPath = resolve(__dirname, '..', 'fonts.ts');
  const source = readFileSync(fontsConfigPath, 'utf8');

  it('loads Inter through next/font/google so it is subsetted at build time', () => {
    expect(source).toMatch(/import \{[^}]*\bInter\b[^}]*\} from 'next\/font\/google'/);
    expect(source).toContain("subsets: ['latin', 'latin-ext']");
    expect(source).toContain("variable: '--font-inter'");
  });

  it('does not reference a full-range local Inter file', () => {
    expect(source).not.toContain('InterVariable');
    expect(source).not.toMatch(/fonts\/Inter\//);
  });

  it('does not reference any static TTF font files', () => {
    expect(source).not.toMatch(/\.ttf/);
  });

  it('loads ClashDisplay as a variable WOFF2', () => {
    expect(source).toContain('ClashDisplay-Variable.woff2');
  });

  it('keeps the Chinese companion font configured without eager preload', () => {
    expect(source).toContain('Noto_Sans_SC');
    expect(source).toContain("weight: 'variable'");
    expect(source).toContain("variable: '--font-noto-sc'");
    expect(source).toContain("display: 'optional'");
    expect(source).toContain('preload: false');
    expect(source).toContain("'PingFang SC'");
    expect(source).toContain("'Microsoft YaHei'");
  });

  it('ships the referenced local font files in public/fonts', () => {
    const publicFonts = resolve(__dirname, '..', '..', 'public', 'fonts');
    expect(
      existsSync(resolve(publicFonts, 'ClashDisplay', 'fonts', 'ClashDisplay-Variable.woff2')),
    ).toBe(true);
    // The local Inter directory must stay deleted; next/font/google owns Inter.
    expect(existsSync(resolve(publicFonts, 'Inter'))).toBe(false);
  });
});
