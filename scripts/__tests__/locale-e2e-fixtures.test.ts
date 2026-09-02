import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from '../../e2e/locale-fixtures';
import { LOCALE_ROUTE_IDS } from '../../e2e/locale-route-inventory';
import { TRANSLATED_LOCALES } from '../../i18n/routing';

/**
 * The e2e locale fixtures are plain data, so a locale can be registered in
 * routing without anyone noticing the browser suites never run for it. This
 * guard fails `npm test` instead: every translated locale needs its chrome
 * strings, a complete route→text table, and the two spec files that plug it
 * into the shared runners.
 */
describe('e2e locale fixtures', () => {
  it.each(TRANSLATED_LOCALES)('%s has chrome strings in the locale script', (locale) => {
    const chrome = LOCALE_CHROME[locale];
    expect(chrome).toBeDefined();
    for (const text of [
      chrome.switcherLabel,
      chrome.switcherOption,
      chrome.footer.terms,
      chrome.footer.privacy,
      chrome.nav.gallery,
      chrome.nav.help,
      chrome.siteMap.heading,
      chrome.skipLink,
      chrome.landingText,
    ]) {
      expect(text).toMatch(chrome.script);
    }
  });

  it.each(TRANSLATED_LOCALES)('%s has expected text for every inventoried route', (locale) => {
    const table = LOCALE_ROUTE_TEXT[locale];
    expect(Object.keys(table).sort()).toEqual([...LOCALE_ROUTE_IDS].sort());

    const script = LOCALE_CHROME[locale].script;
    const notInScript = Object.entries(table)
      .filter(([, text]) => !script.test(text))
      .map(([routeId]) => routeId);
    expect(notInScript).toEqual([]);
  });

  it.each(TRANSLATED_LOCALES)('%s has smoke and site-QA spec files', (locale) => {
    const e2eDir = join(process.cwd(), 'e2e');
    expect(existsSync(join(e2eDir, `${locale}-smoke.spec.ts`))).toBe(true);
    expect(existsSync(join(e2eDir, `${locale}-site-qa.desktop.spec.ts`))).toBe(true);
  });
});
