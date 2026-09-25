import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { sourceTokens, unreferencedKeys } from '../i18n-unused-keys-core';

describe('unreferencedKeys', () => {
  const tokens = new Set(['status', 'metrics', 'ethGesture', 'label', 'items', 'eth-contribution']);

  it('reports a key with any segment no code spells', () => {
    expect(
      unreferencedKeys(
        'home',
        {
          status: { metrics: { ethGesture: { label: 'ETH' }, randomWalk: { label: 'RW' } } },
          ticker: { gestureLine: 'x' },
        },
        tokens,
        [],
      ),
    ).toEqual(['status.metrics.randomWalk.label', 'ticker.gestureLine']);
  });

  it('treats list indices as part of their parent and slugs as whole words', () => {
    expect(
      unreferencedKeys(
        'seo',
        { items: ['a', 'b'], 'eth-contribution': { label: 'x' } },
        tokens,
        [],
      ),
    ).toEqual([]);
  });

  it('skips the families reached through data', () => {
    expect(
      unreferencedKeys('traits', { values: { hue: { jade: 'Jade' } } }, tokens, ['traits:values.']),
    ).toEqual([]);
    expect(
      unreferencedKeys('other', { values: { hue: { jade: 'Jade' } } }, tokens, ['traits:values.']),
    ).toEqual(['values.hue.jade']);
  });
});

describe('sourceTokens', () => {
  let root: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'unused-keys-'));
    mkdirSync(join(root, 'components', '__tests__'), { recursive: true });
    writeFileSync(
      join(root, 'components', 'Card.tsx'),
      "t('status.finalizesIn'); href('/eth-contribution');",
    );
    writeFileSync(join(root, 'components', 'Card.test.tsx'), "t('onlyInATest')");
    writeFileSync(join(root, 'components', '__tests__', 'x.ts'), "t('alsoOnlyInATest')");
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('reads application source only, never tests', () => {
    const tokens = sourceTokens(root, ['components', 'missing']);
    expect(tokens.has('finalizesIn')).toBe(true);
    expect(tokens.has('eth-contribution')).toBe(true);
    expect(tokens.has('contribution')).toBe(true);
    expect(tokens.has('onlyInATest')).toBe(false);
    expect(tokens.has('alsoOnlyInATest')).toBe(false);
  });
});
