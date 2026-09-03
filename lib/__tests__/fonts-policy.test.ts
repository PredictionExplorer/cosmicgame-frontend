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

  it.each([
    ['Noto_Sans_TC', 'notoSansTC', '--font-noto-tc', 'PingFang TC'],
    ['Noto_Sans_HK', 'notoSansHK', '--font-noto-hk', 'PingFang HK'],
  ])(
    'keeps the %s Traditional companion on the Noto Sans SC loading policy',
    (loader, exportName, variable, systemFallback) => {
      const block = source.slice(source.indexOf(`export const ${exportName}`));
      const end = block.indexOf('});');
      const fontBlock = block.slice(0, end);
      expect(fontBlock).toContain(`${loader}(`);
      expect(fontBlock).toContain("weight: 'variable'");
      expect(fontBlock).toContain(`variable: '${variable}'`);
      expect(fontBlock).toContain("display: 'optional'");
      expect(fontBlock).toContain('preload: false');
      // Regional system fallbacks, not the Simplified ones.
      expect(fontBlock).toContain(`'${systemFallback}'`);
      expect(fontBlock).toContain("'Microsoft JhengHei'");
      expect(fontBlock).not.toContain('PingFang SC');
    },
  );

  it('keeps the Cyrillic display companion configured without eager preload', () => {
    expect(source).toContain('Onest');
    expect(source).toContain("variable: '--font-onest'");
    // Same policy as Noto Sans SC: off the critical path of every other locale.
    const onestBlock = source.slice(source.indexOf('export const onest'));
    expect(onestBlock).toContain("display: 'optional'");
    expect(onestBlock).toContain('preload: false');
    expect(onestBlock).toContain("'cyrillic'");
  });

  it('does not preload Inter Cyrillic slices on every page', () => {
    // Inter's build-time CSS already declares the cyrillic unicode-range
    // slices; listing them in `subsets` would only add preload tags that
    // English and Chinese pages pay for.
    const interBlock = source.slice(
      source.indexOf('export const inter'),
      source.indexOf('export const notoSansSC'),
    );
    expect(interBlock).not.toContain('cyrillic');
    // Nor do the CJK companions: their Latin subset is only for metrics.
    const cjkBlock = source.slice(
      source.indexOf('export const notoSansSC'),
      source.indexOf('export const onest'),
    );
    const cjkSubsets = cjkBlock.match(/subsets: \[[^\]]*\]/g) ?? [];
    // One `subsets` per Noto Sans CJK cut (SC, TC, HK, KR, …).
    const cjkLoaders = cjkBlock.match(/Noto_Sans_[A-Z]+\(/g) ?? [];
    expect(cjkLoaders.length).toBeGreaterThanOrEqual(3);
    expect(cjkSubsets).toHaveLength(cjkLoaders.length);
    for (const subsets of cjkSubsets) expect(subsets).not.toContain('cyrillic');
  });

  it('overrides the Ukrainian display stack outside any cascade layer', () => {
    // :root declares --display-font-stack unlayered. Both :root and
    // html[lang='uk'] target the <html> element, and an unlayered declaration
    // beats any layered one regardless of specificity — an override placed
    // inside @layer base would silently never apply.
    const css = readFileSync(resolve(__dirname, '..', '..', 'styles', 'global.css'), 'utf8');
    const rootIndex = css.indexOf(':root {');
    const overrideIndex = css.indexOf("html[lang='uk'] {");
    expect(rootIndex).toBeGreaterThan(-1);
    expect(overrideIndex).toBeGreaterThan(rootIndex);
    // Top-level rules are unindented; anything inside @layer is indented.
    expect(css.slice(overrideIndex - 1, overrideIndex)).toBe('\n');
    const overrideBlock = css.slice(overrideIndex, css.indexOf('}', overrideIndex));
    expect(overrideBlock).toContain('--display-font-stack: var(--font-onest)');
  });

  it('routes every Chinese font stack through --cjk-font-stack', () => {
    const css = readFileSync(resolve(__dirname, '..', '..', 'styles', 'global.css'), 'utf8');
    // The Simplified default lives on :root; no other rule may name a Noto
    // cut directly, otherwise a Traditional page would render mainland forms.
    expect(css).toContain("--cjk-font-stack: var(--font-noto-sc), 'PingFang SC'");
    expect(css.match(/--font-noto-sc/g)).toHaveLength(1);
    expect(css).toContain('var(--cjk-font-stack)');
    expect(css).not.toMatch(/html\[lang='zh'\]/);
    expect(css).toMatch(/html:lang\(zh\) h1/);
  });

  it.each([
    ['zh-TW', '--font-noto-tc', 'PingFang TC'],
    ['zh-HK', '--font-noto-hk', 'PingFang HK'],
  ])('swaps the %s CJK stack outside any cascade layer', (locale, variable, systemFallback) => {
    const css = readFileSync(resolve(__dirname, '..', '..', 'styles', 'global.css'), 'utf8');
    const rootIndex = css.indexOf(':root {');
    const overrideIndex = css.indexOf(`html:lang(${locale}) {`);
    expect(overrideIndex).toBeGreaterThan(rootIndex);
    // Top-level rules are unindented; anything inside @layer is indented.
    expect(css.slice(overrideIndex - 1, overrideIndex)).toBe('\n');
    const overrideBlock = css.slice(overrideIndex, css.indexOf('}', overrideIndex));
    expect(overrideBlock).toContain(`--cjk-font-stack: var(${variable}), '${systemFallback}'`);
    expect(overrideBlock).toContain("'Microsoft JhengHei'");
  });

  it('limits Title-Case button labels to English', () => {
    // Button variants use Tailwind `capitalize`; cased languages other than
    // English write labels in sentence case, so the transform is switched off
    // for every non-English document (unlayered, to outrank utilities).
    const css = readFileSync(resolve(__dirname, '..', '..', 'styles', 'global.css'), 'utf8');
    const ruleIndex = css.indexOf("html:not([lang='en']) .capitalize {");
    expect(ruleIndex).toBeGreaterThan(-1);
    expect(css.slice(ruleIndex - 1, ruleIndex)).toBe('\n');
    expect(css.slice(ruleIndex, css.indexOf('}', ruleIndex))).toContain('text-transform: none');
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
