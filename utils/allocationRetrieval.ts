/**
 * What a wallet can retrieve from PrizesWallet, and by when: the pure rules
 * behind My Allocations' summary, its one "Retrieve everything" transaction
 * and every deadline badge. No React, so each rule is tested on its own
 * (utils/__tests__/allocationRetrieval.test.ts).
 *
 * PrizesWallet keeps one ETH balance per cycle and recipient, whatever
 * deposited it (Stellar Selection, Chrono-Warrior), so ETH is retrieved by
 * cycle number; attached NFTs by their PrizesWallet index; attached ERC-20
 * tokens by cycle, token and raw base-unit amount. `withdrawEverything`
 * takes all three lists in one transaction.
 */

import {
  getDonatedErc20RawClaimAmount,
  type DonatedErc20ClaimAmountSource,
} from '@/utils/donatedErc20';
import { toFiniteNumber } from '@/utils/finiteNumber';

/** A deadline this close reads as "soon" (attention), in seconds. */
export const DEADLINE_SOON_SECONDS = 7 * 24 * 60 * 60;

/** One ETH deposit of a wallet, as the deposits APIs return it. */
export interface EthDepositRow {
  RoundNum?: number;
  Amount?: number;
  Claimed?: boolean;
  /** The stellar-selection wallet holding the deposit (older backends omit it). */
  WalletAddr?: string;
}

/** One attached NFT waiting in PrizesWallet. */
export interface AttachedNftRow {
  /** PrizesWallet's index of the NFT: what `claimDonatedNft` takes. */
  Index?: number;
  RoundNum?: number;
  /** The stellar-selection wallet holding the NFT (older backends omit it). */
  WalletAddr?: string;
}

/** One attached ERC-20 row of a wallet (retrieved rows included). */
export interface AttachedTokenRow extends DonatedErc20ClaimAmountSource {
  RoundNum: number;
  TokenAddr: string;
  Claimed?: boolean;
  /** The stellar-selection wallet holding the tokens (older backends omit it). */
  WalletAddr?: string;
}

/** One ERC-20 entry of `withdrawEverything` / `claimManyDonatedTokens`. */
export interface TokenClaim {
  roundNum: number;
  tokenAddress: string;
  /** Raw base units, never a display amount. */
  amount: string;
  /**
   * The stellar-selection wallet holding the tokens; routing data only, and
   * never part of the encoded call (strip before building contract args).
   */
  walletAddr?: string;
}

/** The `withdrawEverything` lists for one holding wallet. */
export interface WalletRetrievalPlan {
  /**
   * The stellar-selection wallet holding these items; `undefined` targets
   * the currently configured wallet (rows from a backend that predates
   * multi-wallet support carry no address).
   */
  walletAddr?: string;
  /** Distinct cycles with unretrieved ETH, ascending. */
  ethRounds: number[];
  /** PrizesWallet indexes of the attached NFTs, ascending. */
  nftIndexes: number[];
  tokenClaims: TokenClaim[];
  /** Every cycle an item of this wallet belongs to: its deadlines live on this wallet. */
  rounds: number[];
}

/** Everything "Retrieve everything" would retrieve, over every holding wallet. */
export interface RetrievalPlan {
  /** Distinct cycles with unretrieved ETH, ascending. */
  ethRounds: number[];
  /** The ETH those cycles hold, or `null` when an amount could not be read. */
  ethAmount: number | null;
  /** PrizesWallet indexes of the attached NFTs, ascending. */
  nftIndexes: number[];
  tokenClaims: TokenClaim[];
  /** Every cycle an item belongs to: the deadlines that apply. */
  rounds: number[];
  /**
   * One `withdrawEverything` per holding wallet. The game can be pointed at
   * a replacement wallet; assets deposited into a superseded wallet stay
   * there until retrieved, so each wallet takes its own transaction.
   */
  walletPlans: WalletRetrievalPlan[];
  /** Nothing to retrieve from PrizesWallet. */
  isEmpty: boolean;
}

function isCycleNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/**
 * Distinct cycle numbers, ascending. PrizesWallet holds one ETH balance per
 * cycle, so two deposits of the same cycle are one withdrawal: listing the
 * cycle twice would only spend gas on an empty second withdrawal.
 */
export function uniqueRounds(rounds: readonly (number | null | undefined)[]): number[] {
  return [...new Set(rounds.filter(isCycleNumber))].sort((a, b) => a - b);
}

/** Identifies an attached token for its row's pending state. */
export function tokenClaimKey(roundNum: number, tokenAddress: string): string {
  return `${roundNum}:${tokenAddress.toLowerCase()}`;
}

/** A value long enough to be an address; shorter ones fall back to the current wallet. */
const MIN_WALLET_ADDRESS_LENGTH = 10;

/** The grouping key of a holding wallet; `''` is the currently configured wallet. */
function holdingWalletKey(walletAddr: string | undefined): string {
  return walletAddr && walletAddr.length >= MIN_WALLET_ADDRESS_LENGTH
    ? walletAddr.toLowerCase()
    : '';
}

/**
 * Groups rows by the stellar-selection wallet contract holding them, keeping
 * first-seen order. Rows without a wallet address (older backend responses)
 * fall into the default group, which targets the currently configured
 * wallet; addresses differing only in case share one group.
 */
export function groupByHoldingWallet<T extends { walletAddr?: string }>(
  rows: readonly T[],
): { walletAddr?: string; rows: T[] }[] {
  const order: string[] = [];
  const buckets = new Map<string, { walletAddr?: string; rows: T[] }>();
  for (const row of rows) {
    const key = holdingWalletKey(row.walletAddr);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { ...(key ? { walletAddr: row.walletAddr } : {}), rows: [] };
      buckets.set(key, bucket);
      order.push(key);
    }
    bucket.rows.push(row);
  }
  return order.map((key) => buckets.get(key)!);
}

/** The attached ERC-20 tokens still to retrieve, with raw base-unit amounts. */
export function unretrievedTokenClaims(rows: readonly AttachedTokenRow[]): TokenClaim[] {
  return rows
    .filter((row) => !row.Claimed && isCycleNumber(row.RoundNum) && Boolean(row.TokenAddr))
    .map((row) => ({
      roundNum: row.RoundNum,
      tokenAddress: row.TokenAddr,
      amount: getDonatedErc20RawClaimAmount(row),
      ...(row.WalletAddr ? { walletAddr: row.WalletAddr } : {}),
    }));
}

/**
 * The plan for one "Retrieve everything" transaction, from what the indexer
 * reports as unretrieved. Rows already marked retrieved are left out.
 */
export function buildRetrievalPlan({
  deposits,
  nfts,
  tokens,
}: {
  deposits: readonly EthDepositRow[];
  nfts: readonly AttachedNftRow[];
  tokens: readonly AttachedTokenRow[];
}): RetrievalPlan {
  const openDeposits = deposits.filter((row) => !row.Claimed && isCycleNumber(row.RoundNum));
  const amounts = openDeposits.map((row) => toFiniteNumber(row.Amount));
  const ethAmount = amounts.some((amount) => amount === null)
    ? null
    : amounts.reduce<number>((total, amount) => total + (amount ?? 0), 0);
  const ethRounds = uniqueRounds(openDeposits.map((row) => row.RoundNum));
  const openNfts = nfts.filter((row): row is AttachedNftRow & { Index: number } =>
    isCycleNumber(row.Index),
  );
  const nftIndexes = [...new Set(openNfts.map((row) => row.Index))].sort((a, b) => a - b);
  const tokenClaims = unretrievedTokenClaims(tokens);
  const rounds = uniqueRounds([
    ...ethRounds,
    ...openNfts.map((row) => row.RoundNum),
    ...tokenClaims.map((claim) => claim.roundNum),
  ]);

  // One withdrawEverything per holding wallet: items deposited before a
  // wallet switch can only be retrieved from the wallet that received them.
  interface WalletAccumulator {
    walletAddr?: string;
    ethRounds: (number | undefined)[];
    nftIndexes: number[];
    tokenClaims: TokenClaim[];
    rounds: (number | undefined)[];
  }
  const walletOrder: string[] = [];
  const walletPlanByKey = new Map<string, WalletAccumulator>();
  const planFor = (walletAddr: string | undefined): WalletAccumulator => {
    const key = holdingWalletKey(walletAddr);
    let plan = walletPlanByKey.get(key);
    if (!plan) {
      plan = {
        ...(key ? { walletAddr } : {}),
        ethRounds: [],
        nftIndexes: [],
        tokenClaims: [],
        rounds: [],
      };
      walletPlanByKey.set(key, plan);
      walletOrder.push(key);
    }
    return plan;
  };
  for (const row of openDeposits) {
    const plan = planFor(row.WalletAddr);
    plan.ethRounds.push(row.RoundNum);
    plan.rounds.push(row.RoundNum);
  }
  for (const row of openNfts) {
    const plan = planFor(row.WalletAddr);
    plan.nftIndexes.push(row.Index);
    plan.rounds.push(row.RoundNum);
  }
  for (const claim of tokenClaims) {
    const plan = planFor(claim.walletAddr);
    plan.tokenClaims.push(claim);
    plan.rounds.push(claim.roundNum);
  }
  const walletPlans: WalletRetrievalPlan[] = walletOrder.map((key) => {
    const plan = walletPlanByKey.get(key)!;
    return {
      ...(plan.walletAddr ? { walletAddr: plan.walletAddr } : {}),
      ethRounds: uniqueRounds(plan.ethRounds),
      nftIndexes: [...new Set(plan.nftIndexes)].sort((a, b) => a - b),
      tokenClaims: plan.tokenClaims,
      rounds: uniqueRounds(plan.rounds),
    };
  });

  return {
    ethRounds,
    ethAmount,
    nftIndexes,
    tokenClaims,
    rounds,
    walletPlans,
    isEmpty: ethRounds.length === 0 && nftIndexes.length === 0 && tokenClaims.length === 0,
  };
}

/** Where a retrieval deadline stands. */
export type DeadlineState = 'unknown' | 'open' | 'soon' | 'expired';

/**
 * `soon` within {@link DEADLINE_SOON_SECONDS} of the deadline, `expired`
 * once it has passed (anyone may then retrieve the item on the recipient's
 * behalf), `unknown` while the deadline or the clock is not known.
 */
export function deadlineState(
  deadline: number | null | undefined,
  nowSeconds: number,
): DeadlineState {
  if (!deadline || deadline <= 0 || nowSeconds <= 0) return 'unknown';
  if (deadline <= nowSeconds) return 'expired';
  return deadline - nowSeconds <= DEADLINE_SOON_SECONDS ? 'soon' : 'open';
}

/**
 * The deadline a summary shows: the earliest one still ahead, else the most
 * recent one that has passed, else `null` when none is known.
 */
export function nextDeadline(
  deadlines: readonly (number | null | undefined)[],
  nowSeconds: number,
): number | null {
  const known = deadlines.filter((deadline): deadline is number => !!deadline && deadline > 0);
  if (known.length === 0) return null;
  const ahead = known.filter((deadline) => deadline > nowSeconds);
  return ahead.length > 0 ? Math.min(...ahead) : Math.max(...known);
}
