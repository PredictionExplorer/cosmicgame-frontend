import en from '@/messages/en/traits.json';
import zh from '@/messages/zh/traits.json';

import { TOKEN_1_METADATA_V2 } from '../__fixtures__/metadata';
import {
  camelTraitKey,
  resolveTraitValueLabel,
  traitProperties,
  type TraitTranslator,
} from '../labels';
import { normalizeTraitEntry } from '../traits';
import { parseCosmicSignatureMetadata } from '../types';

/** Minimal next-intl-like translator over a JSON catalog (ICU `{name}` only). */
function translator(catalog: Record<string, unknown>): TraitTranslator {
  const lookup = (key: string): unknown =>
    key
      .split('.')
      .reduce<unknown>(
        (node, part) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
        catalog,
      );
  const t = ((key: string, values?: Record<string, string | number>) => {
    const message = lookup(key);
    if (typeof message !== 'string') throw new Error(`missing message ${key}`);
    return message.replace(/\{(\w+)\}/g, (_m, name: string) => String(values?.[name] ?? ''));
  }) as TraitTranslator;
  t.has = (key: string) => typeof lookup(key) === 'string';
  return t;
}

const tEn = translator(en);
const tZh = translator(zh);

describe('camelTraitKey', () => {
  it('turns wire labels into catalog keys', () => {
    expect(camelTraitKey('Orbit Ribbons')).toBe('orbitRibbons');
    expect(camelTraitKey('Last CST Gesture')).toBe('lastCstGesture');
    expect(camelTraitKey('Chrono-Warrior')).toBe('chronoWarrior');
    expect(camelTraitKey('B')).toBe('b');
  });
});

describe('resolveTraitValueLabel', () => {
  it('translates closed vocabularies in both locales', () => {
    expect(resolveTraitValueLabel(tEn, 'fate', 'Eternal Dance')).toBe('Eternal Dance');
    expect(resolveTraitValueLabel(tZh, 'fate', 'Eternal Dance')).toBe('永恒之舞');
    expect(resolveTraitValueLabel(tZh, 'massBalance', 'Twin Binary')).toBe('双星并重');
    expect(resolveTraitValueLabel(tZh, 'allocation', 'Endurance Champion')).toBe('坚守冠军');
    expect(resolveTraitValueLabel(tZh, 'structure', 'Orbit Ribbons')).toBe('轨道绸带');
    expect(resolveTraitValueLabel(tZh, 'underlay', 'Nebula Veil')).toBe('星云薄纱');
    expect(resolveTraitValueLabel(tZh, 'projection', 'Hodograph')).toBe('速端曲线');
    expect(resolveTraitValueLabel(tZh, 'finish', 'Prism')).toBe('棱镜');
    expect(resolveTraitValueLabel(tZh, 'wildcard', 'Yes')).toBe('是');
  });

  it('handles the numbered symmetry patterns', () => {
    expect(resolveTraitValueLabel(tEn, 'symmetry', 'Rosette ×4')).toBe('Rosette ×4');
    expect(resolveTraitValueLabel(tZh, 'symmetry', 'Rosette ×4')).toBe('花结 ×4');
    expect(resolveTraitValueLabel(tZh, 'symmetry', 'Mandala ×3')).toBe('曼陀罗 ×3');
    expect(resolveTraitValueLabel(tZh, 'symmetry', 'Mirror')).toBe('镜像');
  });

  it('composes palette names from hue and scheme words', () => {
    expect(resolveTraitValueLabel(tEn, 'palette', 'Glacial Split')).toBe('Glacial Split');
    expect(resolveTraitValueLabel(tZh, 'palette', 'Glacial Split')).toBe('冰川分裂');
    expect(resolveTraitValueLabel(tZh, 'palette', 'Aurora Triad')).toBe('极光三色');
  });

  it('labels spectral classes and describes them', () => {
    expect(resolveTraitValueLabel(tEn, 'spectralClass', 'B')).toBe('Class B');
    expect(resolveTraitValueLabel(tZh, 'spectralClass', 'm')).toBe('M 型');
  });

  it('falls back to the raw value for vocabulary the catalog does not know', () => {
    expect(resolveTraitValueLabel(tZh, 'palette', 'Quasar Mono')).toBe('Quasar Mono');
    expect(resolveTraitValueLabel(tZh, 'palette', 'Solo')).toBe('Solo');
    expect(resolveTraitValueLabel(tZh, 'structure', 'Brand New Vocabulary')).toBe(
      'Brand New Vocabulary',
    );
    expect(resolveTraitValueLabel(tEn, 'spectralClass', 'Z')).toBe('Z');
    expect(resolveTraitValueLabel(tEn, 'wildcard', 'No')).toBe('No');
    expect(resolveTraitValueLabel(tEn, 'fate', '   ')).toBe('   ');
  });
});

describe('traitProperties', () => {
  it('publishes every carried trait as a localized name/value pair', () => {
    const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
    const properties = traitProperties(tZh, entry);
    expect(properties).toEqual(
      expect.arrayContaining([
        { name: '结构', value: '轨道绸带' },
        { name: '变数', value: '是' },
        { name: '光谱型', value: 'B 型' },
        { name: '混沌度', value: 22 },
        { name: '连珠', value: 0 },
        { name: '周期', value: 0 },
        { name: '分配', value: '最后 CST 落笔' },
      ]),
    );
    expect(properties.some((property) => property.name === 'Round')).toBe(false); // lexicon-allow-backend-type
  });
});
