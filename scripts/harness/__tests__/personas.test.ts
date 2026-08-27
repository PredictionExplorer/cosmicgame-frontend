import {
  HARDHAT_ACCOUNTS,
  OWNER_ACCOUNT_INDEX,
  PERSONAS,
  PUBLIC_GOODS_ACCOUNT_INDEX,
  createRng,
  pickInt,
  pickOne,
  pickWeighted,
} from '../director/personas';

describe('personas', () => {
  it('maps every persona to a distinct non-reserved dev account', () => {
    const indexes = PERSONAS.map((p) => p.accountIndex);
    expect(new Set(indexes).size).toBe(PERSONAS.length);
    expect(indexes).not.toContain(OWNER_ACCOUNT_INDEX);
    expect(indexes).not.toContain(PUBLIC_GOODS_ACCOUNT_INDEX);
    for (const index of indexes) {
      expect(HARDHAT_ACCOUNTS[index]).toBeDefined();
    }
  });

  it('keeps persona names unique', () => {
    const names = PERSONAS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps style probabilities in [0, 1]', () => {
    for (const persona of PERSONAS) {
      for (const value of [
        persona.style.cstAffinity,
        persona.style.rwlkAffinity,
        persona.style.attachmentAffinity,
        persona.style.chattiness,
      ]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
      expect(persona.style.tempo).toBeGreaterThan(0);
    }
  });
});

describe('deterministic rng', () => {
  it('reproduces the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(Array.from({ length: 5 }, () => a())).not.toEqual(Array.from({ length: 5 }, () => b()));
  });

  it('pickInt stays inside the inclusive bounds', () => {
    const rng = createRng(7);
    for (let i = 0; i < 200; i++) {
      const value = pickInt(rng, 3, 9);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(9);
    }
  });

  it('pickOne returns members and pickWeighted honors zero weights', () => {
    const rng = createRng(11);
    const values = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 50; i++) {
      expect(values).toContain(pickOne(rng, values));
      expect(
        pickWeighted(rng, [
          ['x', 0],
          ['y', 1],
        ] as Array<[string, number]>),
      ).toBe('y');
    }
  });
});
