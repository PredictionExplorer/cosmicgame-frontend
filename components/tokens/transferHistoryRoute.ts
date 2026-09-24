import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAddress, isAddress } from 'viem';

import { formatAddress } from '@/utils/format';
import { createPageMetadata } from '@/utils/seo';
import { get_cst_transfers, get_ct_transfers } from '@/services/api/tokens';

import type { TransferAsset } from './AddressTransferHistory';

/*
 * The server half of the two transfer-history routes
 * (/cosmic-token-transfer/[address] and /cosmic-signature-transfer/[address]):
 * their metadata and the first read of the ledger. Server-only.
 */

const ROUTE_PATH: Record<TransferAsset, string> = {
  cst: '/cosmic-token-transfer',
  nft: '/cosmic-signature-transfer',
};

/** The React Query key of each history's client hook (hooks/useApiQuery.ts). */
const QUERY_KEY: Record<TransferAsset, string> = {
  cst: 'ctTransfers',
  nft: 'cstTransfers',
};

/** The checksummed address of a route param, or null for an invalid one. */
function routeAddress(raw: string): `0x${string}` | null {
  return isAddress(raw, { strict: false }) ? getAddress(raw) : null;
}

/**
 * The tab title names the history and whose it is ("CST transfers ·
 * 0xA169…63B6"), the same words as the H1, so two addresses' tabs can be told
 * apart; the description is the page's lede.
 */
export async function transferHistoryMetadata(
  asset: TransferAsset,
  { locale, address: raw }: { locale: string; address: string },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'myPages.transferHistory' });
  const address = routeAddress(raw);
  const title = address
    ? `${t(`${asset}.title`)} · ${formatAddress(address)}`
    : t(`${asset}.title`);
  return createPageMetadata(
    parent,
    title,
    t(`${asset}.lede`),
    undefined,
    `${ROUTE_PATH[asset]}/${raw}`,
    { index: false, locale },
  );
}

/**
 * The ledger's first read, keyed as its client query is, so the ISR page
 * arrives with the history in its HTML instead of a skeleton that the list
 * then pushes down. An invalid address or a failed read seeds nothing.
 */
export async function readTransferHistorySeed(
  asset: TransferAsset,
  raw: string,
): Promise<{ queryKey: readonly unknown[]; data: unknown; at: number }[]> {
  const address = routeAddress(raw);
  if (!address) return [];
  try {
    const data =
      asset === 'cst' ? await get_ct_transfers(address) : await get_cst_transfers(address);
    return [{ queryKey: [QUERY_KEY[asset], address], data, at: Date.now() }];
  } catch {
    return [];
  }
}
