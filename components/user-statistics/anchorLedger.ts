import { toFiniteNumber } from '@/utils/finiteNumber';

/** One ETH Anchor Distribution deposit, as one anchored NFT shared in it. */
export interface NftDeposit {
  depositId: number;
  /** Unix seconds of the deposit. */
  timestamp: number | null;
  txHash: string | null;
  cycle: number | null;
  /** The whole deposit, shared by every NFT anchored at the time. */
  depositEth: number;
  /** How many NFTs were anchored when it was made. */
  anchoredNfts: number;
  /** This NFT's part of it. */
  distributionEth: number;
  retrieved: boolean;
}

/** One anchored Cosmic Signature NFT of an address, with what its anchor has earned. */
export interface AnchoredNftDistributions {
  tokenId: number;
  /** Unix seconds of its latest anchor, when a record of it was read. */
  anchoredAt: number | null;
  retrievedEth: number;
  toRetrieveEth: number;
  /** The deposits it shared in, newest first. */
  deposits: NftDeposit[];
}

type Row = Record<string, unknown>;

const asRow = (value: unknown): Row | null =>
  value && typeof value === 'object' ? (value as Row) : null;

/** The deposits one token shared in, from the address's by-deposit read (each deposit lists its anchors). */
function depositsOf(tokenId: number, byDeposit: readonly unknown[]): NftDeposit[] {
  const out: NftDeposit[] = [];
  for (const raw of byDeposit) {
    const deposit = asRow(raw);
    const actions = deposit?.Actions;
    if (!deposit || !Array.isArray(actions)) continue;
    for (const rawAction of actions) {
      const action = asRow(rawAction);
      // The anchor behind this part of the deposit (the wire field is `Stake`).
      const anchor = asRow(action?.Stake);
      if (!action || toFiniteNumber(anchor?.TokenId) !== tokenId) continue;
      out.push({
        depositId: toFiniteNumber(deposit.DepositId) ?? 0,
        timestamp: toFiniteNumber(deposit.TimeStamp),
        txHash: typeof deposit.TxHash === 'string' && deposit.TxHash ? deposit.TxHash : null,
        cycle: toFiniteNumber(deposit.DepositRoundNum),
        depositEth: toFiniteNumber(deposit.DepositAmountEth) ?? 0,
        anchoredNfts: toFiniteNumber(deposit.NumStakedNFTs) ?? 0,
        distributionEth: toFiniteNumber(action.RewardEth) ?? 0,
        retrieved: action.Claimed === true,
      });
    }
  }
  return out.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0) || b.depositId - a.depositId);
}

/** Unix seconds of a token's latest anchor action (ActionType 0), or null. */
function latestAnchor(tokenId: number, actions: readonly unknown[]): number | null {
  let latest: number | null = null;
  for (const raw of actions) {
    const action = asRow(raw);
    if (!action || action.ActionType !== 0 || toFiniteNumber(action.TokenId) !== tokenId) continue;
    const ts = toFiniteNumber(action.TimeStamp);
    if (ts !== null && ts > 0 && (latest === null || ts > latest)) latest = ts;
  }
  return latest;
}

/**
 * The address's Anchor Distributions as one ledger row per anchored Cosmic
 * Signature NFT: when it was anchored, what it has retrieved and what is left
 * to retrieve (the per-token summary), and the deposits it shared in (from
 * the by-deposit read, which names the anchors each deposit paid). Newest
 * anchor first.
 */
export function anchoredNftDistributions(
  summary: readonly unknown[],
  byDeposit: readonly unknown[],
  anchorActions: readonly unknown[],
): AnchoredNftDistributions[] {
  const rows = summary.flatMap((raw) => {
    const row = asRow(raw);
    const tokenId = toFiniteNumber(row?.TokenId);
    if (!row || tokenId === null || tokenId < 0) return [];
    return [
      {
        tokenId,
        anchoredAt: latestAnchor(tokenId, anchorActions),
        retrievedEth: toFiniteNumber(row.RewardCollectedEth) ?? 0,
        toRetrieveEth: toFiniteNumber(row.RewardToCollectEth) ?? 0,
        deposits: depositsOf(tokenId, byDeposit),
      },
    ];
  });
  return rows.sort(
    (a, b) =>
      (b.anchoredAt ?? Number.NEGATIVE_INFINITY) - (a.anchoredAt ?? Number.NEGATIVE_INFINITY) ||
      b.tokenId - a.tokenId,
  );
}
