import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { whitePaperPdfPath } from '@/content/white-paper/types';
import { sourceRegistryProblems } from '@/scripts/build-og-fonts-core';
import { LOCALE_CONVENTIONS } from '@/scripts/i18n-conventions-core';
import { LEXICON_PROFILES } from '@/scripts/lexicon-scan-core';
import { TERMINOLOGY_PACKS } from '@/scripts/terminology-consistency-core';
import { SCRIPT_PATTERNS } from '@/test-utils/locale-expectations';

import { OG_TYPOGRAPHY } from '@/lib/og/fonts';

import { LOCALE_LABELS, routing, TRANSLATED_LOCALES } from '../routing';

/**
 * The files a locale needs that no type can require: its handbook documents,
 * the documents its gates cite, its white-paper PDF, the OG font notices.
 * Registering a locale without them fails `npm test` here instead of
 * surfacing as a 404 or an unexplained gate diagnostic.
 */
const ROOT = process.cwd();
const exists = (path: string): boolean => existsSync(join(ROOT, path));

describe.each(TRANSLATED_LOCALES)('%s locale artifacts', (locale) => {
  it('has a glossary, a style guide, and a progress tracker', () => {
    for (const document of ['glossary', 'style-guide', 'progress']) {
      expect(exists(`docs/i18n/${document}-${locale}.md`)).toBe(true);
    }
  });

  it('points its gates at documents that exist', () => {
    expect(exists(LEXICON_PROFILES[locale].glossary)).toBe(true);
    expect(exists(TERMINOLOGY_PACKS[locale].glossary)).toBe(true);
    const conventions = LOCALE_CONVENTIONS[locale];
    if (conventions) expect(exists(conventions.styleGuide)).toBe(true);
  });

  it('ships its white-paper PDF', () => {
    expect(exists(join('public', whitePaperPdfPath(locale)))).toBe(true);
  });

  it('labels itself in its own script in the language switcher', () => {
    expect(LOCALE_LABELS[locale]).toMatch(SCRIPT_PATTERNS[locale]);
  });
});

describe('Open Graph font assets', () => {
  it('keeps the typography and source registries in agreement', () => {
    expect(sourceRegistryProblems()).toEqual([]);
  });

  it('names every embedded font and its license in THIRD_PARTY_NOTICES.md', () => {
    const notices = readFileSync(join(ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    for (const locale of routing.locales) {
      const { font } = OG_TYPOGRAPHY[locale];
      if (!font) continue;
      expect(notices).toContain(`assets/fonts/${basename(fileURLToPath(font.file))}`);
      expect(notices).toContain(`assets/fonts/${basename(fileURLToPath(font.license))}`);
    }
  });
});
