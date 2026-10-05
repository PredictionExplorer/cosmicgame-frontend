import { readFileSync } from 'node:fs';
import path from 'node:path';

import { routing } from '@/i18n/routing';

interface AllocationCopy {
  allocations: {
    amounts: { fixedCst: string };
    cards: Record<string, { name: string; tooltip: string }>;
  };
}

const catalog = (locale: string): AllocationCopy =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), 'messages', locale, 'currentCycle.json'), 'utf8'),
  ) as AllocationCopy;

/**
 * The "How the reserve splits" disclosure defines each allocation row. A
 * definition must say what the row is, never repeat its own name, and name
 * what the row lists.
 */
describe.each(routing.locales)('%s allocation definitions', (locale) => {
  const { cards, amounts } = catalog(locale).allocations;

  it('defines the Anchor Distribution without its own name', () => {
    const { name, tooltip } = cards.cosmicAnchor!;
    expect(tooltip.toLowerCase()).not.toContain(name.toLowerCase());
  });

  it('names the fixed CST the Chrono-Warrior row lists', () => {
    expect(cards.chronoWarrior!.tooltip).toContain(amounts.fixedCst);
  });
});
