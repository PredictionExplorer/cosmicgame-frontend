import {
  TOKEN_1_METADATA_V2,
  TOKEN_43_METADATA_V1,
  TOKEN_7_METADATA_V2,
} from '../__fixtures__/metadata';
import { parseCosmicSignatureMetadata } from '../types';
import {
  categoricalValue,
  normalizeSeed,
  normalizeTraitEntry,
  presentCategoricalKeys,
} from '../traits';

describe('parseCosmicSignatureMetadata', () => {
  it('parses a v2 document and keeps every attribute row', () => {
    const parsed = parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2);
    expect(parsed).not.toBeNull();
    expect(parsed!.metadata_version).toBe('2.0.0');
    expect(parsed!.attributes).toHaveLength(14);
    expect(parsed!.properties?.simulation?.braid?.crossings).toBe(25);
    expect(parsed!.properties?.media?.web_image).toMatch(/full\.webp$/);
  });

  it('drops malformed attribute rows instead of failing the document', () => {
    const parsed = parseCosmicSignatureMetadata({
      ...TOKEN_7_METADATA_V2,
      attributes: [
        ...TOKEN_7_METADATA_V2.attributes,
        { value: 'no trait type' },
        { trait_type: 'Nested', value: { unexpected: true } },
        'garbage',
      ],
    });
    expect(parsed!.attributes).toHaveLength(TOKEN_7_METADATA_V2.attributes.length);
  });

  it('accepts a legacy v1 document', () => {
    const parsed = parseCosmicSignatureMetadata(TOKEN_43_METADATA_V1);
    expect(parsed).not.toBeNull();
    expect(parsed!.metadata_version).toBeUndefined();
    expect(parsed!.attributes).toHaveLength(3);
  });

  it('rejects non-object payloads', () => {
    expect(parseCosmicSignatureMetadata(null)).toBeNull();
    expect(parseCosmicSignatureMetadata('nope')).toBeNull();
    expect(parseCosmicSignatureMetadata([1, 2])).toBeNull();
  });
});

describe('normalizeTraitEntry', () => {
  const entry1 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
  const entry7 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_7_METADATA_V2)!)!;
  const entry43 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_43_METADATA_V1)!)!;

  it('maps every wire trait onto its canonical key', () => {
    expect(entry1).toMatchObject({
      id: 1,
      hasArtTraits: true,
      version: '2.0.0',
      structure: 'Orbit Ribbons',
      underlay: 'Stipple Constellation',
      symmetry: 'Rosette ×4',
      projection: 'Phase Portrait',
      wildcard: true,
      palette: 'Glacial Split',
      spectralClass: 'B',
      massBalance: 'Twin Binary',
      fate: 'Ejection',
      chaos: 22,
      chaosMax: 100,
      syzygies: 0,
      cycle: 0,
      imprinted: 1781506802,
      allocation: 'Last CST Gesture',
    });
  });

  it('carries the palette hues, wavelength, and bare seed from properties', () => {
    expect(entry1.hues).toEqual([252, 145, 205]);
    expect(entry1.wavelengthNm).toBe(476);
    expect(entry1.seed).toBe('36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce');
  });

  it('leaves optional traits undefined when a token does not carry them', () => {
    expect(entry7.underlay).toBeUndefined();
    expect(entry7.accent).toBeUndefined();
    expect(entry7.finish).toBeUndefined();
    expect(entry7.wildcard).toBeUndefined();
    expect(entry7.symmetry).toBe('Mirror');
    expect(entry7.hasArtTraits).toBe(true);
  });

  it('flags legacy documents as having no art traits but keeps cycle and imprint', () => {
    expect(entry43.hasArtTraits).toBe(false);
    expect(entry43.cycle).toBe(0);
    expect(entry43.imprinted).toBe(1735689728);
    expect(entry43.structure).toBeUndefined();
  });

  it('falls back to the caller-supplied id when the document has none', () => {
    const parsed = parseCosmicSignatureMetadata({ attributes: [] })!;
    expect(normalizeTraitEntry(parsed)).toBeNull();
    expect(normalizeTraitEntry(parsed, 12)?.id).toBe(12);
    expect(normalizeTraitEntry(parsed, -1)).toBeNull();
  });

  it('ignores unknown trait types and non-numeric numeric traits', () => {
    const parsed = parseCosmicSignatureMetadata({
      attributes: [
        { trait_type: 'Mystery', value: 'x' },
        { trait_type: 'Chaos', value: 'not-a-number' },
        { trait_type: 'Structure', value: '  Time Chords  ' },
        { trait_type: 'Palette', value: 'Solar Mono' },
      ],
      properties: { token_id: 3 },
    })!;
    const entry = normalizeTraitEntry(parsed)!;
    expect(entry.chaos).toBeUndefined();
    expect(entry.structure).toBe('Time Chords');
    expect(entry.hasArtTraits).toBe(true);
  });
});

describe('categorical helpers', () => {
  const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;

  it('collapses the wildcard flag to "Yes"', () => {
    expect(categoricalValue(entry, 'wildcard')).toBe('Yes');
    expect(categoricalValue({ id: 2, hasArtTraits: true }, 'wildcard')).toBeUndefined();
  });

  it('lists only the categorical traits a token carries, in display order', () => {
    expect(presentCategoricalKeys(entry)).toEqual([
      'structure',
      'underlay',
      'symmetry',
      'projection',
      'wildcard',
      'palette',
      'spectralClass',
      'massBalance',
      'fate',
      'allocation',
    ]);
  });
});

describe('normalizeSeed', () => {
  it('lower-cases and strips the 0x prefix', () => {
    expect(normalizeSeed('0xABC')).toBe('abc');
    expect(normalizeSeed(' abc ')).toBe('abc');
    expect(normalizeSeed(7)).toBe('7');
    expect(normalizeSeed('')).toBeUndefined();
    expect(normalizeSeed(null)).toBeUndefined();
  });
});
