import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { fileLocale } from '@/scripts/locale-files';
import { fontCodePoints } from '@/scripts/font-cmap';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing, type AppLocale } from '@/i18n/routing';

/**
 * Display-face coverage (docs/i18n/README.md §5).
 *
 * Clash Display is the site's display face, and it carries a basic Latin
 * repertoire only: no Cyrillic, none of the stacked Vietnamese diacritics
 * (ế, ợ, ữ), no horned Ơ/Ư. A heading in a language that needs such letters
 * does not fail loudly — the browser sets the letters Clash has in Clash and
 * pulls every other letter from the next face in the stack, so one word
 * changes font mid-way. Ukrainian and Vietnamese avoid this by declaring a
 * companion display face (`LOCALE_COMPANION_FONTS`) and swapping the whole
 * `--display-font-stack` under their `html:lang()` rule.
 *
 * This test derives that need from the copy itself: every letter in a
 * locale's catalogs and content modules that Clash Display cannot map must be
 * matched by a companion face and a display-stack override for that locale.
 * A tenth language written in an alphabet Clash only partly covers (Polish,
 * Turkish, Russian, …) therefore fails here on its first translated string
 * instead of shipping headings with mixed faces.
 *
 * CJK locales are exempt by design: their display stack is Clash for Latin
 * tokens plus the regional Noto Sans CJK cut per glyph, and that fallback is
 * the intended rendering, not a defect.
 */

const REPO_ROOT = resolve(__dirname, '..', '..');
const CLASH_DISPLAY = resolve(
  REPO_ROOT,
  'public/fonts/ClashDisplay/fonts/ClashDisplay-Variable.ttf',
);

/** Script families whose display face must set every letter of a word itself. */
const ALPHABETIC_FAMILIES = new Set(['latin', 'cyrillic']);

function walk(directory: string, out: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** Every catalog and copy module a locale owns (scripts/locale-files.ts). */
function copyFilesOf(locale: AppLocale): string[] {
  return [...walk(resolve(REPO_ROOT, 'messages')), ...walk(resolve(REPO_ROOT, 'content'))]
    .filter((path) => /\.(json|ts|tsx)$/.test(path))
    .filter((path) => fileLocale(path) === locale);
}

/** Distinct letters (Unicode `L` category) across `files`, by code point. */
function lettersIn(files: readonly string[]): string[] {
  const letters = new Set<string>();
  for (const file of files) {
    for (const character of readFileSync(file, 'utf8')) {
      if (/\p{L}/u.test(character)) letters.add(character);
    }
  }
  return [...letters].sort();
}

/** `LOCALE_COMPANION_FONTS` entries, read from source (next/font cannot run under jest). */
function companionFaces(): Record<string, string> {
  const source = readFileSync(resolve(REPO_ROOT, 'lib/fonts.ts'), 'utf8');
  const start = source.indexOf('export const LOCALE_COMPANION_FONTS');
  const registry = source.slice(start, source.indexOf('};', start));
  return Object.fromEntries(
    [...registry.matchAll(/^\s+'?([a-zA-Z-]+)'?: ([a-zA-Z]+),$/gm)].map((m) => [m[1]!, m[2]!]),
  );
}

/** Locales for which a CSS rule scoped to the locale replaces `--display-font-stack`. */
function displayStackOverrides(): Set<string> {
  const css = readFileSync(resolve(REPO_ROOT, 'styles/global.css'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  const overridden = new Set<string>();
  for (const rule of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    if (!rule[2]!.includes('--display-font-stack:')) continue;
    for (const locale of routing.locales) {
      if (
        rule[1]!.includes(`html:lang(${locale})`) ||
        rule[1]!.includes(`html[lang='${locale}']`)
      ) {
        overridden.add(locale);
      }
    }
  }
  return overridden;
}

describe('display-face coverage', () => {
  const clash = fontCodePoints(new Uint8Array(readFileSync(CLASH_DISPLAY)));
  const companions = companionFaces();
  const overrides = displayStackOverrides();

  it('reads the Clash Display repertoire', () => {
    expect(clash.has('A'.codePointAt(0)!)).toBe(true);
    expect(clash.has('é'.codePointAt(0)!)).toBe(true);
    // The two gaps that forced the Ukrainian and Vietnamese companions.
    expect(clash.has('Ж'.codePointAt(0)!)).toBe(false);
    expect(clash.has('ế'.codePointAt(0)!)).toBe(false);
  });

  it('records a companion decision for every routing locale', () => {
    expect(Object.keys(companions).sort()).toEqual([...routing.locales].sort());
  });

  const alphabetic = routing.locales.filter((locale) =>
    ALPHABETIC_FAMILIES.has(getLocaleConfig(locale).scriptFamily),
  );

  it.each(alphabetic)(
    '%s headings render in one face: Clash Display covers the copy, or a companion replaces it',
    (locale) => {
      const files = copyFilesOf(locale);
      expect(files.length).toBeGreaterThan(0);
      const uncovered = lettersIn(files).filter((letter) => !clash.has(letter.codePointAt(0)!));
      const hasCompanion = companions[locale] !== 'null';
      const swapsDisplayStack = overrides.has(locale);

      if (uncovered.length === 0) return;
      // The copy needs letters Clash Display lacks: the locale must name a
      // companion face in lib/fonts.ts AND swap --display-font-stack for it in
      // styles/global.css (docs/i18n/README.md §5 explains both steps).
      expect({ locale, uncovered: uncovered.join(''), hasCompanion, swapsDisplayStack }).toEqual({
        locale,
        uncovered: uncovered.join(''),
        hasCompanion: true,
        swapsDisplayStack: true,
      });
    },
  );

  it('does not swap the display stack for a locale Clash Display already covers', () => {
    // The inverse guard: an override for a fully covered alphabetic locale
    // would load a companion face for nothing and change its headings' voice.
    for (const locale of alphabetic) {
      const uncovered = lettersIn(copyFilesOf(locale)).filter(
        (letter) => !clash.has(letter.codePointAt(0)!),
      );
      if (uncovered.length === 0)
        expect({ locale, override: overrides.has(locale) }).toEqual({
          locale,
          override: false,
        });
    }
  });
});
