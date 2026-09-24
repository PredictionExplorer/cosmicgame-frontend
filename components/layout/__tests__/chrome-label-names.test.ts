import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LOCALE_SHORT_LABELS } from '@/components/layout/LanguageSwitcher';
import { LOCALE_LABELS, routing } from '@/i18n/routing';

/**
 * WCAG 2.5.3 Label in Name, checked on the catalogs of every locale: where a
 * header control shows a short visible label and carries a longer
 * accessible name, the name must contain the visible text, so a voice
 * control user can say what they see.
 */
const messagesDir = join(__dirname, '..', '..', '..', 'messages');

interface ChromeCatalogs {
  nav: { search: { trigger: string; triggerLabel: string } };
  common: { languageSwitcher: { label: string; currentShort: string } };
}

function catalog<N extends keyof ChromeCatalogs>(locale: string, namespace: N): ChromeCatalogs[N] {
  return JSON.parse(readFileSync(join(messagesDir, locale, `${namespace}.json`), 'utf8'));
}

function fill(message: string, values: Record<string, string>): string {
  return message.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

describe.each(routing.locales)('chrome control names in %s', (locale) => {
  it('names the search button with its visible label in it', () => {
    const { search } = catalog(locale, 'nav');
    expect(search.triggerLabel.toLocaleLowerCase(locale)).toContain(
      search.trigger.toLocaleLowerCase(locale),
    );
  });

  it('names the language control with both its short and full visible label', () => {
    const switcher = catalog(locale, 'common').languageSwitcher;
    const name = fill(switcher.currentShort, {
      language: LOCALE_LABELS[locale],
      short: LOCALE_SHORT_LABELS[locale],
    });
    expect(name).toContain(LOCALE_LABELS[locale]);
    expect(name).toContain(LOCALE_SHORT_LABELS[locale]);
    expect(name.startsWith(switcher.label)).toBe(true);
  });
});
