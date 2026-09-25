import { get_cst_info, get_name_history, get_named_nfts } from '@/services/api/tokens';
import type { ApiRequestOptions } from '@/services/api/client';
import type { NameHistoryRecord } from '@/services/api/types';

/*
 * The named Signatures wall's data, shared by the server (which seeds the
 * first paint) and the client (which refreshes it). A server component
 * cannot read values from a 'use client' module, so nothing here is one.
 */

/** One named Signature, with the record of its current name. */
export interface NamedSignature {
  tokenId: number;
  name: string;
  seed: string | number | null;
  anchored: boolean;
  /** When the token was imprinted (unix seconds). */
  imprintedAt: number | null;
  /** When its current name was written (unix seconds), by whom, and the proof. */
  namedAt: number | null;
  namedBy: string | null;
  namedTx: string | null;
}

/** The React Query key the server seeds and `useNamedWall` reads. */
export const NAMED_WALL_QUERY_KEY = ['namedWall'] as const;

/** The name-history record that set the current name: the latest one. */
export function currentNaming(history: readonly NameHistoryRecord[]): NameHistoryRecord | null {
  let latest: NameHistoryRecord | null = null;
  for (const record of history) {
    if (
      !latest ||
      (record.TimeStamp ?? 0) > (latest.TimeStamp ?? 0) ||
      ((record.TimeStamp ?? 0) === (latest.TimeStamp ?? 0) &&
        (record.EvtLogId ?? 0) > (latest.EvtLogId ?? 0))
    ) {
      latest = record;
    }
  }
  return latest;
}

/** Most recently named first; a name whose record could not be read goes last. */
export function newestNamedFirst(rows: readonly NamedSignature[]): NamedSignature[] {
  return [...rows].sort((a, b) => (b.namedAt ?? -1) - (a.namedAt ?? -1) || b.tokenId - a.tokenId);
}

/**
 * The named Signatures with what their wall labels show: the name list, then
 * for each named token its record (seed, anchored state) and its name
 * history (when it was named, by whom). Only the named tokens are read, so
 * the page never carries the whole collection to find a few seeds. A token
 * whose record or history cannot be read still hangs, without those facts;
 * a name list that cannot be read rejects, so the wall says so.
 */
export async function readNamedWall(opts: ApiRequestOptions = {}): Promise<NamedSignature[]> {
  const named = await get_named_nfts(opts);
  const rows = await Promise.all(
    named.map(async (token): Promise<NamedSignature> => {
      const [info, history] = await Promise.all([
        get_cst_info(token.TokenId, opts).catch(() => null),
        get_name_history(token.TokenId, opts).catch((): NameHistoryRecord[] => []),
      ]);
      const naming = currentNaming(history);
      return {
        tokenId: token.TokenId,
        name: (token.TokenName ?? info?.TokenName ?? naming?.TokenName ?? '').trim(),
        seed: info?.Seed ?? null,
        anchored: Boolean(info?.Staked),
        imprintedAt: token.MintTimeStamp ?? info?.MintTimeStamp ?? null,
        namedAt: naming?.TimeStamp ?? null,
        namedBy: typeof naming?.ChangedBy === 'string' ? naming.ChangedBy : null,
        namedTx: naming?.TxHash ?? null,
      };
    }),
  );
  return newestNamedFirst(rows);
}
