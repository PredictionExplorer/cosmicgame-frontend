import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  checkSourceNamespace,
  compareNamespace,
  strictProblems,
  type Messages,
} from '../../scripts/i18n-parity-core';
import { getLocaleConfig } from '../localeConfig';
import { NAMESPACES } from '../request';
import { routing, TRANSLATED_LOCALES } from '../routing';

/**
 * The same integrity gate `npm run i18n:strict` applies in CI, run under
 * jest so a broken catalog fails `npm test` locally too. Every check is
 * derived from routing.locales and each locale's Intl tag; adding a locale
 * adds its rows here automatically.
 */

const readCatalog = (locale: string, namespace: string): Messages =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), 'messages', locale, `${namespace}.json`), 'utf8'),
  ) as Messages;

describe('source catalogs', () => {
  it.each(NAMESPACES)('%s is well-formed ICU with complete plurals', (namespace) => {
    const report = checkSourceNamespace(
      namespace,
      readCatalog(routing.defaultLocale, namespace),
      getLocaleConfig(routing.defaultLocale).intlLocale,
    );
    expect(report.syntaxErrors).toEqual([]);
    expect(report.pluralGaps).toEqual([]);
  });
});

describe.each(TRANSLATED_LOCALES)('%s catalogs', (locale) => {
  const intlLocale = getLocaleConfig(locale).intlLocale;

  it.each(NAMESPACES)(
    '%s mirrors the source keys, placeholders, and plural categories',
    (namespace) => {
      const report = compareNamespace({
        namespace,
        source: readCatalog(routing.defaultLocale, namespace),
        translation: readCatalog(locale, namespace),
        intlLocale,
      });
      expect(strictProblems(report)).toEqual([]);
    },
  );
});
