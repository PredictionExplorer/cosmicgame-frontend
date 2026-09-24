import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Font payload policy (lib/fonts.ts, docs/design-system.md).
 *
 * - Body text ships as build-time-subsetted variable WOFF2 slices, display
 *   text as a single variable WOFF2. The previous self-hosted
 *   `InterVariable.woff2` carried every script Inter supports at 352 KB and
 *   was preloaded on every page.
 * - Only the faces every page needs are declared in lib/fonts.ts. The
 *   companion faces (Noto Sans CJK cuts, Onest) each live in their own module
 *   under components/theme/companion-fonts/, loaded through next/dynamic on
 *   their locale's pages only: declared in the root module graph, their
 *   @font-face stylesheets were render-blocking on every page of every locale
 *   (about 170 KB of CSS on an English page).
 *
 * next/font cannot run under jest, so these checks read the sources.
 */

const ROOT = resolve(__dirname, '..', '..');
const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');
const source = read('lib/fonts.ts');
const css = read('styles/global.css');
const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
const COMPANION_DIR = 'components/theme/companion-fonts';
const loaderSource = read('components/theme/CompanionFontFaces.tsx');

/** `LOCALE_COMPANION_FONTS` entries: locale → descriptor export name (or `null`). */
function registry(): Array<[locale: string, exportName: string]> {
  const start = source.indexOf('export const LOCALE_COMPANION_FONTS');
  const block = source.slice(start, source.indexOf('};', start));
  return [...block.matchAll(/^\s+'?([a-zA-Z-]+)'?: ([a-zA-Z]+),$/gm)].map((m) => [m[1]!, m[2]!]);
}

/** A companion descriptor's fields, read from its `export const` block. */
function descriptor(exportName: string): { id: string; family: string; variable: string } {
  const start = source.indexOf(`export const ${exportName}: CompanionFace = {`);
  expect(start).toBeGreaterThan(-1);
  const block = source.slice(start, source.indexOf('};', start));
  const field = (name: string) => new RegExp(`${name}: '([^']+)'`).exec(block)?.[1] ?? '';
  return { id: field('id'), family: field('family'), variable: field('variable') };
}

const companionExports = [...new Set(registry().map(([, name]) => name))].filter(
  (name) => name !== 'null',
);

/** Top-level rules of global.css, comments stripped. */
const rules = [...cssWithoutComments.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
  selector: m[1]!.trim(),
  body: m[2]!,
}));

describe('font configuration policy', () => {
  it('loads Inter through next/font/google, preloading only its latin slice', () => {
    expect(source).toMatch(/import \{[^}]*\bInter\b[^}]*\} from 'next\/font\/google'/);
    const interBlock = source.slice(
      source.indexOf('export const inter'),
      source.indexOf('export const jetbrainsMono'),
    );
    // latin-ext, Cyrillic and Vietnamese stay declared in the same
    // stylesheet and download on demand; preloading them cost English pages
    // 85 KB of high-priority bandwidth.
    expect(interBlock).toContain("subsets: ['latin']");
    expect(interBlock).toContain("variable: '--font-inter'");
    expect(interBlock).toContain('preload: true');
  });

  it('loads JetBrains Mono for identifiers without a preload', () => {
    const block = source.slice(source.indexOf('export const jetbrainsMono'));
    expect(block).toContain('JetBrains_Mono(');
    expect(block).toContain("variable: '--font-jetbrains-mono'");
    expect(block).toContain("display: 'swap'");
    expect(block).toContain('preload: false');
  });

  it("lets CJK glyphs reach the locale's CJK stack before any generic family", () => {
    // next/font appends a `fallback` list to the family variable, and a generic
    // family resolves per script from `lang`: `sans-serif` ahead of
    // `--cjk-font-stack` drew /ja body text in Hiragino Kaku Gothic ProN
    // instead of Noto Sans JP.
    for (const face of ['clashDisplay', 'inter', 'jetbrainsMono']) {
      const start = source.indexOf(`export const ${face} = `);
      expect(start).toBeGreaterThan(-1);
      expect(source.slice(start, source.indexOf('});', start))).not.toContain('fallback');
    }
    const stacks = [...cssWithoutComments.matchAll(/(--[\w-]+-font-stack):([^;]+);/g)];
    const withCjk = stacks.filter(([, , value]) => value!.includes('var(--cjk-font-stack)'));
    expect(withCjk.length).toBeGreaterThanOrEqual(6);
    for (const [, name, value] of withCjk) {
      const beforeCjk = value!.slice(0, value!.indexOf('var(--cjk-font-stack)'));
      expect({ name, beforeCjk }).toEqual({
        name,
        beforeCjk: expect.not.stringMatching(
          /(?<![\w-])(?:sans-serif|serif|monospace|system-ui)\b/,
        ),
      });
    }
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

  it('keeps every companion face out of the root module graph', () => {
    // A next/font call in lib/fonts.ts (imported by the root layout) would put
    // its @font-face stylesheet on every page of every locale again.
    expect(source).not.toMatch(/\b(Noto_Sans_[A-Z]+|Onest)\s*\(/);
    expect(source).not.toMatch(/import \{[^}]*\b(Noto_Sans_[A-Z]+|Onest)\b/);
    const rootDocument = read('app/root-document.tsx');
    expect(rootDocument).not.toContain('companion-fonts/');
    expect(rootDocument).toContain('<CompanionFontFaces');
    expect(rootDocument).toContain('LOCALE_COMPANION_FONTS');
  });

  it.each(companionExports)('loads the %s face from its own code-split module', (exportName) => {
    const { id, family, variable } = descriptor(exportName);
    expect(variable).toMatch(/^--font-/);
    const path = `${COMPANION_DIR}/${id}.tsx`;
    expect(existsSync(resolve(ROOT, path))).toBe(true);
    const faceModule = read(path);
    // The loader named after the family: 'Noto Sans SC' → Noto_Sans_SC.
    const loader = family.replace(/ /g, '_');
    expect(faceModule).toContain(`import { ${loader} } from 'next/font/google'`);
    expect(faceModule).toContain(`${loader}({`);
    expect(faceModule).toContain('preload: false');
    // Code-split through next/dynamic from the Client Component, the only
    // place where the split (and the per-page stylesheet link) happens.
    const entry = new RegExp(
      `'?${id}'?: dynamic\\(\\(\\) => import\\('\\./companion-fonts/${id}'\\)\\)`,
    );
    expect(loaderSource).toMatch(entry);
  });

  it('keeps the CJK cuts on `display: optional` and Onest on `swap`', () => {
    for (const exportName of companionExports) {
      const { id } = descriptor(exportName);
      const faceModule = read(`${COMPANION_DIR}/${id}.tsx`);
      // CJK: no late full-page metric swap on slow links. Onest is small, and
      // a swap keeps every heading of a uk or vi page in one face.
      const expected = id === 'onest' ? "display: 'swap'" : "display: 'optional'";
      expect({ id, display: faceModule.includes(expected) }).toEqual({ id, display: true });
    }
  });

  it('ships no companion module the registry does not name', () => {
    const ids = companionExports.map((name) => `${descriptor(name).id}.tsx`).sort();
    expect(readdirSync(resolve(ROOT, COMPANION_DIR)).sort()).toEqual(ids);
  });

  it('names each companion family in global.css, so every stack stays valid on every page', () => {
    // The family variables used to come from next/font classes on <html>.
    // They are defined unconditionally now; a page that does not load the
    // face resolves the name to nothing and moves on down the stack.
    const root = rules.find(
      (rule) => rule.selector === ':root' && rule.body.includes('--font-noto'),
    );
    expect(root).toBeDefined();
    for (const exportName of companionExports) {
      const { family, variable } = descriptor(exportName);
      expect(root!.body).toContain(`${variable}: '${family}'`);
    }
  });

  it('overrides the display stack for every Onest locale outside any cascade layer', () => {
    // :root declares --display-font-stack unlayered. Both :root and the
    // html:lang() rule target the <html> element, and an unlayered declaration
    // beats any layered one regardless of specificity — an override placed
    // inside @layer base would silently never apply. One rule serves every
    // alphabetic locale Clash Display cannot set; the locales it must name
    // are derived from LOCALE_COMPANION_FONTS.
    const onestLocales = registry()
      .filter(([, name]) => name === 'onest')
      .map(([locale]) => locale);
    expect(onestLocales.length).toBeGreaterThanOrEqual(2);

    const rootIndex = css.indexOf(':root {');
    const overrideIndex = css.indexOf('--display-font-stack: var(--font-onest)');
    expect(rootIndex).toBeGreaterThan(-1);
    expect(overrideIndex).toBeGreaterThan(rootIndex);
    const ruleStart = css.lastIndexOf('}', overrideIndex) + 1;
    const selector = css
      .slice(ruleStart, css.indexOf('{', ruleStart))
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    // Top-level rules are unindented; anything inside @layer is indented.
    expect(css.slice(css.indexOf(selector) - 1, css.indexOf(selector))).toBe('\n');
    // `html:lang()` matches the language and its regional variants (AGENTS.md);
    // the attribute form would miss `uk-UA`.
    expect(selector).not.toMatch(/html\[lang=/);
    for (const locale of onestLocales) expect(selector).toContain(`html:lang(${locale})`);
  });

  it('references every declared font variable from a stack in global.css', () => {
    // A face whose CSS variable no rule reads is loaded for nothing — and its
    // locale silently renders in the default cut, which for a Japanese or
    // Hong Kong reader means the wrong glyph forms.
    const variables = [...source.matchAll(/variable: '(--font-[a-z-]+)'/g)].map((m) => m[1]);
    expect(variables.length).toBeGreaterThanOrEqual(9);
    for (const variable of variables) expect(css).toContain(`var(${variable})`);
  });

  it('wires every companion face into a rule scoped to its locale', () => {
    // LOCALE_COMPANION_FONTS records the decision; this proves the CSS acted
    // on it. A locale whose companion face no `html:lang()` rule references
    // would load the face and still render its text in the default stack.
    const entries = registry();
    expect(entries.length).toBeGreaterThanOrEqual(8);
    for (const [locale, exportName] of entries) {
      if (exportName === 'null') continue;
      const { variable } = descriptor(exportName);
      const scoped = rules
        .filter((rule) => rule.body.includes(`var(${variable})`))
        .some((rule) => rule.selector.includes(`html:lang(${locale})`));
      expect({ locale, variable, scoped }).toEqual({ locale, variable, scoped: true });
    }
  });

  it('routes every CJK font stack through --cjk-font-stack', () => {
    // The default CJK stack is platform-only: pages in other languages never
    // route text through a web cut they have not loaded. Each Chinese locale
    // names its own cut; no other rule may name a Noto cut directly,
    // otherwise a Traditional page would render mainland forms.
    const root = rules.find((rule) => rule.selector === ':root' && rule.body.includes('--cjk'));
    expect(root!.body).toMatch(/--cjk-font-stack:\s*'PingFang SC'/);
    expect(root!.body).not.toMatch(/--cjk-font-stack:[^;]*var\(--font-noto/);
    for (const rule of rules) {
      if (!/var\(--font-noto-/.test(rule.body)) continue;
      expect({
        selector: rule.selector,
        viaStack: /^\s*--cjk-font-stack:/m.test(rule.body),
      }).toEqual({
        selector: rule.selector,
        viaStack: true,
      });
    }
    expect(css).toContain('var(--cjk-font-stack)');
    expect(css).not.toMatch(/html\[lang='zh'\]/);
    // Chinese headings never inherit Latin display tracking.
    expect(cssWithoutComments).toMatch(/\):lang\(zh\)[\s\S]*?letter-spacing: 0 !important/);
  });

  it.each([
    ['zh', '--font-noto-sc', 'PingFang SC', 'Microsoft YaHei'],
    ['zh-TW', '--font-noto-tc', 'PingFang TC', 'Microsoft JhengHei'],
    ['zh-HK', '--font-noto-hk', 'PingFang HK', 'Microsoft JhengHei'],
    ['ko', '--font-noto-kr', 'Apple SD Gothic Neo', 'Malgun Gothic'],
    ['ja', '--font-noto-jp', 'Hiragino Sans', 'Meiryo'],
  ])(
    'swaps the %s CJK stack outside any cascade layer',
    (locale, variable, appleFallback, windowsFallback) => {
      const rootIndex = css.indexOf(':root {');
      const overrideIndex = css.indexOf(`html:lang(${locale}) {`);
      expect(overrideIndex).toBeGreaterThan(rootIndex);
      // Top-level rules are unindented; anything inside @layer is indented.
      expect(css.slice(overrideIndex - 1, overrideIndex)).toBe('\n');
      // Prettier wraps long comma lists onto a continuation line.
      const overrideBlock = css
        .slice(overrideIndex, css.indexOf('}', overrideIndex))
        .replace(/\s+/g, ' ');
      expect(overrideBlock).toContain(`--cjk-font-stack: var(${variable}), '${appleFallback}'`);
      expect(overrideBlock).toContain(`'${windowsFallback}'`);
    },
  );

  it('declares the Traditional Chinese stacks after the Simplified one', () => {
    // `html:lang(zh)` also matches zh-TW and zh-HK with equal specificity.
    const zh = css.indexOf('html:lang(zh) {');
    expect(zh).toBeGreaterThan(-1);
    expect(css.indexOf('html:lang(zh-TW) {')).toBeGreaterThan(zh);
    expect(css.indexOf('html:lang(zh-HK) {')).toBeGreaterThan(zh);
  });

  it('gives Japanese CJK line breaking, not the Korean keep-all', () => {
    // `keep-all` is right for Korean (never split a word between syllables)
    // and wrong for Japanese, which has no word spaces to fall back on; the
    // Japanese rule tightens kinsoku instead.
    const jaIndex = css.indexOf('html:lang(ja) {');
    const jaBlock = css.slice(jaIndex, css.indexOf('}', jaIndex));
    expect(jaBlock).toContain('line-break: strict');
    expect(jaBlock).not.toContain('keep-all');
    const koIndex = css.indexOf('html:lang(ko) {');
    expect(css.slice(koIndex, css.indexOf('}', koIndex))).toContain('word-break: keep-all');
  });

  it('never breaks Korean monospace text between characters', () => {
    // A document-wide `break-all` on .font-mono split the live countdown
    // ("22:22:5 / 9") and durations ("25 / 초"). keep-all still lets
    // addresses wrap through overflow-wrap: anywhere.
    expect(cssWithoutComments).not.toMatch(/:lang\(ko\)[^{]*font-mono[^{]*\{[^}]*break-all/);
    expect(cssWithoutComments).not.toMatch(/word-break:\s*break-all/);
  });

  it('gives language islands their own CJK cut', () => {
    // The language menu tags each endonym with its own lang; 日本語 on an
    // English page must take Japanese glyph forms, not the Simplified default.
    for (const lang of ['zh', 'zh-TW', 'zh-HK', 'ja', 'ko']) {
      const rule = rules.find(
        (r) => r.selector === `:where([lang]:not(html)):lang(${lang})` && r.body.includes('--cjk'),
      );
      expect({ lang, found: Boolean(rule) }).toEqual({ lang, found: true });
    }
  });

  it('limits Title-Case button labels to English', () => {
    // Button variants use Tailwind `capitalize`; cased languages other than
    // English write labels in sentence case, so the transform is switched off
    // for every non-English document (unlayered, to outrank utilities).
    const ruleIndex = css.indexOf("html:not([lang='en']) .capitalize {");
    expect(ruleIndex).toBeGreaterThan(-1);
    expect(css.slice(ruleIndex - 1, ruleIndex)).toBe('\n');
    expect(css.slice(ruleIndex, css.indexOf('}', ruleIndex))).toContain('text-transform: none');
  });

  it('ships the referenced local font files in public/fonts', () => {
    const publicFonts = resolve(ROOT, 'public', 'fonts');
    expect(
      existsSync(resolve(publicFonts, 'ClashDisplay', 'fonts', 'ClashDisplay-Variable.woff2')),
    ).toBe(true);
    // The local Inter directory must stay deleted; next/font/google owns Inter.
    expect(existsSync(resolve(publicFonts, 'Inter'))).toBe(false);
  });
});
