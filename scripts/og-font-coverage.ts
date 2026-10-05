/**
 * Whether every locale's share-card font stacks can draw its copy. Shared by
 * the unit suite (lib/og/__tests__/og-localization.test.ts) and the subset
 * build (scripts/build-og-fonts.ts), which refuses to write a set of subsets
 * that leaves any character of any locale to a fallback face.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { routing, type AppLocale } from '../i18n/routing';
import { OG_SHARED_FONTS, OG_TYPOGRAPHY, type OgFontFile } from '../lib/og/fonts';

import { ogRenderedText } from './build-og-fonts-core';
import { fontCodePoints } from './font-cmap';

const codePointsByFile = new Map<string, Set<number>>();

function codePoints(font: OgFontFile): Set<number> {
  const path = fileURLToPath(font.file);
  let points = codePointsByFile.get(path);
  if (!points) {
    points = fontCodePoints(new Uint8Array(readFileSync(path)));
    codePointsByFile.set(path, points);
  }
  return points;
}

/** Characters of `text` that no face of `stack` maps. */
export function uncoveredBy(stack: readonly OgFontFile[], text: string): string[] {
  const faces = stack.map(codePoints);
  return Array.from(new Set(text)).filter((char) => {
    const point = char.codePointAt(0)!;
    return !faces.some((face) => face.has(point));
  });
}

/** One line per locale and role whose stack leaves characters of the copy uncovered. */
export function ogCoverageProblems(root: string, locales: readonly AppLocale[] = routing.locales) {
  const problems: string[] = [];
  for (const locale of locales) {
    const text = ogRenderedText(root, locale);
    const { display, body } = OG_TYPOGRAPHY[locale];
    for (const [role, stack] of [
      ['display', display],
      ['body', body],
    ] as const) {
      const missing = uncoveredBy([...stack, ...OG_SHARED_FONTS], text);
      if (missing.length > 0) problems.push(`${locale} ${role}: ${missing.join(' ')}`);
    }
  }
  return problems;
}
