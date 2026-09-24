import { protocolFacts } from '@/content/protocol-facts';
import { ABOUT_RESOURCE_HREFS } from '@/content/about/types';

/**
 * The official addresses the Security page lists, locale-independent. The
 * copy files name and describe them; the values live only here and in
 * `protocolFacts`.
 */

export const OFFICIAL_WEBSITES = [
  { id: 'app', host: 'app.cosmicsignature.com', href: 'https://app.cosmicsignature.com' },
  { id: 'landing', host: 'cosmicsignature.com', href: 'https://cosmicsignature.com' },
] as const;

export type OfficialWebsiteId = (typeof OFFICIAL_WEBSITES)[number]['id'];

export const OFFICIAL_COMMUNITY = [
  { id: 'x', handle: '@CosmicSignature', href: ABOUT_RESOURCE_HREFS.x },
  { id: 'discord', handle: 'discord.gg/bGnPn96Qwt', href: ABOUT_RESOURCE_HREFS.discord },
] as const;

export type OfficialCommunityId = (typeof OFFICIAL_COMMUNITY)[number]['id'];

/**
 * The core contracts, named by their `contracts` catalog entry (the same
 * names as /contracts). Each was an exact match on Sourcify for Arbitrum One
 * (chain 42161) when checked on `SOURCIFY_CHECKED`
 * (sourcify.dev/server/v2/contract/42161/<address>: `"match":"exact_match"`).
 */
export const OFFICIAL_CONTRACTS = [
  { id: 'protocol', address: protocolFacts.contractAddresses.proxy },
  { id: 'implementation', address: protocolFacts.contractAddresses.implementation },
  { id: 'cst', address: protocolFacts.contractAddresses.cstToken },
  { id: 'nft', address: protocolFacts.contractAddresses.cosmicSignatureNft },
  { id: 'randomWalk', address: protocolFacts.contractAddresses.randomWalkNft },
] as const;

export type OfficialContractId = (typeof OFFICIAL_CONTRACTS)[number]['id'];

export const SOURCIFY_CHECKED = '2026-09-24';

/**
 * Every published contract address that is an exact match on Sourcify
 * (checked on `SOURCIFY_CHECKED`). Pages show a Sourcify link only for an
 * address in this set, so an address the API returns after an upgrade is
 * never labelled verified without a new check.
 */
export const SOURCIFY_EXACT_MATCH: ReadonlySet<string> = new Set(
  Object.values(protocolFacts.contractAddresses).map((address) => address.toLowerCase()),
);

export const ARBITRUM_ONE_CHAIN_ID = 42161;

/** The Sourcify file view of a contract on Arbitrum One. */
export function sourcifyContractUrl(address: string): string {
  return `https://repo.sourcify.dev/${ARBITRUM_ONE_CHAIN_ID}/${address}`;
}

/** Whether an address is one of the Sourcify-verified contracts above. */
export function isSourcifyVerified(address: string | null | undefined): boolean {
  return Boolean(address) && SOURCIFY_EXACT_MATCH.has(String(address).toLowerCase());
}
