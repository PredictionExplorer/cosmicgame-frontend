/**
 * WCAG 2.5.3 (Label in Name): the Max button's accessible name must contain
 * its visible word, so a voice-control user who says "click Max" reaches it.
 * The aria label adds the balance after the word, in every locale.
 */
import fs from 'node:fs';
import path from 'node:path';

import { routing } from '@/i18n/routing';

function amountCopy(locale: string): { max: string; maxAria: string } {
  const file = path.join(process.cwd(), 'messages', locale, 'forms.json');
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    transfer: { amount: { max: string; maxAria: string } };
  };
  return catalog.transfer.amount;
}

describe.each(routing.locales)('forms.transfer.amount in %s', (locale) => {
  it('starts the Max button’s accessible name with its visible label', () => {
    const { max, maxAria } = amountCopy(locale);
    expect(maxAria.startsWith(max)).toBe(true);
    expect(maxAria).toContain('{amount}');
  });
});
