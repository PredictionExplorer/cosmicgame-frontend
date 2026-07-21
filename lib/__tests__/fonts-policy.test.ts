import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Font payload policy: body text must ship as a single variable WOFF2 per
 * family. Static TTF weights cost ~150 KB each over the wire and regressing
 * to them silently undoes one of the largest page-weight wins.
 */
describe('font configuration policy', () => {
  const fontsConfigPath = resolve(__dirname, '..', 'fonts.ts');
  const source = readFileSync(fontsConfigPath, 'utf8');

  it('loads Inter as a single variable WOFF2', () => {
    expect(source).toContain('InterVariable.woff2');
    expect(source).toContain("weight: '100 900'");
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

  it('ships the referenced font files in public/fonts', () => {
    const publicFonts = resolve(__dirname, '..', '..', 'public', 'fonts');
    expect(existsSync(resolve(publicFonts, 'Inter', 'fonts', 'InterVariable.woff2'))).toBe(true);
    expect(
      existsSync(resolve(publicFonts, 'ClashDisplay', 'fonts', 'ClashDisplay-Variable.woff2')),
    ).toBe(true);
  });
});
