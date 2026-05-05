/**
 * Zod schemas for Cosmic Signature backend wire format.
 *
 * Phase 2 ships these in WARN-ONLY mode: `safeValidate` returns the original
 * value unchanged whether the schema matches or not, but reports a Sentry
 * breadcrumb on mismatch so we get telemetry before flipping to hard-throw
 * mode (planned after one week of clean telemetry).
 *
 * Why Zod and not TypeScript alone: the Go API can ship a breaking payload
 * change (renamed field, type widening) that the UI silently destructures as
 * `undefined`, corrupting tables, totals, charts. Zod at the client boundary
 * surfaces those mismatches as structured errors — with field paths — before
 * the bad data reaches a component. The TypeScript types in types.ts remain
 * the ergonomic handle; these schemas are the runtime guardrail.
 *
 * IMPORTANT: field names mirror the Go server response keys and must not be
 * renamed here (same contract as services/api/types.ts).
 */

// lexicon-allow-start: backend wire-format field names mirror the Go server

import { z } from 'zod';

import { reportError } from '@/utils/errors';

/* ------------------------------------------------------------------------- *
 *  Primitive building blocks
 * ------------------------------------------------------------------------- */

const AddressSchema = z.string();
const NumberLike = z.union([z.number(), z.string().transform((s) => Number(s))]);

export const TxInfoSchema = z
  .object({
    EvtLogId: z.number(),
    BlockNum: z.number(),
    TxId: z.number(),
    TxHash: z.string(),
    TimeStamp: z.number(),
    DateTime: z.string().optional(),
  })
  .loose();
export type TxInfoParsed = z.infer<typeof TxInfoSchema>;

/* ------------------------------------------------------------------------- *
 *  Dashboard / Statistics
 * ------------------------------------------------------------------------- */

const AnchoringStatisticsSchema = z
  .object({
    NumActiveStakers: z.number(),
    /** Omitted on RWalk in Go `CGStakeStatsRWalk` (only `CGStakeStatsCST` has deposits / reward tallies). */
    NumDeposits: z.number().optional(),
    /** Omitted on RWalk in Go `CGStakeStatsRWalk`. */
    TotalRewardEth: z.number().optional(),
    /** Present on RandomWalk stats; omitted on CST in the Go `CGStakeStatsCST` struct. */
    TotalTokensMinted: z.number().optional(),
    TotalTokensStaked: z.number(),
    UnclaimedRewardEth: z.number().optional(),
  })
  .loose();

const MainStatsSchema = z
  .object({
    TotalPrizeAwards: z.number().optional(),
    CgPrizeRowCount: z.number().optional(),
    TotalPrizes: z.number().optional(),
    NumCSTokenMints: z.number(),
    TotalRaffleEthDeposits: z.number(),
    TotalCSTConsumedEth: z.number(),
    TotalMktRewardsEth: z.number(),
    NumMktRewards: z.number(),
    TotalRaffleEthWithdrawn: z.number(),
    NumBidsCST: z.number(),
    NumUniqueBidders: z.number(),
    NumUniqueWinners: z.number(),
    NumUniqueDonors: z.number(),
    TotalNamedTokens: z.number(),
    NumUniqueStakersCST: z.number(),
    NumUniqueStakersRWalk: z.number(),
    StakeStatisticsCST: AnchoringStatisticsSchema,
    StakeStatisticsRWalk: AnchoringStatisticsSchema,
  })
  .loose();

const ContractAddressesSchema = z
  .object({
    CosmicGameAddr: AddressSchema,
    CosmicTokenAddr: AddressSchema,
    CosmicSignatureAddr: AddressSchema,
    RandomWalkAddr: AddressSchema,
    CosmicDaoAddr: AddressSchema,
    CharityWalletAddr: AddressSchema,
    ImplementationAddr: AddressSchema.optional(),
    MarketingWalletAddr: AddressSchema,
    PrizesWalletAddr: AddressSchema,
    StakingWalletCSTAddr: AddressSchema,
    StakingWalletRWalkAddr: AddressSchema,
  })
  .loose();

export const DashboardInfoSchema = z
  .object({
    CurNumBids: z.number(),
    CurPrizeAmountEth: z.number(),
    CurBidPriceEth: z.number().optional(),
    CurRoundNum: z.number(),
    PrizeClaimTs: z.number(),
    TsRoundStart: z.number(),
    LastBidderAddr: AddressSchema,
    GestureCostEth: z.number(),
    StakingAmountEth: z.number(),
    MainStats: MainStatsSchema,
    ContractAddrs: ContractAddressesSchema.optional(),
    NumRaffleNFTWinnersBidding: z.number(),
    NumRaffleNFTWinnersStakingRWalk: z.number(),
  })
  .loose();
export type DashboardInfoParsed = z.infer<typeof DashboardInfoSchema>;

/* ------------------------------------------------------------------------- *
 *  Rounds
 * ------------------------------------------------------------------------- */

const RoundStatsSchema = z
  .object({
    TotalBids: z.number(),
    TotalDonatedAmountEth: z.number().optional(),
    TotalDonatedNFTs: z.number().optional(),
    TotalRaffleEthDepositsEth: z.number().optional(),
    TotalRaffleNFTs: z.number().optional(),
    ActivationTime: z.number().optional(),
    DelayDurationBeforeRoundActivation: z.number().optional(),
  })
  .loose();

const StellarSelectionNFTRecipientSchema = z
  .object({
    EvtLogId: z.number().optional(),
    TxHash: z.string().optional(),
    TimeStamp: z.number().optional(),
    RoundNum: z.number().optional(),
    WinnerAddr: AddressSchema.optional(),
    TokenId: z.number().optional(),
    IsRWalk: z.boolean().optional(),
    IsStaker: z.boolean().optional(),
  })
  .loose();

/** Backend round detail sometimes omits tx fields or nests them under `Tx` (see flattenTxArray). */
const StellarSelectionETHDepositSchema = z
  .object({
    EvtLogId: z.number().optional(),
    TxHash: z.string().optional(),
    TimeStamp: z.number().optional(),
    RoundNum: z.number().optional(),
    Amount: z.number().optional(),
    WinnerAddr: AddressSchema.optional(),
    Claimed: z.boolean().optional(),
  })
  .loose();

const AllocationEntrySchema = z
  .object({
    EvtLogId: z.number().optional(),
    RoundNum: z.number().optional(),
    WinnerAddr: AddressSchema.optional(),
    TokenId: z.number().optional(),
    Amount: NumberLike.optional(),
  })
  .loose();

export const RoundInfoSchema = z
  .object({
    RoundNum: z.number(),
    WinnerAddr: AddressSchema,
    AmountEth: z.number(),
    TokenId: z.number(),
    TxHash: z.string(),
    TimeStamp: z.number(),
    DateTime: z.string(),
    RoundStats: RoundStatsSchema,
    RaffleNFTWinners: z.array(StellarSelectionNFTRecipientSchema),
    StakingNFTWinners: z.array(StellarSelectionNFTRecipientSchema),
    RaffleETHDeposits: z.array(StellarSelectionETHDepositSchema),
    AllPrizes: z.array(AllocationEntrySchema),
    CSTAmountEth: z.number(),
    CharityAddress: AddressSchema,
    CharityAmountETH: z.number(),
    StakingDepositAmountEth: z.number(),
    StakingPerTokenEth: z.number(),
    StakingNumStakedTokens: z.number(),
    EnduranceWinnerAddr: AddressSchema,
    LastCstBidderAddr: AddressSchema,
    ChronoWarriorAddr: AddressSchema,
  })
  .loose();
export type RoundInfoParsed = z.infer<typeof RoundInfoSchema>;

/* ------------------------------------------------------------------------- *
 *  Gestures
 * ------------------------------------------------------------------------- */

export const GestureInfoSchema = z
  .object({
    EvtLogId: z.number(),
    BlockNum: z.number(),
    TxId: z.number(),
    TxHash: z.string(),
    TimeStamp: z.number(),
    DateTime: z.string().optional(),
    RoundNum: z.number(),
    BidderAddr: AddressSchema,
    GestureType: z.number(),
    GestureCostEth: z.number(),
    Message: z.string().optional(),
  })
  .loose();
export type GestureInfoParsed = z.infer<typeof GestureInfoSchema>;

/* ------------------------------------------------------------------------- *
 *  Users
 * ------------------------------------------------------------------------- */

export const UserInfoSchema = z
  .object({
    NumBids: z.number(),
    NumPrizes: z.number(),
    MaxBidAmountEth: z.number().optional(),
    MaxWinAmount: z.number().optional(),
  })
  .loose();

export const UserBalanceSchema = z
  .object({
    ETH_Balance: z.string(),
    CosmicTokenBalance: z.string(),
  })
  .loose();

/* ------------------------------------------------------------------------- *
 *  Validation helpers
 * ------------------------------------------------------------------------- */

type Mode = 'warn' | 'throw';

// Default mode is warn-only. Switch to 'throw' after a week of clean
// Sentry telemetry — see services/api/client.ts for the flag.
let currentMode: Mode = 'warn';

export function setValidationMode(mode: Mode): void {
  currentMode = mode;
}

export function getValidationMode(): Mode {
  return currentMode;
}

/**
 * Parse `value` against `schema` and report on mismatch.
 *
 * In 'warn' mode (default): always returns `value` unchanged; logs the
 * first 3 Zod issues to Sentry with a `schemaMismatch:<name>` tag so we
 * can triage without breaking the UI.
 *
 * In 'throw' mode: throws on mismatch. Suitable once telemetry has shown
 * the backend and schemas are aligned.
 */
export function safeValidate<T>(schema: z.ZodType<T>, value: unknown, name: string): unknown {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const issues = result.error.issues.slice(0, 3).map((i) => ({
    path: i.path.join('.') || '<root>',
    message: i.message,
    code: i.code,
  }));

  const summary = `schemaMismatch:${name} — ${issues
    .map((i) => `${i.path}: ${i.message}`)
    .join('; ')}`;

  if (currentMode === 'throw') {
    throw new Error(summary);
  }

  // warn-only: log once to Sentry and pass the raw value through.
  reportError(new Error(summary), `schema:${name}`);
  return value;
}
// lexicon-allow-end
