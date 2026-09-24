import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as conceptIcons from '@/lib/conceptIcons';
import { CONCEPT_ICONS } from '@/lib/conceptIcons';

/**
 * A pattern constant from eslint.config.mjs, read as text: the config is an
 * ES module that jest does not load. The source holds a JS string literal,
 * so its escaped backslashes are unescaped before building the RegExp.
 */
function eslintPattern(name: string): RegExp {
  const config = readFileSync(resolve(__dirname, '..', '..', 'eslint.config.mjs'), 'utf8');
  const literal = config.match(new RegExp(`const ${name} =\\s*'([^']+)';`))?.[1];
  if (!literal) throw new Error(`eslint.config.mjs no longer defines ${name}`);
  if (!config.includes(`importNamePattern: ${name}`) && !config.includes(`regex: ${name}`)) {
    throw new Error(`eslint.config.mjs defines ${name} but no longer restricts imports with it`);
  }
  return new RegExp(literal.replace(/\\\\/g, '\\'), 'u');
}

describe('concept icons', () => {
  const entries = Object.entries(CONCEPT_ICONS);
  const offLexiconName = eslintPattern('OFF_LEXICON_ICON_NAMES');
  const offLexiconModule = eslintPattern('OFF_LEXICON_ICON_MODULES');

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

  it('restricts every alias lucide exports for an off-lexicon glyph', () => {
    for (const glyph of ['Gavel', 'Trophy', 'Crown', 'Swords', 'Gamepad2', 'Dices', 'Gift']) {
      for (const alias of [glyph, `${glyph}Icon`, `Lucide${glyph}`]) {
        expect(offLexiconName.test(alias)).toBe(true);
      }
    }
    for (const glyph of ['TicketCheck', 'TicketsPlane', 'Dice3', 'HandCoins', 'PiggyBank']) {
      expect(offLexiconName.test(glyph)).toBe(true);
    }
    // Every name the pattern restricts is a real lucide export, and it leaves
    // ordinary glyphs alone.
    // (Read through requireActual: a namespace import of lucide-react is
    // itself restricted by the rule under test.)
    const lucide = jest.requireActual<Record<string, unknown>>('lucide-react');
    const restrictedExports = Object.keys(lucide).filter((name) => offLexiconName.test(name));
    expect(restrictedExports).toEqual(
      expect.arrayContaining(['Trophy', 'TrophyIcon', 'LucideTrophy', 'LucideGavel']),
    );
    for (const name of ['Stamp', 'Anchor', 'Clock', 'Layers', 'Signature', 'HandMetal']) {
      expect(offLexiconName.test(name)).toBe(false);
    }
  });

  it('restricts the per-icon module paths too', () => {
    expect(offLexiconModule.test('lucide-react/dist/esm/icons/trophy')).toBe(true);
    expect(offLexiconModule.test('lucide-react/dist/esm/icons/hand-coins.js')).toBe(true);
    expect(offLexiconModule.test('lucide-react/dist/esm/icons/stamp')).toBe(false);
  });

  it('never maps a concept to a glyph ESLint restricts', () => {
    const offending = entries
      .map(([concept, icon]) => [concept, icon.displayName ?? ''] as const)
      .filter(([, name]) => offLexiconName.test(name));
    expect(offending).toEqual([]);
    // The named exports are the same glyphs under their concept names.
    const exportedNames = Object.keys(conceptIcons).filter((name) => name.endsWith('Icon'));
    expect(exportedNames.filter((name) => offLexiconName.test(name))).toEqual([]);
  });
});
