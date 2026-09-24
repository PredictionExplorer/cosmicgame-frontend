import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { emptyContractAddresses, type AppContractAddresses } from '@/config/networks';
import { routing } from '@/i18n/routing';
import { findKnownAddress, type KnownAddressKey } from '@/utils/format';

/**
 * An address chip labels a protocol contract with `formats.address.known.<key>`
 * ("Public Goods Vault"), and /contracts lists the same contract under
 * `contracts.entries.<key>.name`. They are one name in two namespaces (the
 * chip renders on every page, the contracts catalog only on /contracts), so
 * this pins them equal in every locale: rename both together.
 */
type Catalog = Record<string, unknown>;

function catalog(locale: string, namespace: string): Catalog {
  const path = join(__dirname, '..', '..', 'messages', locale, `${namespace}.json`);
  return JSON.parse(readFileSync(path, 'utf8')) as Catalog;
}

/** Every label key `findKnownAddress` can return, one per contract slot. */
const KNOWN_KEYS: readonly KnownAddressKey[] = (
  Object.keys(emptyContractAddresses()) as (keyof AppContractAddresses)[]
).map((contract, index) => {
  const address = `0x${(index + 1).toString(16).padStart(40, '0')}`;
  const key = findKnownAddress(address, { ...emptyContractAddresses(), [contract]: address });
  if (!key) throw new Error(`no known-address label for ${contract}`);
  return key;
});

describe.each(routing.locales)('known-address labels in %s', (locale) => {
  const known = (catalog(locale, 'formats').address as { known: Record<string, string> }).known;
  const entries = catalog(locale, 'contracts').entries as Record<string, { name: string }>;

  it('has a label for every protocol contract, and nothing else', () => {
    expect(Object.keys(known).sort()).toEqual([...KNOWN_KEYS].sort());
  });

  it.each(KNOWN_KEYS)('names %s exactly as the /contracts page does', (key) => {
    expect(entries[key]?.name).toBeDefined();
    expect(known[key]).toBe(entries[key]?.name);
  });
});
