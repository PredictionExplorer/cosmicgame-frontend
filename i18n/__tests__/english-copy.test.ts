import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { NAMESPACES } from '../request';
import { routing } from '../routing';

/**
 * Copy rules from docs/design-system.md → Copy that a machine can check.
 *
 * - "Random Walk NFT" is two words in every locale; `RandomWalk` is the
 *   contract's name only.
 * - In English the common noun "gesture" is lower case after the start of a
 *   sentence ("Make a gesture", "ETH and CST gestures"). The named quantities
 *   and roles keep their capitals: Gesture Cost, Gesture Chat, the Last
 *   Gesture, the Final CST Gesture.
 *
 * The allowlists hold strings another change still owned when the rules
 * landed. They may only shrink: fix a string, then delete its entry.
 */

type Catalog = { [key: string]: string | Catalog };

function flatten(catalog: Catalog, prefix = ''): [string, string][] {
  return Object.entries(catalog).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[`${prefix}${key}`, value] as [string, string]]
      : flatten(value, `${prefix}${key}.`),
  );
}

function readCatalog(locale: string, namespace: string): [string, string][] {
  const path = resolve(process.cwd(), 'messages', locale, `${namespace}.json`);
  return flatten(JSON.parse(readFileSync(path, 'utf8')) as Catalog);
}

/** The contract's own name, shown where the contracts are listed. */
const CONTRACT_NAMES = new Set([
  'contracts:entries.randomWalk.name',
  'formats:address.known.randomWalk',
]);

/**
 * Strings (namespace:key, in every locale) that another change was rewriting
 * when the rules landed, left for it to finish.
 */
const RANDOM_WALK_ALLOWLIST = new Set([
  'contracts:entries.randomWalk.description',
  'statistics:anchoringTooltips.rwlkActiveAnchorHolders',
  'statistics:anchoringTooltips.rwlkTotalTokensImprinted',
  'statistics:usedRwlkNfts.artAlt',
  'statistics:usedRwlkNfts.emptyDescription',
  'statistics:usedRwlkNfts.emptyTitle',
  'statistics:usedRwlkNfts.loadError',
  'statistics:usedRwlkNfts.loadErrorTitle',
]);

const CAPITALISED_GESTURE_ALLOWLIST = new Set([
  // Title Case page titles and the tagline, awaiting the sentence-case sweep.
  'meta:shared.defaultOgTitle',
  'meta:statistics.title',
  'meta:howItWorks.title',
  'seo:og.default.alt',
  'seo:og.default.title',
  // The ETH Calibration Window that closes at the first gesture.
  'home:calibration.firstGestureTitle',
]);

/** A capitalised common-noun gesture: not the role or a named quantity. */
function capitalisedGestures(value: string): string[] {
  const found: string[] = [];
  for (const match of value.matchAll(/(?<=[a-z,;:)+] |(?:ETH|CST) )Gestures?\b/g)) {
    const before = value.slice(0, match.index);
    const after = value.slice(match.index + match[0].length);
    if (/(?:Last|Final|Final CST|Final ETH|Last CST) $/.test(before)) continue;
    if (/^(?: Cost| Chat|-Cost)/.test(after)) continue;
    found.push(value.slice(Math.max(0, match.index - 20), match.index + match[0].length));
  }
  return found;
}

describe('copy conventions', () => {
  it('spells Random Walk NFT as two words in every locale', () => {
    const offenders: string[] = [];
    for (const locale of routing.locales) {
      for (const namespace of NAMESPACES) {
        for (const [key, value] of readCatalog(locale, namespace)) {
          const id = `${namespace}:${key}`;
          if (!/RandomWalk(?![A-Za-z])/.test(value)) continue;
          if (CONTRACT_NAMES.has(id) || RANDOM_WALK_ALLOWLIST.has(id)) continue;
          offenders.push(`${locale}/${id}: ${value}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('writes the common noun gesture in lower case in English', () => {
    const offenders: string[] = [];
    for (const namespace of NAMESPACES) {
      for (const [key, value] of readCatalog(routing.defaultLocale, namespace)) {
        const id = `${namespace}:${key}`;
        if (CAPITALISED_GESTURE_ALLOWLIST.has(id)) continue;
        for (const hit of capitalisedGestures(value)) offenders.push(`${id}: …${hit}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps every allowlisted string still in need of its fix', () => {
    const english = (id: string) => {
      const [namespace, key] = id.split(':') as [string, string];
      return new Map(readCatalog(routing.defaultLocale, namespace)).get(key) ?? '';
    };
    const stale = [
      ...[...RANDOM_WALK_ALLOWLIST].filter((id) =>
        routing.locales.every((locale) => {
          const [namespace, key] = id.split(':') as [string, string];
          return !/RandomWalk/.test(new Map(readCatalog(locale, namespace)).get(key) ?? '');
        }),
      ),
      ...[...CAPITALISED_GESTURE_ALLOWLIST].filter(
        (id) => capitalisedGestures(english(id)).length === 0,
      ),
    ];
    expect(stale).toEqual([]);
  });
});
