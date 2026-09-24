import { zeroAddress } from 'viem';
// The `viem/utils` entry: pure helpers, and the real EIP-55 implementation
// under the jest mock of `viem`, so checksumming is tested for real.
import { getAddress, isAddress } from 'viem/utils';

import type { AppContractAddresses } from '@/config/networks';

/**
 * One address display for the whole app: EIP-55 checksummed, shortened as
 * `0x` + 4 … 4 with a single U+2026 ("0x1Ec1…E990") everywhere an address
 * shares space with other data, and shown in full only in a detail-page
 * header. The short form is one unbreakable word (see `ADDRESS_JOIN`), so it
 * never wraps even where the caller sets no `white-space: nowrap`. Render through `<AddressChip>` (components/ui/address-chip.tsx),
 * which adds the copy button, the `/user` link, `title` with the full
 * address, and labels for protocol contracts.
 *
 * Import from `@/utils/format` (the public entry), not from this module.
 */

/** Hex digits kept on each side of the ellipsis. */
const SHORT_SIDE_LENGTH = 4;

/** U+2026, never "...." (the ellipsis is data typography, the same in every locale). */
const ADDRESS_ELLIPSIS = '…';

/**
 * U+2060 WORD JOINER. Line breaking (UAX #14) forbids a break before an
 * ellipsis but allows one after it, so "0x1Ec1…E990" alone can wrap as
 * "0x1Ec1…" over "E990" in a narrow box. The joiner after the ellipsis makes
 * the short form one unbreakable word. It is invisible, has no width, and is
 * ignored by screen readers; copy buttons copy the full address, never this
 * display string.
 */
const ADDRESS_JOIN = `${ADDRESS_ELLIPSIS}\u2060`;

/** Values shortened around the ellipsis: addresses, hashes, anything 0x-prefixed. */
const HEX_PREFIXED = /^0x/i;

const checksumCache = new Map<string, string>();
const CHECKSUM_CACHE_LIMIT = 2_000;

/**
 * The EIP-55 checksummed form of an address ("0x1ec1…" → "0x1Ec1…"), or the
 * input unchanged when it is not a 20-byte hex address (a hash, an ENS name).
 */
export function checksumAddress(address: string): string {
  const cached = checksumCache.get(address);
  if (cached) return cached;
  if (!isAddress(address, { strict: false })) return address;
  const checksummed = getAddress(address);
  if (checksumCache.size >= CHECKSUM_CACHE_LIMIT) checksumCache.clear();
  checksumCache.set(address, checksummed);
  return checksummed;
}

/** Whether the value is the zero address (the "from" of an imprint, the "to" of a consumption). */
export function isZeroAddress(address: string | null | undefined): boolean {
  return typeof address === 'string' && address.toLowerCase() === zeroAddress;
}

/** Case-insensitive address equality; `false` when either side is empty. */
export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export interface AddressFormatOptions {
  /** `short` (default): "0x1Ec1…E990". `full`: the whole checksummed address. */
  readonly variant?: 'short' | 'full';
}

/**
 * An address (or any 0x-hex value, such as a transaction hash) for display.
 * Addresses are checksummed; values without the 0x prefix (an ENS name) or
 * too short to shorten are returned whole; empty input renders an empty string.
 */
export function formatAddress(
  value: string | null | undefined,
  { variant = 'short' }: AddressFormatOptions = {},
): string {
  if (!value) return '';
  const display = checksumAddress(value.trim());
  if (variant === 'full' || !HEX_PREFIXED.test(display)) return display;
  if (display.length <= 2 + SHORT_SIDE_LENGTH * 2 + 1) return display;
  return `${display.slice(0, 2 + SHORT_SIDE_LENGTH)}${ADDRESS_JOIN}${display.slice(
    -SHORT_SIDE_LENGTH,
  )}`;
}

/**
 * Shortens a hex string (an address or a hash) for display. Delegates to
 * `formatAddress`, so every caller shows the one standard form
 * ("0x1Ec1…E990"); the second argument is ignored and kept only so existing
 * call sites compile.
 *
 * @deprecated Use `<AddressChip>` for addresses in UI, or `formatAddress`.
 */
export function shortenHex(hex: string, _legacyLength?: number): string {
  return formatAddress(hex);
}

/**
 * The catalog label of each protocol contract: `formats` `address.known.<key>`.
 * The keys and names match the /contracts page (`contracts.entries.<key>.name`)
 * in every locale, pinned by utils/__tests__/format-known-addresses.test.ts.
 */
const KNOWN_ADDRESS_LABELS = {
  cosmicGame: 'protocol',
  implementation: 'implementation',
  cosmicToken: 'cst',
  cosmicSignature: 'nft',
  randomWalkNft: 'randomWalk',
  cosmicDao: 'council',
  charity: 'publicGoods',
  marketing: 'outreach',
  prizesWallet: 'allocations',
  stakingCst: 'cosmicAnchor',
  stakingRwalk: 'rwalkAnchor',
} as const satisfies Record<keyof AppContractAddresses, string>;

/** A protocol contract an address can be labelled as (a `formats` `address.known` key). */
export type KnownAddressKey = (typeof KNOWN_ADDRESS_LABELS)[keyof AppContractAddresses];

/**
 * Which protocol contract an address is, if any, so the UI can print
 * "Public Goods Vault" instead of hex; the key is the catalog label
 * (`t(\`address.known.${key}\`)` in the `formats` namespace).
 */
export function findKnownAddress(
  address: string | null | undefined,
  contracts: Partial<AppContractAddresses>,
): KnownAddressKey | null {
  if (!address) return null;
  for (const [contract, label] of Object.entries(KNOWN_ADDRESS_LABELS) as [
    keyof AppContractAddresses,
    KnownAddressKey,
  ][]) {
    if (sameAddress(contracts[contract], address)) return label;
  }
  return null;
}
