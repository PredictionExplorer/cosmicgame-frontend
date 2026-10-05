import { getAddress, isAddress } from 'viem';

import { formatAddress } from '@/utils/format';
import { get_cst_transfers, get_ct_transfers } from '@/services/api/tokens';

import type { TransferAsset } from './AddressTransferHistory';

/*
 * The server half of the two transfer-history routes
 * (/cosmic-token-transfer/[address] and /cosmic-signature-transfer/[address]):
 * the address their tab titles name and the first read of the ledger.
 * Server-only.
 */

/** The React Query key of each history's client hook (hooks/useApiQuery.ts). */
const QUERY_KEY: Record<TransferAsset, string> = {
  cst: 'ctTransfers',
  nft: 'cstTransfers',
};

/**
 * The fields the ledger reads from each row (AddressTransferHistory), per
 * history. The seed carries only these: a busy address's history is embedded
 * in the page whole (the header's totals and the filters need every row),
 * and the API's other fields (block and record ids, account ids, the
 * transfer type, an ISO date beside the timestamp) doubled its weight.
 */
const LEDGER_FIELDS: Record<TransferAsset, readonly string[]> = {
  cst: ['EvtLogId', 'TxHash', 'TimeStamp', 'FromAddr', 'ToAddr', 'Value', 'ValueFloat'],
  nft: ['EvtLogId', 'TxHash', 'TimeStamp', 'FromAddr', 'ToAddr', 'TokenId'],
};

/** A row cut down to the fields the ledger reads. */
export function ledgerRow(asset: TransferAsset, row: object): Record<string, unknown> {
  const record = row as Record<string, unknown>;
  return Object.fromEntries(
    LEDGER_FIELDS[asset].filter((field) => field in record).map((field) => [field, record[field]]),
  );
}

/** The checksummed address of a route param, or null for an invalid one. */
function routeAddress(raw: string): `0x${string}` | null {
  return isAddress(raw, { strict: false }) ? getAddress(raw) : null;
}

/** A route param as the tab title names it: the short address, or the param as given. */
export function transferHistoryAddress(raw: string): string {
  const address = routeAddress(raw);
  return address ? formatAddress(address) : raw;
}

/**
 * The ledger's first read, keyed as its client query is, so the ISR page
 * arrives with the history in its HTML instead of a skeleton that the list
 * then pushes down; each row carries only the fields the ledger reads
 * (`ledgerRow`). An invalid address or a failed read seeds nothing.
 */
export async function readTransferHistorySeed(
  asset: TransferAsset,
  raw: string,
): Promise<{ queryKey: readonly unknown[]; data: unknown; at: number }[]> {
  const address = routeAddress(raw);
  if (!address) return [];
  try {
    const rows =
      asset === 'cst' ? await get_ct_transfers(address) : await get_cst_transfers(address);
    const data = rows.map((row) => ledgerRow(asset, row));
    return [{ queryKey: [QUERY_KEY[asset], address], data, at: Date.now() }];
  } catch {
    return [];
  }
}
