import {
  TOKEN_1_METADATA_V2,
  TOKEN_43_METADATA_V1,
  TOKEN_7_METADATA_V2,
} from '../__fixtures__/metadata';
import { buildFacets, chaosBounds, scoreRarity } from '../rarity';
import { normalizeTraitEntry, type NftTraitEntry } from '../traits';
import { parseCosmicSignatureMetadata } from '../types';

const entry1 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
const entry7 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_7_METADATA_V2)!)!;
const legacy = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_43_METADATA_V1)!)!;

/** A synthetic sibling of token 7 sharing every trait, to create a common cohort. */
const twin: NftTraitEntry = { ...entry7, id: 8 };
const collection = [entry1, entry7, twin, legacy];

describe('buildFacets', () => {
  it('counts values across trait-bearing tokens only, most common first', () => {
    const facets = buildFacets(collection);
    expect(facets.structure).toEqual([
      { value: 'Time Chords', count: 2, share: 2 / 3 },
      { value: 'Orbit Ribbons', count: 1, share: 1 / 3 },
    ]);
    expect(facets.fate.map((option) => option.value)).toEqual(['Eternal Dance', 'Ejection']);
  });

  it('exposes optional traits only for tokens carrying them', () => {
    const facets = buildFacets(collection);
    expect(facets.wildcard).toEqual([{ value: 'Yes', count: 1, share: 1 / 3 }]);
    expect(facets.underlay).toEqual([{ value: 'Stipple Constellation', count: 1, share: 1 / 3 }]);
    expect(facets.finish).toEqual([]);
  });

  it('returns empty facets for an empty collection', () => {
    const facets = buildFacets([]);
    expect(facets.structure).toEqual([]);
    expect(facets.palette).toEqual([]);
  });
});

describe('scoreRarity', () => {
  it('ranks the token with the most uncommon traits first', () => {
    const rarity = scoreRarity(collection);
    expect(rarity.total).toBe(3);
    expect(rarity.byId.get(1)?.rank).toBe(1);
    expect(rarity.byId.get(7)?.rank).toBe(2);
    expect(rarity.byId.get(8)?.rank).toBe(2);
    expect(rarity.byId.has(43)).toBe(false);
  });

  it('scores identical tokens identically and higher-information tokens higher', () => {
    const rarity = scoreRarity(collection);
    const score1 = rarity.byId.get(1)!.score;
    const score7 = rarity.byId.get(7)!.score;
    expect(rarity.byId.get(8)!.score).toBe(score7);
    expect(score1).toBeGreaterThan(score7);
  });

  it('names the rarest trait a token actually carries', () => {
    const rarity = scoreRarity(collection);
    const rarest = rarity.byId.get(1)!.rarest!;
    expect(rarest.count).toBe(1);
    expect(rarest.share).toBeCloseTo(1 / 3);
    // Token 7's traits are all shared with its twin except nothing unique:
    // its rarest carried trait is one of the two-of-three values.
    expect(rarity.byId.get(7)!.rarest!.count).toBe(2);
  });

  it('handles an empty collection', () => {
    const rarity = scoreRarity([]);
    expect(rarity.total).toBe(0);
    expect(rarity.byId.size).toBe(0);
  });
});

describe('chaosBounds', () => {
  it('returns the inclusive chaos range of trait-bearing tokens', () => {
    expect(chaosBounds(collection)).toEqual({ min: 18, max: 22 });
  });

  it('returns null when no token has a chaos index', () => {
    expect(chaosBounds([legacy])).toBeNull();
    expect(chaosBounds([])).toBeNull();
  });
});
