import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CONCEPT_ICONS } from '@/lib/conceptIcons';

/** The lucide-react names eslint.config.mjs refuses to import. */
function restrictedIconNames(): string[] {
  const config = readFileSync(resolve(__dirname, '..', '..', 'eslint.config.mjs'), 'utf8');
  const entry = config.match(/name: 'lucide-react',\s*importNames: \[([\s\S]*?)\]/);
  if (!entry?.[1]) throw new Error('eslint.config.mjs no longer restricts lucide-react imports');
  return [...entry[1].matchAll(/'([A-Za-z0-9]+)'/g)].map((match) => match[1] ?? '');
}

describe('concept icons', () => {
  const entries = Object.entries(CONCEPT_ICONS);

  it('gives every coined concept its own glyph', () => {
    const glyphs = new Set(entries.map(([, icon]) => icon));
    expect(glyphs.size).toBe(entries.length);
  });

  it('covers the coined vocabulary in the lexicon table', () => {
    expect(Object.keys(CONCEPT_ICONS)).toEqual(
      expect.arrayContaining([
        'gesture',
        'cycle',
        'calibrationWindow',
        'signatureAllocation',
        'enduranceChampion',
        'chronoWarrior',
        'stellarSelection',
        'anchoring',
        'anchorDistribution',
        'retrieve',
        'imprint',
        'publicGoods',
        'outreachReserve',
        'cosmicCouncil',
        'recipient',
      ]),
    );
  });

  it('never maps a concept to auction, lottery, prize or game imagery', () => {
    const restricted = new Set(restrictedIconNames());
    for (const name of ['Gavel', 'Trophy', 'Crown', 'Swords', 'Gamepad2', 'Dices', 'Gift']) {
      expect(restricted.has(name)).toBe(true);
    }
    const offending = entries
      .map(([concept, icon]) => [concept, icon.displayName ?? ''] as const)
      .filter(([, name]) => restricted.has(name));
    expect(offending).toEqual([]);
  });
});
